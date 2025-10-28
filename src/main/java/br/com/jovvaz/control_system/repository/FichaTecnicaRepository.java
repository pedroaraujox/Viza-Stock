package br.com.jovvaz.control_system.repository;

import br.com.jovvaz.control_system.model.FichaTecnica;
import br.com.jovvaz.control_system.model.Produto;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface FichaTecnicaRepository extends JpaRepository<FichaTecnica, String> {



    Optional<FichaTecnica> findByProdutoAcabadoId(String produtoAcabadoId);

    Optional<FichaTecnica> findByProdutoAcabado(Produto produtoAcabado);

}