# Atualização de bancos existentes

Faça backup antes de alterar o banco. Execute os comandos na pasta que contém
`petshop-frontend` e `petshop-backend`, com o MySQL ligado e as credenciais
`PETSHOP_DB_USER` e `PETSHOP_DB_PASSWORD` configuradas para o PHP.

Para fazer tudo em uma execução, use `php petshop-backend/scripts/instalar_banco.php`.
Ele também completa tabelas ausentes e mantém a senha do master existente.
As etapas abaixo servem para atualizar apenas contas ou apenas catálogo.

## Contas e pedidos

```bash
php petshop-backend/scripts/atualizar_contas.php
```

Adiciona as colunas de desativação ausentes e protege os pedidos contra exclusão
em cascata. Pode ser repetido e não apaga registros. Requer as tabelas `usuarios`
e `pedidos`; não instala um banco incompleto.

## Catálogo e fotos

```bash
php petshop-backend/scripts/atualizar_catalogo.php
```

Sincroniza os 38 produtos do schema por nome, preservando IDs, pedidos e produtos
extras. Atualiza descrição, preço, categoria e caminhos de imagem. Fotos locais
já cadastradas são mantidas quando o arquivo existe. Ao final, regenera
`petshop-frontend/js/produtos-fallback.js` com os IDs do banco utilizado.

As fotos estão em `petshop-frontend/assets/produtos` e os banners em
`petshop-frontend/assets/banners`. O campo `imagem` guarda apenas o caminho
relativo ao frontend, com a extensão real do arquivo. Baixar as fotos pelo Git
não atualiza os caminhos de um banco já existente.

No Windows com XAMPP, substitua `php` por `C:\xampp\php\php.exe` nos comandos.
Bancos novos devem usar `petshop-backend/sql/schema.sql`, que já contém as seis
tabelas e os 38 produtos. Não reimporte o schema em um banco com dados.

A interface apresenta Excluir e Restaurar; a operação mantém a conta e os
pedidos no banco e bloqueia o acesso enquanto a conta estiver excluída.
Senhas antigas permanecem válidas no login. Novas senhas seguem a regra de oito
letras do enunciado.
