-- Tabela de preferências de usuário (H2)
CREATE TABLE IF NOT EXISTS user_preferences (
  user_id VARCHAR(255) PRIMARY KEY,
  voice_on_new_order BOOLEAN NOT NULL DEFAULT TRUE,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);