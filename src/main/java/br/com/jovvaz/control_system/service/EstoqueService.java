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
        if (produtoRepository.existsById(dto.getId())) {
            throw new IllegalArgumentException("Erro: ID do produto '" + dto.getId() + "' já existe.");
        }
        Produto novoProduto = new Produto(
                dto.getId(),
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
}