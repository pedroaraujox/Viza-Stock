package br.com.jovvaz.control_system.controller;

import br.com.jovvaz.control_system.dto.OrdemProducaoRequestDTO;
import br.com.jovvaz.control_system.service.ProducaoService;
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
import jakarta.persistence.EntityNotFoundException;
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

    public ProducaoController(ProducaoService producaoService) {
        this.producaoService = producaoService;
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
}