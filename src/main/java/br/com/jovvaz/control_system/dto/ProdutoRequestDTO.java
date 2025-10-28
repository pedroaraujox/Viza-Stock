package br.com.jovvaz.control_system.dto;

import br.com.jovvaz.control_system.model.TipoProduto;
import java.util.UUID;

public class ProdutoRequestDTO {

    private String nome;
    private String desc;
    private TipoProduto tipo;
    private String unidadeMedida;


    private String id;



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

    public TipoProduto getTipo() {
        return tipo;
    }

    public void setTipo(TipoProduto tipo) {
        this.tipo = tipo;
    }

    public String getUnidadeMedida() {
        return unidadeMedida;
    }

    public void setId(String id) {
        this.id = id;
    }

    public void setUnidadeMedida(String unidadeMedida) {
        this.unidadeMedida = unidadeMedida;
    }

    public String getId() {
        return id;
    }


}