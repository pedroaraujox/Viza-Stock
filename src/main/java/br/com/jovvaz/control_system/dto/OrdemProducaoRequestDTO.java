package br.com.jovvaz.control_system.dto;

public class OrdemProducaoRequestDTO {

    private String produtoAcabadoId;
    private double quantidadeAProduzir;

    public String getProdutoAcabadoId() {
        return produtoAcabadoId;
    }

    public void setProdutoAcabadoId(String produtoAcabadoId) {
        this.produtoAcabadoId = produtoAcabadoId;
    }

    public double getQuantidadeAProduzir() {
        return quantidadeAProduzir;
    }

    public void setQuantidadeAProduzir(double quantidadeAProduzir) {
        this.quantidadeAProduzir = quantidadeAProduzir;
    }
}
