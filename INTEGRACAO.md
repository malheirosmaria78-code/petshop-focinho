# Integracao das alteracoes da Maria

Base: main, commit 7e7da24. Origem: petshop.zip recebido em 10/11/2026.

## Decisoes desta feature

- Preservar a URL relativa da API para Linux, XAMPP e acesso pelo endereco do servidor.
- Preservar credenciais por variaveis de ambiente, a regra atual de senha e telefone fixo opcional.
- Preservar desativacao sem exclusao definitiva, incluindo o endpoint antigo.
- Acrescentar reativacao, status/data de desativacao, bloqueio de sessoes inativas e expiracao por inatividade.
- Incluir paginas institucionais, banners, ajustes responsivos e Pix de demonstracao.
- Nao copiar o Git interno do ZIP nem importar/publicar o dump completo do banco.
- Manter o schema para instalacoes novas. Atualizar bancos existentes com o script abaixo.

## Banco existente

Antes de usar a nova administracao, faca backup do seu banco e execute na raiz:

```bash
php petshop-backend/scripts/atualizar_contas.php
```

No Windows com XAMPP:

```powershell
C:\xampp\php\php.exe petshop-backend/scripts/atualizar_contas.php
```

O MySQL deve estar ligado e o PHP deve receber as credenciais PETSHOP_DB_USER e
PETSHOP_DB_PASSWORD. O script adiciona colunas ausentes e impede exclusao de
usuarios com pedidos. Pode ser repetido. Nao apaga registros e nao importa o dump.
Nao completa tabelas de um banco parcial: requer as tabelas usuarios e pedidos.

O schema.sql agora inclui todos os 38 produtos do catalogo recebido, com os
links disponiveis na exportacao. O endereco blob invalido e tratado como foto
ausente. Para um banco existente, execute `php petshop-backend/scripts/atualizar_catalogo.php`
na raiz, com as credenciais no ambiente. O script usa os dados do schema,
sincroniza por nome preservando IDs, usuarios, pedidos e produtos extras, e
regenera a copia offline com os IDs reais do banco. Pode ser repetido. Fotos ja
salvas com caminhos assets/ sao preservadas. A troca dos links por arquivos de
imagem locais e a obtencao das fotos ausentes continuam para a ultima etapa.

## Ordem de conclusao

- [x] Comparar o ZIP e criar uma branch de feature a partir do repositorio atual.
- [x] Integrar as novidades preservando configuracao de ambiente e desativacao.
- [x] Validar estrutura e fluxo de contas em banco isolado (MySQL 8.4).
- [x] Validar fluxo de desativacao/reativacao na pagina: usuario confirmou funcionamento em 10/11/2026.
- [ ] Validar layout em tela de celular.
- [x] Primeiro commit de integracao enviado para a branch de feature.
- [x] Consolidar os 38 produtos no schema e testar o atualizador do catalogo.
- [ ] **Por ultimo: imagens.** Substituir o blob temporario, obter fotos ausentes,
      salvar arquivos em assets/produtos, consolidar caminhos do catalogo no SQL
      e regenerar produtos-fallback.js. Nao substituir links nesta primeira etapa.

O Pix e apenas demonstrativo: a confirmacao automatica nao comprova pagamento.

## Validacao do fluxo de contas

Testes HTTP com PHP e MySQL temporarios, sem usar o banco do desenvolvedor:

- Schema novo com RESTRICT e atualizacao repetida de um banco antigo com CASCADE.
- Usuario comum nao pode administrar contas; master nao pode ser desativado.
- Status invalido rejeitado antes de alterar dados.
- Desativacao registra data e preserva pedidos.
- Login, sessao aberta e 2FA pendente bloqueados apos desativacao.
- Listagem de contas desativadas funciona.
- Reativacao limpa a data e recupera o acesso ao mesmo historico.
- Endpoint antigo continua desativando sem apagar usuario.
- DELETE direto de usuario com pedidos recusado pelo banco.

Todos passaram. A sintaxe PHP/JavaScript e o diff tambem foram verificados.
MariaDB/XAMPP e interface no celular ainda precisam de validacao no ambiente alvo.
O usuario executou a atualizacao no banco real e confirmou a mensagem de sucesso.
Tambem confirmou que o fluxo na pagina esta funcionando.

## Correcao do catalogo de instalacao

O schema e a copia offline distribuidos possuem os mesmos 38 produtos. O arquivo
novos_produtos.sql separado foi substituido pelo atualizador de catalogo, para
que o schema seja a unica fonte dos dados de instalacao. A exportacao completa
continua fora do Git.

Testes adicionais em MySQL temporario: instalacao limpa com 38 produtos;
atualizacao de 14 para 38 produtos preservando um produto extra; segunda execucao
sem duplicacao; IDs, usuarios, pedidos e itens preservados; foto local existente
preservada; copia offline regenerada com os IDs reais. Todos passaram. Nenhuma
atualizacao de catalogo foi executada no banco real nesta etapa.
