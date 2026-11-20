# Testes de integração

Os testes usam um MySQL descartável e um servidor PHP temporário. O banco do
ambiente de desenvolvimento não é utilizado. Os dados são fictícios.

## Backend no Linux

Requer Python 3, PHP com pdo_mysql e mbstring, cliente mysql e mysqld (MySQL 8).
Na raiz do projeto:

```bash
python3 tests/integracao_backend.py
```

`python3` executa o arquivo de testes. O script cria uma pasta de trabalho em
`/tmp`, inicializa seu próprio MySQL sem acesso pela rede, testa as rotas HTTP e
encerra os processos ao terminar. Os PDFs e logs ficam na pasta temporária
indicada no resultado. Não precisa de sudo nem da senha do banco de uso diário.

A suite contém casos de cadastro, validação de senha/telefone/CPF/data, sessões,
2FA, permissões master/comum, consulta por substring, exclusão lógica,
restauração, preservação dos pedidos, logs, troca de senha e exportação PDF.

## Backend e interface

Com Playwright disponível e Google Chrome instalado:

```bash
PETSHOP_TEST_UI=1 python3 tests/integracao_backend.py
```

A variável `PETSHOP_TEST_UI=1` acrescenta os testes de navegador à mesma execução.
Se Playwright não estiver no caminho padrão, `PLAYWRIGHT_MODULE` pode apontar
para seu módulo. `PETSHOP_TEST_NODE` e `PETSHOP_TEST_CHROME` permitem indicar os
executáveis do Node.js e do Chrome.

A interface é testada em 360, 768 e 1280 pixels, com fonte normal e ampliada.
Os testes cobrem login/2FA, cabeçalho e menu por perfil, modelo do banco,
excluir/cancelar/restaurar pela tela, download de PDF, tela de erro, campos de
cadastro, limpeza de formulário, senha anterior e contraste.

`PETSHOP_TEST_SOCKET` é uma opção avançada para reutilizar um servidor de teste
já iniciado. Somente sockets em pastas `/tmp/petshop-*` são aceitos e o datadir é
conferido antes de qualquer escrita. Esse banco descartável é reiniciado pela
suite. Nunca informe o socket do banco de desenvolvimento ou produção.
