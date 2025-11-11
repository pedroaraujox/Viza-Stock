-- Preferências globais do sistema
CREATE TABLE IF NOT EXISTS system_preferences (
  id VARCHAR(64) PRIMARY KEY,
  voice_on_new_order BOOLEAN NOT NULL DEFAULT TRUE,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insere o registro GLOBAL se não existir
MERGE INTO system_preferences sp
USING (SELECT 'GLOBAL' AS id) src
ON (sp.id = src.id)
WHEN NOT MATCHED THEN
  INSERT (id, voice_on_new_order) VALUES ('GLOBAL', TRUE);