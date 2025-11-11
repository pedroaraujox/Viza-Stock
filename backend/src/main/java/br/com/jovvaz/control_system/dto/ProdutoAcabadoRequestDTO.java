package br.com.jovvaz.control_system.dto;

import java.util.List;

public class ProdutoAcabadoRequestDTO {

    private String id; // Geramos um ID
    private String nome;
    private String desc;
    private String unidadeMedida;

    // Novos campos (opcionais) para controle de produção/estoque
    private Double estoqueMinimo;
    private Double estoqueRecomendado;


    private List<ComponenteDTO> componentes;


    public void setId(String id) {
        this.id = id;
    }


    public String getId() {
        return id;
    }
    public String getNome() {
        return nome;
    }
    public void setNome(String nome) {
        this.nome = nome;
    }
    public String getDesc() {
        return desc;
    }
    public void setDesc(String desc) {
        this.desc = desc;
    }
    public String getUnidadeMedida() {
        return unidadeMedida;
    }
    public void setUnidadeMedida(String unidadeMedida) {
        this.unidadeMedida = unidadeMedida;
    }
    public Double getEstoqueMinimo() {
        return estoqueMinimo;
    }
    public void setEstoqueMinimo(Double estoqueMinimo) {
        this.estoqueMinimo = estoqueMinimo;
    }
    public Double getEstoqueRecomendado() {
        return estoqueRecomendado;
    }
    public void setEstoqueRecomendado(Double estoqueRecomendado) {
        this.estoqueRecomendado = estoqueRecomendado;
    }
    public List<ComponenteDTO> getComponentes() {
        return componentes;
    }
    public void setComponentes(List<ComponenteDTO> componentes) {
        this.componentes = componentes;
    }
}