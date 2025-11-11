# project_rules.md

## Contexto e Ambiente do Projeto

- **Ambiente Principal:** O projeto roda exclusivamente em contêineres gerenciados pelo Docker Compose.
- **Fluxo de Trabalho:** O desenvolvimento deve ser feito **dentro do ambiente Docker**. Evite sugerir comandos para rodar o frontend ou backend de forma isolada no ambiente local (host), como `npm run dev`, `mvn spring-boot:run` ou `gradle bootRun`, pois isso não reflete o setup de desenvolvimento.
- **Comandos Padrão:** Para iniciar o projeto, sempre use comandos relacionados ao Docker Compose, como `docker compose up`.

---

## Regras de Alteração e Desenvolvimento Integrado

- **Alterações Backend/Banco de Dados:** Qualquer solicitação de alteração, criação ou exclusão que impacte o backend (Java/Spring Boot) e/ou o banco de dados **deve ser tratada de forma integrada**.
- **Necessidade de Sincronização:** Se eu pedir uma alteração no frontend que **necessite** de armazenamento ou lógica no backend (como novos campos, regras de negócio ou atualização de dados), você (Trae) deve garantir que a solução proposta inclua as modificações necessárias no:
    1.  **Backend (Java/Spring Boot):** Lógica, controladores, serviços, e modelos (entidades/DTOs).
    2.  **Banco de Dados:** Alterações de esquema (criação/modificação de colunas ou tabelas) para garantir que os dados sejam armazenados corretamente.

> **Exemplo:** Se eu pedir: "Crie dois campos (`estoque_minimo`, `estoque_recomendado`) no frontend, preciso que sejam implementados no backend e atualize o banco de dados", a solução deve incluir o código ou passos para o backend e a DDL para o banco.

- **Tecnologia Backend:** Lembre-se que o backend utiliza **Java com Spring Boot**.