package br.com.jovvaz.control_system.dto;

import java.util.List;
import java.util.UUID;

public class ProdutoAcabadoRequestDTO {

    private String id; // Geramos um ID
    private String nome;
    private String desc;
    private String unidadeMedida;


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
    public List<ComponenteDTO> getComponentes() {
        return componentes;
    }
    public void setComponentes(List<ComponenteDTO> componentes) {
        this.componentes = componentes;
    }
}