package br.com.jovvaz.control_system.service;

import br.com.jovvaz.control_system.dto.ProdutoRequestDTO;
import br.com.jovvaz.control_system.model.*;
import br.com.jovvaz.control_system.repository.FichaTecnicaComponenteRepository;
import br.com.jovvaz.control_system.repository.FichaTecnicaRepository;
import br.com.jovvaz.control_system.repository.ProdutoRepository;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class EstoqueService {

    private final ProdutoRepository produtoRepository;
    private final FichaTecnicaRepository fichaTecnicaRepository;
    private final FichaTecnicaComponenteRepository fichaTecnicaComponenteRepository;

    public EstoqueService(ProdutoRepository produtoRepository,
                          FichaTecnicaRepository fichaTecnicaRepository,
                          FichaTecnicaComponenteRepository fichaTecnicaComponenteRepository) {
        this.produtoRepository = produtoRepository;
        this.fichaTecnicaRepository = fichaTecnicaRepository;
        this.fichaTecnicaComponenteRepository = fichaTecnicaComponenteRepository;
    }

    @Transactional
    public Produto criarProduto(ProdutoRequestDTO dto) {
        // IDs numéricos: "01", "02", ...
        String idDesejado = dto.getId();
        String idFinal;

        if (idDesejado == null || idDesejado.trim().isEmpty()) {
            idFinal = gerarProximoIdNumerico();
        } else {
            // Validar que o ID fornecido é numérico (somente dígitos)
            String idTrim = idDesejado.trim();
            if (!idTrim.matches("\\d+")) {
                throw new IllegalArgumentException("O ID do produto deve ser numérico (apenas dígitos). Ex.: 01, 02, 10");
            }
            // Remover zeros à esquerda para comparar e reaplicar padding
            int valor = Integer.parseInt(idTrim);
            idFinal = padronizarId(valor);
            if (produtoRepository.existsById(idFinal)) {
                throw new IllegalArgumentException("Erro: ID do produto '" + idFinal + "' já existe.");
            }
        }

        Produto novoProduto = new Produto(
                idFinal,
                dto.getNome(),
                dto.getDesc(),
                dto.getTipo(),
                dto.getUnidadeMedida()
        );
        return produtoRepository.save(novoProduto);
    }

    @Transactional
    public Produto criarProduto(String id, String nome, String desc, TipoProduto tipo, String unidadeMedida) {
        if (produtoRepository.existsById(id)) {
            throw new IllegalArgumentException("Erro: ID do produto '" + id + "' já existe.");
        }
        Produto novoProduto = new Produto(id, nome, desc, tipo, unidadeMedida);
        return produtoRepository.save(novoProduto);
    }

    @Transactional
    public Produto darEntrada(String produtoId, double quantidade) {
        Produto produto = produtoRepository.findById(produtoId)
                .orElseThrow(() -> new EntityNotFoundException("Produto não encontrado com o ID: " + produtoId));
        produto.darEntrada(quantidade);
        return produtoRepository.save(produto);
    }

    @Transactional
    public Produto darBaixa(String produtoId, double quantidade) {
        Produto produto = produtoRepository.findById(produtoId)
                .orElseThrow(() -> new EntityNotFoundException("Produto não encontrado com o ID: " + produtoId));
        produto.darBaixa(quantidade);
        return produtoRepository.save(produto);
    }

    @Transactional
    public void deletarProduto(String id) {
        Produto produto = produtoRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Produto não encontrado com ID: " + id));

        if (produto.getTipo() == TipoProduto.MATERIA_PRIMA) {
            if (fichaTecnicaComponenteRepository.existsByMateriaPrima(produto)) {
                throw new IllegalStateException("Não é possível deletar: Matéria-Prima está em uso em uma Ficha Técnica.");
            }
        }

        if (produto.getTipo() == TipoProduto.PRODUTO_ACABADO) {
            Optional<FichaTecnica> fichaOpt = fichaTecnicaRepository.findByProdutoAcabado(produto);
            if (fichaOpt.isPresent()) {
                FichaTecnica ficha = fichaOpt.get();
                fichaTecnicaComponenteRepository.deleteAll(ficha.getComponentes());
                fichaTecnicaRepository.delete(ficha);
            }
        }
        produtoRepository.delete(produto);
    }

    public Optional<Produto> buscarPorId(String id) {
        return produtoRepository.findById(id);
    }

    public List<Produto> buscarTodos() {
        return produtoRepository.findAll();
    }

    // Utilidades internas para IDs numéricos
    private String gerarProximoIdNumerico() {
        // Busca todos os IDs, encontra o maior numérico e incrementa
        List<Produto> todos = produtoRepository.findAll();
        int max = 0;
        for (Produto p : todos) {
            String id = p.getId();
            if (id != null && id.matches("\\d+")) {
                try {
                    int val = Integer.parseInt(id);
                    if (val > max) max = val;
                } catch (NumberFormatException ignored) {}
            }
        }
        int proximo = max + 1;
        String candidato = padronizarId(proximo);
        // Se por algum motivo já existir (concorrência rara), incrementa até achar livre
        int tentativa = proximo;
        while (produtoRepository.existsById(candidato)) {
            tentativa++;
            candidato = padronizarId(tentativa);
        }
        return candidato;
    }

    private String padronizarId(int valor) {
        // Pelo requisito, IDs com pelo menos 2 dígitos, zero à esquerda até 2
        if (valor < 0) valor = 0;
        if (valor < 100) {
            return String.format("%02d", valor);
        }
        return Integer.toString(valor);
    }
}