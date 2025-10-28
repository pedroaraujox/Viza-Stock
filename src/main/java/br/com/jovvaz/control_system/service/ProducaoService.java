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
        if (produtoRepository.existsById(dto.getId())) {
            throw new IllegalArgumentException("Erro: ID do produto '" + dto.getId() + "' já existe.");
        }

        Produto produtoAcabado = new Produto(
                dto.getId(),
                dto.getNome(),
                dto.getDesc(),
                TipoProduto.PRODUTO_ACABADO,
                dto.getUnidadeMedida()
        );
        produtoRepository.save(produtoAcabado);

        FichaTecnica ficha = new FichaTecnica(produtoAcabado);

        if (dto.getComponentes() == null || dto.getComponentes().isEmpty()) {
            throw new IllegalArgumentException("Produto Acabado deve ter pelo menos um componente.");
        }

        for (ComponenteDTO compDTO : dto.getComponentes()) {
            Produto materiaPrima = produtoRepository.findById(compDTO.getMateriaPrimaId())
                    .orElseThrow(() -> new EntityNotFoundException("Matéria-prima não encontrada com ID: " + compDTO.getMateriaPrimaId()));
            ficha.adicionarComponente(materiaPrima, compDTO.getQuantidade());
        }
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