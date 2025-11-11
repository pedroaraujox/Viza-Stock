BEGIN;

-- Alinhar nomenclatura com a entidade JPA atual
-- Renomear tabela 'produto' para 'produtos' (se existir)
ALTER TABLE IF EXISTS produto RENAME TO produtos;

-- Renomear colunas para corresponder aos nomes usados pela aplicação
ALTER TABLE IF EXISTS produtos RENAME COLUMN desc TO descricao;
ALTER TABLE IF EXISTS produtos RENAME COLUMN quantidade_em_estoque TO quant_em_estoque;

-- Adicionar colunas de controle de estoque
ALTER TABLE produtos ADD COLUMN IF NOT EXISTS estoque_minimo NUMERIC(15,2);
ALTER TABLE produtos ADD COLUMN IF NOT EXISTS estoque_recomendado NUMERIC(15,2);

COMMIT;