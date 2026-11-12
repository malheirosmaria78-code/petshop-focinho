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
caminhos locais esperados para as fotos. Os links externos e o endereco blob
foram removidos dos dados distribuidos. Para um banco existente, execute `php petshop-backend/scripts/atualizar_catalogo.php`
na raiz, com as credenciais no ambiente. O script usa os dados do schema,
sincroniza por nome preservando IDs, usuarios, pedidos e produtos extras, e
regenera a copia offline com os IDs reais do banco. Pode ser repetido. Fotos ja
salvas com caminhos assets/ sao preservadas. Os caminhos locais estao prontos; obter e adicionar os arquivos das fotos
continua pendente.

## Ordem de conclusao

- [x] Comparar o ZIP e criar uma branch de feature a partir do repositorio atual.
- [x] Integrar as novidades preservando configuracao de ambiente e desativacao.
- [x] Validar estrutura e fluxo de contas em banco isolado (MySQL 8.4).
- [x] Validar manualmente o fluxo de desativacao/reativacao pela interface em 10/11/2026.
- [ ] Validar layout em tela de celular.
- [x] Primeiro commit de integracao enviado para a branch de feature.
- [x] Consolidar os 38 produtos no schema e testar o atualizador do catalogo.
- [x] Preparar o esqueleto das imagens: pasta, nomes esperados e caminhos locais
      no schema e na copia offline; placeholder enquanto os arquivos nao existem.
- [ ] Adicionar as fotos reais nas pastas assets/produtos e assets/banners.
- [x] Atualizar o catalogo do banco local, usando scripts/atualizar_catalogo.php,
      em 12/11/2026. A copia offline tambem foi regenerada; as fotos seguem pendentes.

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
A atualizacao da estrutura foi aplicada no banco local em 10/11/2026.
O fluxo de desativacao e reativacao tambem foi validado manualmente pela interface.

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

## Esqueleto das imagens (sem fotos por enquanto)

Os 38 produtos ja apontam para assets/produtos/<nome-do-produto>.jpg, com nomes
em minusculas, sem acentos e separados por hifen. A lista completa esta em
petshop-frontend/assets/produtos/README.md. Os dois banners tambem possuem nomes
esperados em assets/banners/README.md. Nenhuma foto foi baixada nem criada.
Enquanto os arquivos nao existem, a interface usa Foto em breve.

Validado: 38 caminhos unicos, consistentes entre schema, fallback e instrucoes;
JavaScript sem erros de sintaxe; banners com imagem ausente usam o placeholder
mesmo quando o erro ocorre antes do carregamento do script, sem ocultar a imagem.
Na etapa inicial, o banco real manteve os valores anteriores. A sincronizacao
foi concluida em 12/11/2026: os 38 produtos agora usam os caminhos locais.

## Conferencia do banco local em 12/11/2026

Backup completo criado antes da atualizacao em backups/, fora do Git e com
acesso HTTP bloqueado por .htaccess no Apache. Estrutura de contas e catalogo
atualizados pelos scripts do projeto.

Conferencia no MariaDB 10.4.32 do XAMPP: as seis tabelas possuem as colunas,
tipos, valores padrao, indices unicos e chaves estrangeiras previstos no schema.
O campo desativado_em esta presente e pedidos referencia usuarios com RESTRICT.
Schema, banco e copia offline possuem os mesmos 38 produtos, inclusive IDs,
nomes, descricoes, precos, imagens, especies e categorias. Distribuicao:
Racao 6, Higiene e Banho 7, Brinquedos 7, Acessorios 7, Servicos 6 e Petisco 5.
Os 38 caminhos das fotos constam no README de assets/produtos, mas os arquivos
de imagem ainda estao ausentes.
