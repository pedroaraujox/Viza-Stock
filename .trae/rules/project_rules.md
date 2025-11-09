# project_rules.md

## Contexto e Ambiente do Projeto

- **Ambiente Principal:** O projeto roda exclusivamente em contêineres gerenciados pelo Docker Compose.
- **Fluxo de Trabalho:** O desenvolvimento deve ser feito dentro do ambiente Docker. Evite sugerir comandos para rodar o frontend ou backend de forma isolada no ambiente local (host), como `npm run dev` ou ``mvn spring-boot:run` ou `gradle bootRun`, pois isso não reflete o setup de desenvolvimento.
- **Comandos Padrão:** Para iniciar o projeto, sempre use comandos relacionados ao Docker Compose, como `docker compose up`.