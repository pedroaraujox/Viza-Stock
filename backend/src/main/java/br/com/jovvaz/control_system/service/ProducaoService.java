package br.com.jovvaz.control_system.service;

import br.com.jovvaz.control_system.dto.ComponenteDTO;
import br.com.jovvaz.control_system.dto.ProdutoAcabadoRequestDTO;
import br.com.jovvaz.control_system.model.FichaTecnica;
import br.com.jovvaz.control_system.model.FichaTecnicaComponente;
import br.com.jovvaz.control_system.model.Produto;
import br.com.jovvaz.control_system.model.TipoProduto;
import br.com.jovvaz.control_system.repository.FichaTecnicaRepository;
import br.com.jovvaz.control_system.repository.ProdutoRepository;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.util.Optional;
import java.util.List;

@Service
public class ProducaoService {

    private final ProdutoRepository produtoRepository;
    private final FichaTecnicaRepository fichaTecnicaRepository;
    private final EstoqueService estoqueService;

    public ProducaoService(ProdutoRepository produtoRepository, FichaTecnicaRepository fichaTecnicaRepository, EstoqueService estoqueService) {
        this.produtoRepository = produtoRepository;
        this.fichaTecnicaRepository = fichaTecnicaRepository;
        this.estoqueService = estoqueService;
    }

    @Transactional
    public FichaTecnica criarProdutoAcabadoComFichaTecnica(ProdutoAcabadoRequestDTO dto) {
        // Validar componentes
        if (dto.getComponentes() == null || dto.getComponentes().isEmpty()) {
            throw new IllegalArgumentException("Produto Acabado deve ter pelo menos um componente.");
        }

        // Se o produto já existir, usa o existente; senão, cria um novo
        Produto produtoAcabado = produtoRepository.findById(dto.getId())
                .map(produtoExistente -> {
                    // Verificar se o produto existente é do tipo correto
                    if (produtoExistente.getTipo() != TipoProduto.PRODUTO_ACABADO) {
                        throw new IllegalArgumentException("Produto com ID " + dto.getId() + " não é um produto acabado.");
                    }
                    return produtoExistente;
                })
                .orElseGet(() -> {
                    // Criar novo produto acabado
                    Produto novo = new Produto(
                            dto.getId(),
                            dto.getNome(),
                            dto.getDesc(),
                            TipoProduto.PRODUTO_ACABADO,
                            dto.getUnidadeMedida()
                    );
                    return produtoRepository.save(novo);
                });

        // Garantir que o produto está persistido e gerenciado pelo EntityManager
        produtoAcabado = produtoRepository.save(produtoAcabado);

        // Buscar ficha técnica existente ou criar nova
        Optional<FichaTecnica> fichaExistenteOpt = fichaTecnicaRepository.findByProdutoAcabadoId(produtoAcabado.getId());
        FichaTecnica ficha;
        
        if (fichaExistenteOpt.isPresent()) {
            ficha = fichaExistenteOpt.get();
            // Limpar componentes antigos (orphanRemoval cuidará da remoção no banco)
            ficha.getComponentes().clear();
        } else {
            // Criar nova ficha técnica
            ficha = new FichaTecnica(produtoAcabado);
            // Garantir que o ID está definido
            if (ficha.getId() == null || ficha.getId().isEmpty()) {
                ficha.setId("FT-" + produtoAcabado.getId());
            }
        }

        // Adicionar novos componentes
        for (ComponenteDTO compDTO : dto.getComponentes()) {
            if (compDTO.getMateriaPrimaId() == null || compDTO.getMateriaPrimaId().trim().isEmpty()) {
                throw new IllegalArgumentException("ID da matéria-prima não pode ser nulo ou vazio.");
            }
            
            Produto materiaPrima = produtoRepository.findById(compDTO.getMateriaPrimaId())
                    .orElseThrow(() -> new EntityNotFoundException("Matéria-prima não encontrada com ID: " + compDTO.getMateriaPrimaId()));
            
            if (compDTO.getQuantidade() <= 0) {
                throw new IllegalArgumentException("Quantidade do componente deve ser maior que zero.");
            }
            
            ficha.adicionarComponente(materiaPrima, compDTO.getQuantidade());
        }

        // Garantir que o vínculo do produto acabado está correto
        ficha.setProdutoAcabado(produtoAcabado);

        // Salvar e retornar a ficha técnica
        // O @Transactional garante que tudo será persistido ao final da transação
        return fichaTecnicaRepository.save(ficha);
    }

    public boolean verificarViabilidadeProducao(String produtoAcabadoId, double quantidadeProduzir) {
        FichaTecnica fichaTecnica = fichaTecnicaRepository.findByProdutoAcabadoId(produtoAcabadoId)
                .orElseThrow(() -> new IllegalArgumentException("Ficha técnica não encontrada para o produto ID: " + produtoAcabadoId));

        for (FichaTecnicaComponente componente : fichaTecnica.getComponentes()) {
            Produto materiaPrima = componente.getMateriaPrima();
            double quantidadeNecessariaPorUnidade = componente.getQuantidade();
            double quantidadeTotalNecessaria = quantidadeNecessariaPorUnidade * quantidadeProduzir;

            System.out.println("Verificando componente: " + materiaPrima.getNome());
            System.out.println("-> Necessário por unidade: " + quantidadeNecessariaPorUnidade);
            System.out.println("-> Total Necessário: " + quantidadeTotalNecessaria);

            Optional<Produto> materiaPrimaEstoqueOpt = produtoRepository.findById(materiaPrima.getId());
            Produto materiaPrimaEstoque = materiaPrimaEstoqueOpt
                    .orElseThrow(() -> new IllegalStateException("Componente " + materiaPrima.getNome() + " não cadastrado no estoque."));

            System.out.println("-> Estoque atual: " + materiaPrimaEstoque.getQuantidadeEmEstoque());

            if (materiaPrimaEstoque.getQuantidadeEmEstoque() < quantidadeTotalNecessaria) {
                throw new IllegalStateException("Estoque insuficiente para " + materiaPrima.getNome() + ". Necessário: " + quantidadeTotalNecessaria + ", Disponível: " + materiaPrimaEstoque.getQuantidadeEmEstoque());
            }
        }
        return true;
    }

    public List<FichaTecnica> listarFichasTecnicas() {
        return fichaTecnicaRepository.findAll();
    }

    public Optional<FichaTecnica> buscarFichaTecnicaPorProdutoId(String produtoAcabadoId) {
        return fichaTecnicaRepository.findByProdutoAcabadoId(produtoAcabadoId);
    }

    @Transactional
    public void executarOrdemDeProducao(String produtoAcabadoId, double quantidadeProduzir) {
        if (!verificarViabilidadeProducao(produtoAcabadoId, quantidadeProduzir)) {
            return;
        }

        FichaTecnica fichaTecnica = fichaTecnicaRepository.findByProdutoAcabadoId(produtoAcabadoId)
                .orElseThrow(() -> new IllegalArgumentException("Ficha técnica não encontrada para o produto ID: " + produtoAcabadoId));

        for (FichaTecnicaComponente componente : fichaTecnica.getComponentes()) {
            Produto materiaPrima = componente.getMateriaPrima();
            double quantidadeNecessariaPorUnidade = componente.getQuantidade();
            double quantidadeTotalBaixa = quantidadeNecessariaPorUnidade * quantidadeProduzir;
            estoqueService.darBaixa(materiaPrima.getId(), quantidadeTotalBaixa);
        }

        estoqueService.darEntrada(produtoAcabadoId, quantidadeProduzir);
    }
}