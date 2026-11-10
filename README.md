# Casa Focinho 🐾

A **Casa Focinho** é um projeto de petshop desenvolvido para a faculdade, utilizando HTML, CSS, JavaScript, PHP e MySQL.

A ideia do projeto é criar um sistema simples de petshop onde o usuário consegue fazer cadastro, login, visualizar produtos, adicionar itens ao carrinho e realizar pedidos.

Também existe uma área administrativa para algumas funções relacionadas aos usuários do sistema.

## Funcionalidades

Atualmente o projeto possui:

- Cadastro de usuários
- Login
- Autenticação em duas etapas
- Alteração de senha
- Área de perfil
- Listagem de produtos
- Categorias de produtos
- Página de detalhes dos produtos
- Carrinho de compras
- Finalização de pedido
- Histórico de pedidos
- Área administrativa
- Consulta de usuários
- Exclusão de usuários
- Consulta de registros de autenticação
- Exportação de usuários em PDF

## Validações

O sistema também possui algumas validações no cadastro e login, como:

- Validação de CPF
- Validação de telefone
- Regras para criação de login
- Regras para senha
- Limite de tentativas na autenticação em duas etapas
- Senhas armazenadas utilizando hash com bcrypt

## Como executar localmente

Sirva as pastas `petshop-frontend` e `petshop-backend` pelo mesmo servidor.
O frontend encontra a API automaticamente, sem fixar nome da pasta, domínio ou porta.

### Windows com XAMPP

1. Coloque a pasta do projeto dentro de `C:\xampp\htdocs`.
2. Inicie **Apache** e **MySQL** no painel do XAMPP.
3. Na primeira configuração, importe `petshop-backend/sql/schema.sql` pelo phpMyAdmin. Não precisa importar novamente a cada execução.
4. Acesse `http://localhost/NOME-DA-PASTA/petshop-frontend/`, substituindo `NOME-DA-PASTA` pelo nome da pasta dentro de `htdocs`.

### Linux com PHP e MySQL instalados

1. Inicie o MySQL: `sudo service mysql start`.
2. Na primeira configuração, importe o banco a partir da pasta principal do projeto:

   ```bash
   mysql -u root -p < petshop-backend/sql/schema.sql
   ```

3. Na pasta principal (que contém frontend e backend), inicie:

   ```bash
   php -S localhost:8000
   ```

4. Acesse `http://localhost:8000/petshop-frontend/`. Deixe o terminal aberto; use `Ctrl+C` para encerrar.

O PHP precisa da extensão `pdo_mysql`. Não é necessário iniciar outro servidor para o frontend ou usar Live Server.

### Credenciais locais do banco

O banco se chama `petshop`. Por padrão, a conexão usa `root` sem senha.
Se seu banco usa outras credenciais, configure as variáveis de ambiente
`PETSHOP_DB_USER` e `PETSHOP_DB_PASSWORD` no ambiente que executa o PHP,
sem colocar senhas pessoais no repositório. No Linux, por exemplo:

```bash
PETSHOP_DB_USER=seu_usuario PETSHOP_DB_PASSWORD='sua_senha' php -S localhost:8000
```

No XAMPP, as variáveis precisam estar disponíveis para o Apache; reinicie-o após configurá-las.

## Estrutura do banco

O projeto utiliza MySQL para armazenar as informações.

Entre os dados armazenados estão:

- Usuários
- Produtos
- Categorias
- Pedidos
- Itens dos pedidos
- Registros de autenticação

O script de criação do banco está dentro da pasta:

```text
petshop-backend/sql/
```

## Tecnologias utilizadas

- HTML
- CSS
- JavaScript
- PHP
- MySQL
- DBeaver

Também é utilizada a biblioteca FPDF para geração de PDF e a API ViaCEP para auxiliar no preenchimento de endereço.

## Estrutura

O projeto é dividido principalmente em duas partes:

```text
petshop-frontend/
petshop-backend/
```

Na parte do frontend ficam as páginas, estilos e scripts utilizados na interface.

Na parte do backend ficam os arquivos PHP, conexão com o banco, API e scripts SQL.

## Objetivo

O objetivo principal do projeto é praticar a integração entre frontend, backend e banco de dados, utilizando conceitos vistos durante o curso, como cadastro, autenticação, sessões, banco de dados relacional e manipulação de informações.

## Status

O projeto ainda está em desenvolvimento e algumas partes podem sofrer alterações ou melhorias.

## Integracao da versao recebida em ZIP

Consulte [INTEGRACAO.md](INTEGRACAO.md) para as decisoes, atualizacao do banco
e pendencias. As imagens serao consolidadas na ultima etapa.
