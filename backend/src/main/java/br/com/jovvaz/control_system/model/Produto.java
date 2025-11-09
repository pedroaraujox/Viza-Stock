package br.com.jovvaz.control_system.model;

import jakarta.persistence.*;

@Entity
@Table(name = "produtos")
public class Produto {

    @Id
    private String id;

    private String nome;

    @Column(name = "descricao")
    private String desc;

    private String unidadeMedida;

    @Enumerated(EnumType.STRING)
    private TipoProduto tipo;

    @Column(name = "quant_em_estoque")
    private double quantidadeEmEstoque;

    public Produto() {
    }

    public Produto(String id, String nome, String desc, TipoProduto tipo, String unidadeMedida) {
        if (id == null || id.trim().isEmpty()) {
            throw new IllegalArgumentException("ID do produto não pode ser nulo ou vazio.");
        }
        this.id = id;
        this.nome = nome;
        this.desc = desc;
        this.tipo = tipo;
        this.unidadeMedida = unidadeMedida;
        this.quantidadeEmEstoque = 0.0;
    }

    public void darEntrada(double quantidade) {
        if (quantidade <= 0) {
            throw new IllegalArgumentException("Quantidade de entrada deve ser positiva.");
        }
        this.quantidadeEmEstoque += quantidade;
    }

    public void darBaixa(double quantidade) {
        if (quantidade <= 0) {
            throw new IllegalArgumentException("Quantidade de baixa deve ser positiva.");
        }
        if (this.quantidadeEmEstoque < quantidade) {
            throw new IllegalStateException("Estoque insuficiente. Disponível: " + this.quantidadeEmEstoque + ", Solicitado: " + quantidade);
        }
        this.quantidadeEmEstoque -= quantidade;
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

    public TipoProduto getTipo() {
        return tipo;
    }

    public void setTipo(TipoProduto tipo) {
        this.tipo = tipo;
    }

    public double getQuantidadeEmEstoque() {
        return quantidadeEmEstoque;
    }
}