package br.com.jovvaz.control_system.dto;

// Representa um item da receita (Ex: 0.5kg de Açúcar)
public class ComponenteDTO {

    private String materiaPrimaId; // O ID do Produto (ex: "MP-001")
    private double quantidade;

    // Getters e Setters
    public String getMateriaPrimaId() {
        return materiaPrimaId;
    }
    public void setMateriaPrimaId(String materiaPrimaId) {
        this.materiaPrimaId = materiaPrimaId;
    }
    public double getQuantidade() {
        return quantidade;
    }
    public void setQuantidade(double quantidade) {
        this.quantidade = quantidade;
    }
}