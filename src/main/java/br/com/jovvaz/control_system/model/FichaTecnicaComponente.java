package br.com.jovvaz.control_system.model;

import jakarta.persistence.*;

@Entity
@Table(name = "ficha_tecnica_componentes")
public class FichaTecnicaComponente {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Relação: Muitos componentes pertencem a UMA Ficha Técnica
    @ManyToOne
    @JoinColumn(name = "ficha_tecnica_id")
    private FichaTecnica fichaTecnica;

    // Relação: O componente é UM Produto (Matéria-Prima)
    @ManyToOne
    @JoinColumn(name = "materia_prima_id")
    private Produto materiaPrima;

    @Column(nullable = false)
    private double quantidade;

    // Construtores
    public FichaTecnicaComponente() {
    }

    public FichaTecnicaComponente(FichaTecnica fichaTecnica, Produto materiaPrima, double quantidade) {
        this.fichaTecnica = fichaTecnica;
        this.materiaPrima = materiaPrima;
        this.quantidade = quantidade;
    }

    // Getters e Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public FichaTecnica getFichaTecnica() {
        return fichaTecnica;
    }

    public void setFichaTecnica(FichaTecnica fichaTecnica) {
        this.fichaTecnica = fichaTecnica;
    }

    public Produto getMateriaPrima() {
        return materiaPrima;
    }

    public void setMateriaPrima(Produto materiaPrima) {
        this.materiaPrima = materiaPrima;
    }

    public double getQuantidade() {
        return quantidade;
    }

    public void setQuantidade(double quantidade) {
        this.quantidade = quantidade;
    }
}

