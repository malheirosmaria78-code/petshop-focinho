# Adequação aos critérios do projeto de Back-end

Referência: enunciado do módulo 2, professor Oswaldo Peres, semestre 2026-2.
Revisão e testes em 18/11/2026.

## Regras e navegação

- Senhas novas com exatamente oito letras A-Z/a-z, no cadastro e na troca de senha.
  O armazenamento continua com hash bcrypt. Senhas antigas continuam aceitas no
  login; o campo de senha atual não remove seus números durante uma troca.
- Telefone fixo obrigatório no cadastro, no frontend e no backend.
- Telefones com o formato literal (+55)XX-XXXXXXXX do documento: oito dígitos
  após o DDD. A máscara também preserva corretamente o DDD 55.
- Cabeçalho identifica a conta pelo login, em vez do primeiro nome.
- Menu com Modelo do BD para master e comum; página redireciona visitantes ao login.
- Falhas de login encaminhadas à tela de erro com opção de retorno ao login.
- Botão Limpar também remove as mensagens e marcações antigas de validação.

## Exclusão lógica

A apresentação usa Excluir, Usuários excluídos e Restaurar. A lista abre em
usuários ativos, e a exclusão confirmada remove a conta dessa lista.

A operação no banco continua sendo UPDATE de ativo/data de desativação. Não foi
introduzido DELETE de contas ou pedidos. A confirmação explica que o acesso será
bloqueado e o histórico preservado. O perfil master não pode ser excluído.

## Revisão de erros

- Corrigida mensagem fora do HTML na página de alteração de senha e aviso
  duplicado no cadastro.
- Validação de tipos JSON e IDs nos endpoints relevantes para evitar erros
  internos em entradas inválidas.
- Filtros inválidos de usuários/log retornam erro de validação.
- Mensagens na tela de erro não passam por dupla decodificação de URL.
- 2FA trata sessão encerrada/conta desativada sem mostrar tentativas indefinidas.
- PDF com quebra de texto dentro das células, altura ajustável das linhas e
  cabeçalho repetido em novas páginas. Conferência visual com nomes/e-mails
  extensos e uma lista de 26 contas fictícias distribuída em três páginas.
- Cadastro e cabeçalho se adaptam a telas pequenas com fonte ampliada.
- Tabelas quebram textos longos para manter ações e demais colunas acessíveis.

## Validação

89 verificações HTTP/backend passaram em PHP com MySQL 8 temporário, incluindo:

- Permissões de visitante, comum e master, antes e depois do 2FA.
- Cadastro somente de comum e rejeição de dados inválidos/duplicados.
- Busca por substring e filtros de usuários.
- Exclusão lógica, cancelamento pela tela, restauração e bloqueio de acesso.
- Preservação de IDs, usuários, pedidos e itens após exclusão lógica.
- Logs apenas de comuns, filtros por nome/CPF/todos e ordem decrescente.
- Troca da própria senha, proteção do master e compatibilidade com senha antiga.
- Download de PDF, campos longos e paginação.
- Expiração por inatividade e logout.

71 verificações de navegador passaram nos fluxos de master e comum, além de layouts
em 360, 768 e 1280 pixels com fonte normal e 40% ampliada. Os testes e suas
instruções estão em tests/.

Não foram alterados dados nem credenciais do banco local de desenvolvimento.
Em instalações novas, o master do schema usa login master e senha Adminpet.
Bancos existentes mantêm a senha que já utilizavam. A regra nova de senha se
aplica somente a novos cadastros e futuras alterações de senha.

A existência de testes não garante uma nota. A aceitação de exclusão lógica em
lugar de exclusão física e os detalhes da apresentação seguem sujeitos ao
critério do professor. A embalagem/nome do arquivo de entrega e a apresentação
oral também precisam ser conferidos. Não foi testado XAMPP/Windows nesta etapa.

## Compatibilidade do login com senhas existentes

Login e senha atual nao possuem limite de oito caracteres no HTML e nao filtram
numeros ou simbolos. A regra de oito letras vale somente para novas senhas.
Verificado no navegador com digitacao real de senha longa e no backend com
master de teste autenticando com numeros, simbolos e mais de oito caracteres.
Nenhuma senha de conta do banco de desenvolvimento foi redefinida.
