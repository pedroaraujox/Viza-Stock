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

@RestController
@RequestMapping("/api/producao")
public class ProducaoController {



    @PostMapping("/produto-acabado")
    public ResponseEntity<?> criarProdutoAcabado(@RequestBody ProdutoAcabadoRequestDTO dto) {
        try {
            FichaTecnica novaFicha = producaoService.criarProdutoAcabadoComFichaTecnica(dto);
            return ResponseEntity.status(HttpStatus.CREATED).body(novaFicha);

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
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
}