package br.com.jovvaz.control_system.dto;

public class ProdutoEntradaDTO {

    private String produtoId;
    private double quantidade;


    public String getProdutoId() {
        return produtoId;
    }
    public void setProdutoId(String produtoId) {
        this.produtoId = produtoId;
    }
    public double getQuantidade() {
        return quantidade;
    }
    public void setQuantidade(double quantidade) {
        this.quantidade = quantidade;
    }
}