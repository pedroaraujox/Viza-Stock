
# Estoque Eficiente - Controle de Estoque para Pequenas Fábricas

Transformando experiência de chão de fábrica em um software que previne perdas e otimiza a produção.

## O Problema Real

Este projeto não nasceu de uma ideia acadêmica, mas da realidade do chão de fábrica. Tendo trabalhado em pequenos comércios e fábricas de produção própria, onde as margens de lucro são apertadas, testemunhei em primeira mão como um simples erro de comunicação ou uma contagem de estoque imprecisa pode ser um grande prejuízo.

Uma produção parada por falta de matéria-prima ou um pedido atrasado por falta de um componente são problemas reais que afetam diretamente o faturamento e a credibilidade do negócio. A falta de uma ferramenta simples e focada na relação entre o estoque e o fluxo de produção é uma dor constante para o pequeno produtor.

**O Estoque Eficiente nasceu para resolver essa dor.**

## Funcionalidades Principais (Features)

Este projeto é um backend de API completo que gerencia a complexa relação entre o estoque e as ordens de produção.

### 1\. Gestão de Estoque (`EstoqueService`)

  * **Cadastro de Produtos:** Permite o cadastro de `Produtos`, que podem ser de dois tipos: `MATERIA_PRIMA` (ex: Açúcar, Cacau) ou `PRODUTO_ACABADO` (ex: Barra de Chocolate).
  * **Movimentação de Estoque:** Métodos transacionais para `darEntrada` e `darBaixa` no estoque, garantindo a integridade dos dados no banco.
  * **Consultas:** Busca de produtos individuais por ID e listagem de todos os produtos cadastrados.

### 2\. Lógica de Produção (`ProducaoService`)

  * **Ficha Técnica (A "Receita"):** Permite a criação de uma `FichaTecnica` para cada `PRODUTO_ACABADO`, especificando exatamente quais `MATERIA_PRIMA`s e quais quantidades são necessárias para produzir uma unidade.
  * **Verificação de Viabilidade:** A "killer feature" do projeto. Antes de iniciar uma produção, este método (`verificarViabilidadeProducao`) calcula o total de matéria-prima necessária (ex: 500 barras \* 0.1kg de açúcar) e compara com o estoque real. Se faltar um único grama, a produção é interrompida com um erro claro, **prevenindo paradas no meio do processo**.
  * **Execução de Ordem de Produção:** Um método transacional (`@Transactional`) que, após confirmar a viabilidade, executa a ordem de produção completa:
    1.  Dá baixa (consome) a quantidade exata de todas as matérias-primas do estoque.
    2.  Dá entrada (cria) a quantidade solicitada de produtos acabados no estoque.

### 3\. Arquitetura e Tecnologia

  * **Backend:** Spring Boot.
  * **Banco de Dados:** PostgreSQL.
  * **Persistência:** Spring Data JPA (usando o padrão de Repositórios).
  * **Arquitetura:** Design em Camadas (`Service`/`Repository`) para separação clara de responsabilidades (Regras de Negócio vs. Acesso a Dados).

-----

## A Saga da Refatoração (A História deste Repositório)

Este repositório tem uma história. O projeto nasceu como uma aplicação desktop (NetBeans/Java Swing) e foi **completamente migrado para um backend moderno com Spring Boot.**

O processo envolveu uma refatoração completa, resolvendo diversos desafios reais de desenvolvimento:

1.  **Git Hell:** Correção de um repositório com históricos conflitantes (`unrelated histories`), estrutura de pastas aninhada incorretamente e conflitos entre branches `master` e `main`. O repositório foi limpo e reestruturado do zero (`git init`, `git push --force`) para refletir um projeto profissional.
2.  **Spring DI:** Resolução de erros de Injeção de Dependência (`bean not found`) através da configuração correta de `@Service`, `@Repository` e `@EnableJpaRepositories`.
3.  **JPA Hell:** Debug e correção de erros clássicos do Hibernate/JPA, incluindo:
      * **`LazyInitializationException`:** Resolvido usando `@Transactional` nos métodos de serviço para manter a sessão do banco de dados aberta.
      * **Erro de Coluna "Fantasma":** Correção de um descompasso entre o nome no Java (`quantidadeEmEstoque`) e no banco (`quant_em_estoque`), ajustado com `ddl-auto=create` e a anotação `@Column`.
      * **Erro de Palavra Reservada:** Correção do campo `desc` (uma palavra reservada do SQL) para `@Column(name = "descricao")`.

O resultado final é o que você vê agora: um projeto limpo, funcional, profissional e com uma história de resiliência.

## Como Rodar Localmente

1.  Clone este repositório: `git clone https://github.com/jovvaz/Control-System.git`
2.  Crie um banco de dados PostgreSQL local (ex: `controle_estoque_db`).
3.  Abra o projeto em sua IDE (IntelliJ).
4.  Vá até `src/main/resources/application.properties` e **altere** `spring.datasource.username` e `spring.datasource.password` para os seus dados.
5.  Rode a classe `ControlSystemApplication.java`.
6.  O script de teste (`CommandLineRunner`) será executado automaticamente no console, simulando o cadastro de produtos e duas ordens de produção (uma com sucesso, outra com falha proposital).
