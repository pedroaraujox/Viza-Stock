package br.com.jovvaz.control_system;


import br.com.jovvaz.control_system.model.FichaTecnica;
import br.com.jovvaz.control_system.model.Produto;
import br.com.jovvaz.control_system.model.TipoProduto;
import br.com.jovvaz.control_system.repository.FichaTecnicaRepository;
import br.com.jovvaz.control_system.repository.ProdutoRepository;
import br.com.jovvaz.control_system.service.EstoqueService;
import br.com.jovvaz.control_system.service.ProducaoService;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Profile;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

import java.util.Optional;

@SpringBootApplication
@EnableJpaRepositories
public class ControlSystemApplication {

    public static void main(String[] args) {
        SpringApplication.run(ControlSystemApplication.class, args);
    }

    @Bean
    @Profile("dev")
    @ConditionalOnProperty(name = "app.seed.enabled", havingValue = "true", matchIfMissing = false)
    public CommandLineRunner run(EstoqueService estoqueService,
                                 ProducaoService producaoService,
                                 FichaTecnicaRepository fichaTecnicaRepository,
                                 ProdutoRepository produtoRepository) {
        return args -> {
            System.out.println("======================================================");
            System.out.println("INICIANDO TESTE DA LÓGICA DE NEGÓCIO...");
            System.out.println("======================================================");

            System.out.println("Criando/Carregando Matérias-Primas...");
            Produto acucar = estoqueService.buscarPorId("MP-001")
                    .orElseGet(() -> estoqueService.criarProduto("MP-001", "Açúcar", "Saco 1kg", TipoProduto.MATERIA_PRIMA, "kg"));
            Produto cacau = estoqueService.buscarPorId("MP-002")
                    .orElseGet(() -> estoqueService.criarProduto("MP-002", "Cacau em Pó", "Saco 1kg", TipoProduto.MATERIA_PRIMA, "kg"));
            Produto leite = estoqueService.buscarPorId("MP-003")
                    .orElseGet(() -> estoqueService.criarProduto("MP-003", "Leite", "Caixa 1L", TipoProduto.MATERIA_PRIMA, "L"));

            System.out.println("Dando entrada no estoque...");
            estoqueService.darEntrada(acucar.getId(), 100);
            estoqueService.darEntrada(cacau.getId(), 50);
            estoqueService.darEntrada(leite.getId(), 200);

            System.out.println("Criando/Carregando Produto Acabado...");
            Produto barraChoc = estoqueService.buscarPorId("PA-001")
                    .orElseGet(() -> estoqueService.criarProduto("PA-001", "Barra de Chocolate", "Barra 100g", TipoProduto.PRODUTO_ACABADO, "un"));


            System.out.println("Criando/Carregando Ficha Técnica...");
            fichaTecnicaRepository.findByProdutoAcabado(barraChoc)
                    .orElseGet(() -> {
                        FichaTecnica novaFicha = new FichaTecnica(barraChoc);
                        novaFicha.adicionarComponente(acucar, 0.1);
                        novaFicha.adicionarComponente(cacau, 0.05);
                        novaFicha.adicionarComponente(leite, 0.02);
                        return fichaTecnicaRepository.save(novaFicha);
                    });

            System.out.println("\n--- TENTANDO PRODUZIR 500 BARRAS (DEVE SER VIÁVEL) ---");
            try {
                producaoService.executarOrdemDeProducao(barraChoc.getId(), 500);
            } catch (Exception e) {
                System.err.println("ERRO INESPERADO: " + e.getMessage());
            }

            Optional<Produto> acucarPos = estoqueService.buscarPorId("MP-001");
            System.out.println("Estoque final de Açúcar: " + acucarPos.get().getQuantidadeEmEstoque() + " (Esperado: 50.0)");

            Optional<Produto> barraChocPos = estoqueService.buscarPorId("PA-001");
            System.out.println("Estoque final de Barra de Chocolate: " + barraChocPos.get().getQuantidadeEmEstoque() + " (Esperado: 500.0)");


            System.out.println("\n--- TENTANDO PRODUZIR +1000 BARRAS (DEVE FALHAR) ---");
            try {
                producaoService.executarOrdemDeProducao(barraChoc.getId(), 1000);
            } catch (IllegalStateException e) {
                System.err.println("TESTE BEM SUCEDIDO! ERRO CAPTURADO: " + e.getMessage());
            }

            System.out.println("======================================================");
            System.out.println("TESTE CONCLUÍDO. VERIFIQUE O BANCO DE DADOS (pgAdmin)!");
            System.out.println("======================================================");
        };
    }
}