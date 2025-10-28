package br.com.jovvaz.control_system.controller;

import br.com.jovvaz.control_system.dto.ProdutoEntradaDTO;
import br.com.jovvaz.control_system.dto.ProdutoRequestDTO;
import br.com.jovvaz.control_system.model.Produto;
import br.com.jovvaz.control_system.service.EstoqueService;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/produtos")
public class ProdutoController {

    private final EstoqueService estoqueService;

    public ProdutoController(EstoqueService estoqueService) {
        this.estoqueService = estoqueService;
    }

    @GetMapping
    public List<Produto> listarTodosOsProdutos() {
        return estoqueService.buscarTodos();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Produto> buscarProdutoPorId(@PathVariable String id) {
        Optional<Produto> produtoOpt = estoqueService.buscarPorId(id);
        if (produtoOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(produtoOpt.get());
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Produto criarNovoProduto(@RequestBody ProdutoRequestDTO dto) {
        return estoqueService.criarProduto(dto);
    }

    @PostMapping("/entrada")
    public ResponseEntity<Produto> darEntradaEstoque(@RequestBody ProdutoEntradaDTO dto) {
        try {
            Produto produtoAtualizado = estoqueService.darEntrada(
                    dto.getProdutoId(),
                    dto.getQuantidade()
            );
            return ResponseEntity.ok(produtoAtualizado);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deletarProduto(@PathVariable String id) {
        try {
            estoqueService.deletarProduto(id);
            return ResponseEntity.noContent().build();
        } catch (EntityNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }
}