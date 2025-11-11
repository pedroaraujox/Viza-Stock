package br.com.jovvaz.control_system.controller;

import br.com.jovvaz.control_system.dto.OrdemProducaoRequestDTO;
import br.com.jovvaz.control_system.dto.OrdemProducaoCreateDTO;
import br.com.jovvaz.control_system.dto.OrdemProducaoDTO;
import br.com.jovvaz.control_system.dto.OrdemProducaoStatusUpdateDTO;
import br.com.jovvaz.control_system.model.StatusOrdemProducao;
import br.com.jovvaz.control_system.service.ProducaoService;
import br.com.jovvaz.control_system.service.OrdemProducaoService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import br.com.jovvaz.control_system.dto.ProdutoAcabadoRequestDTO;
import br.com.jovvaz.control_system.model.FichaTecnica;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.DeleteMapping;
import java.util.List;

@RestController
@RequestMapping("/api/producao")
public class ProducaoController {



    @PostMapping("/produto-acabado")
    public ResponseEntity<?> criarProdutoAcabado(@RequestBody ProdutoAcabadoRequestDTO dto) {
        try {
            System.out.println("Recebendo requisição para criar produto acabado: " + dto.getId());
            FichaTecnica novaFicha = producaoService.criarProdutoAcabadoComFichaTecnica(dto);
            System.out.println("Ficha técnica criada com sucesso: " + novaFicha.getId());
            return ResponseEntity.status(HttpStatus.CREATED).body(novaFicha);

        } catch (IllegalArgumentException | jakarta.persistence.EntityNotFoundException e) {
            System.err.println("Erro ao criar produto acabado: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            System.err.println("Erro inesperado ao criar produto acabado: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Erro interno: " + e.getMessage());
        }
    }

    private final ProducaoService producaoService;
    private final OrdemProducaoService ordemProducaoService;

    public ProducaoController(ProducaoService producaoService, OrdemProducaoService ordemProducaoService) {
        this.producaoService = producaoService;
        this.ordemProducaoService = ordemProducaoService;
    }

    @PostMapping("/executar")
    public ResponseEntity<String> executarProducao(@RequestBody OrdemProducaoRequestDTO dto) {
        try {
            // Tenta executar a ordem de produção
            producaoService.executarOrdemDeProducao(
                    dto.getProdutoAcabadoId(),
                    dto.getQuantidadeAProduzir()
            );

            // Se der certo, retorna 200 OK
            return ResponseEntity.ok("Ordem de produção executada com sucesso!");

        } catch (IllegalStateException e) {

            return ResponseEntity.badRequest().body(e.getMessage());

        } catch (Exception e) {

            return ResponseEntity.status(500).body("Erro interno no servidor: " + e.getMessage());
        }
    }

    @PostMapping("/verificar-viabilidade")
    public ResponseEntity<?> verificarViabilidade(@RequestBody OrdemProducaoRequestDTO dto) {
        try {
            boolean viavel = producaoService.verificarViabilidadeProducao(
                    dto.getProdutoAcabadoId(),
                    dto.getQuantidadeAProduzir()
            );
            return ResponseEntity.ok().body(java.util.Map.of("viavel", viavel));
        } catch (IllegalStateException | IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(java.util.Map.of("viavel", false, "erro", e.getMessage()));
        }
    }

    @GetMapping("/fichas-tecnicas")
    public ResponseEntity<List<FichaTecnica>> listarFichasTecnicas() {
        List<FichaTecnica> fichas = producaoService.listarFichasTecnicas();
        return ResponseEntity.ok(fichas);
    }

    @GetMapping("/fichas-tecnicas/{produtoId}")
    public ResponseEntity<?> buscarFichaTecnica(@PathVariable String produtoId) {
        return producaoService.buscarFichaTecnicaPorProdutoId(produtoId)
                .<ResponseEntity<?>>map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    // ====== Ordens de Produção (persistidas) ======
    @GetMapping("/ordens")
    public ResponseEntity<List<OrdemProducaoDTO>> listarOrdens() {
        return ResponseEntity.ok(ordemProducaoService.listar());
    }

    @PostMapping("/ordens")
    public ResponseEntity<?> criarOrdem(@RequestBody OrdemProducaoCreateDTO dto) {
        try {
            OrdemProducaoDTO criada = ordemProducaoService.criar(dto);
            return ResponseEntity.status(HttpStatus.CREATED).body(criada);
        } catch (jakarta.persistence.EntityNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Erro interno no servidor: " + e.getMessage());
        }
    }

    @PatchMapping("/ordens/{id}/status")
    public ResponseEntity<?> atualizarStatus(@PathVariable String id, @RequestBody OrdemProducaoStatusUpdateDTO dto) {
        try {
            StatusOrdemProducao novo = StatusOrdemProducao.valueOf(dto.getStatus());
            OrdemProducaoDTO atualizada = ordemProducaoService.atualizarStatus(id, novo);
            return ResponseEntity.ok(atualizada);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body("Status inválido: " + dto.getStatus());
        } catch (jakarta.persistence.EntityNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Erro interno no servidor: " + e.getMessage());
        }
    }

    @DeleteMapping("/ordens/{id}")
    public ResponseEntity<?> deletarOrdem(@PathVariable String id) {
        try {
            ordemProducaoService.deletar(id);
            return ResponseEntity.noContent().build();
        } catch (jakarta.persistence.EntityNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Erro interno no servidor: " + e.getMessage());
        }
    }
}