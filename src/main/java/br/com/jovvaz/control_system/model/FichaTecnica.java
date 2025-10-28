package br.com.jovvaz.control_system.model;

import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "fichas_tecnicas")
public class FichaTecnica {

    @Id
    private String id;

    // Relação: Uma Ficha Técnica é para UM Produto Acabado
    @OneToOne
    @JoinColumn(name = "produto_acabado_id")
    private Produto produtoAcabado;

    // --- ESTA É A NOVA PARTE ---
    // Relação: Uma Ficha Técnica tem MUITOS Componentes
    @OneToMany(mappedBy = "fichaTecnica", cascade = CascadeType.ALL, fetch = FetchType.EAGER)
    private List<FichaTecnicaComponente> componentes = new ArrayList<>();
    // --- FIM DA NOVA PARTE ---

    // Construtores
    public FichaTecnica() {
    }

    public FichaTecnica(Produto produtoAcabado) {
        this.id = "FT-" + produtoAcabado.getId(); // Cria um ID para a ficha
        this.produtoAcabado = produtoAcabado;
    }

    // --- ESTE É O NOVO MÉTODO ---
    // Método para adicionar um componente à lista
    public void adicionarComponente(Produto materiaPrima, double quantidade) {
        if (materiaPrima.getTipo() != TipoProduto.MATERIA_PRIMA) {
            throw new IllegalArgumentException("Componente deve ser uma Matéria-Prima.");
        }
        FichaTecnicaComponente componente = new FichaTecnicaComponente(this, materiaPrima, quantidade);
        this.componentes.add(componente);
    }
    // --- FIM DO NOVO MÉTODO ---


    // Getters e Setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public Produto getProdutoAcabado() {
        return produtoAcabado;
    }

    public void setProdutoAcabado(Produto produtoAcabado) {
        this.produtoAcabado = produtoAcabado;
    }

    // --- GETTER E SETTER NOVOS ---
    public List<FichaTecnicaComponente> getComponentes() {
        return componentes;
    }

    public void setComponentes(List<FichaTecnicaComponente> componentes) {
        this.componentes = componentes;
    }
}