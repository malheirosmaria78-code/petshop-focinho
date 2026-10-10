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

## Banco de dados

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
