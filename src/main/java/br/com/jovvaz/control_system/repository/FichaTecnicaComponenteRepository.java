package br.com.jovvaz.control_system.repository;

import br.com.jovvaz.control_system.model.FichaTecnicaComponente;
import br.com.jovvaz.control_system.model.Produto;
import org.springframework.data.jpa.repository.JpaRepository;

public interface FichaTecnicaComponenteRepository extends JpaRepository<FichaTecnicaComponente, Long> {

    // Este é o método que o EstoqueService usa para verificar
    // se uma matéria-prima está em uso antes de deletar
    boolean existsByMateriaPrima(Produto materiaPrima);

}
