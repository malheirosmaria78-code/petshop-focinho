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
3. Prepare o banco com o instalador descrito abaixo. Basta executar na configuração inicial ou ao completar um banco antigo.
4. Acesse `http://localhost/NOME-DA-PASTA/petshop-frontend/`, substituindo `NOME-DA-PASTA` pelo nome da pasta dentro de `htdocs`.

### Linux com PHP e MySQL instalados

1. Inicie o MySQL: `sudo service mysql start`.
2. Prepare o banco a partir da pasta principal do projeto:

   ```bash
   php petshop-backend/scripts/instalar_banco.php
   ```

3. Na pasta principal (que contém frontend e backend), inicie:

   ```bash
   php -S localhost:8000
   ```

4. Acesse `http://localhost:8000/petshop-frontend/`. Deixe o terminal aberto; use `Ctrl+C` para encerrar.

O PHP precisa da extensão `pdo_mysql`. Não é necessário iniciar outro servidor para o frontend ou usar Live Server.

### Credenciais locais do banco

O banco se chama `petshop`. A conexão do site usa as credenciais definidas em
`petshop-backend/config/database.php`; esse arquivo ainda não lê variáveis de ambiente.
Não coloque credenciais pessoais em commits. Separar essa configuração do código
versionado é uma melhoria pendente antes de configurar acesso compartilhado.

O instalador, por sua vez, aceita `PETSHOP_DB_USER` e `PETSHOP_DB_PASSWORD`.
As credenciais usadas no instalador não configuram automaticamente a conexão do site.

### Instalar ou completar o banco com um comando

Na pasta principal do projeto, execute:

```bash
php petshop-backend/scripts/instalar_banco.php
```

No Windows com XAMPP, use:

```powershell
C:\xampp\php\php.exe petshop-backend/scripts/instalar_banco.php
```

O MySQL deve estar ligado. O instalador pede a senha do MySQL (a entrada fica
visivel); no XAMPP sem senha, pressione Enter. Tambem aceita as variaveis
`PETSHOP_DB_USER` e `PETSHOP_DB_PASSWORD`.

Use esse instalador tanto para um banco novo quanto para completar um banco
antigo deste projeto. Ele preserva os dados, cria tabelas ausentes, adiciona a
coluna `usuarios.ativo` se necessario e inclui produtos de exemplo ausentes pelo
nome, sem sobrescrever os existentes (inclusive as imagens). Não execute a migration
`001_adicionar_ativo.sql` novamente se a coluna já existir.

O instalador depende do formato atual do `schema.sql`. Ele não mantém histórico de
migrations, não sincroniza bancos e não atualiza toda a estrutura de tabelas existentes.
Se houver erro, parte dos comandos anteriores pode já ter sido aplicada.

O `schema.sql` fica reservado para criar um banco novo manualmente. Para um banco
existente, use o instalador. Faca uma copia de seguranca antes de atualizar dados.

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
