# Pet Shop — Back-End (PHP + MySQL)

## Setup

1. Suba o banco de dados executando `sql/schema.sql` no MySQL (cria o banco `petshop`, as tabelas, o usuário master e alguns produtos de exemplo).
2. Ajuste as credenciais em `config/database.php` se não estiver usando `root` sem senha.
3. O usuário master já vem criado pelo próprio `schema.sql`, com a senha já em hash bcrypt direto no `INSERT` (sem depender de PHP em tempo de execução):
   Login: `master` / Senha: `adminpet`
4. Ajuste `$origemPermitida` em `includes/cors.php` para o endereço onde o front-end vai rodar (ex.: Live Server do VS Code).
5. A FPDF já vem incluída em `lib/fpdf/fpdf.php` — não precisa baixar nada à parte.

`scripts/criar_master.php` continua no projeto apenas como utilitário opcional, caso você precise criar um segundo usuário master mais tarde — não é mais necessário para a primeira configuração.

## Endpoints

| Endpoint | Método | Perfil | Descrição |
|---|---|---|---|
| `api/cadastro.php` | POST | público | Cadastra novo usuário comum |
| `api/login.php` | POST | público | Valida login/senha, inicia 2FA |
| `api/verificar_2fa.php` | POST | sessão pendente | Confirma resposta do 2FA, libera sessão completa |
| `api/logout.php` | POST | autenticado | Encerra sessão |
| `api/perfil.php` | GET | autenticado | Dados do usuário logado (nome, login, perfil) |
| `api/minha_conta.php` | GET | autenticado | Dados completos da conta (nome, contato, endereço) para a página Minha Conta |
| `api/produtos.php` | GET | público | Lista de produtos, ou um produto (`?id=`) para a tela de detalhe |
| `api/usuarios.php` | GET | master | Lista/busca usuários comuns (`?busca=`) |
| `api/excluir_usuario.php` | POST | master | Exclui usuário comum (`{"id": N}`) |
| `api/log.php` | GET | master | Log de autenticação, só de usuários comuns (`?tipo=nome\|cpf\|todos&busca=`) |
| `api/alterar_senha.php` | POST | comum | Troca a própria senha |
| `api/exportar_usuarios_pdf.php` | GET | master | Desafio Plus: baixa lista de usuários em PDF |
| `api/criar_pedido.php` | POST | autenticado | Registra um pedido real no banco, ligado ao usuário logado (preços recalculados no servidor) |
| `api/meus_pedidos.php` | GET | autenticado | Histórico de pedidos do usuário logado, com itens |

## Regras já aplicadas no back-end

- CPF validado com dígito verificador
- Login: exatamente 6 caracteres alfabéticos
- Senha: exatamente 8 caracteres alfabéticos no cadastro, armazenada com hash bcrypt (`password_hash`)
- Telefone no formato `(+55)XX-XXXXXXXX`
- Nome entre 15 e 80 caracteres
- 2FA com pergunta sorteada entre nome da mãe / data de nascimento / CEP, bloqueio e log após 3 tentativas
- Toda ação de master/comum é validada pela sessão PHP (`includes/funcoes.php`), nunca confiando em dado vindo do front-end
- Usuário master não pode ser excluído via API

## O que o front-end precisa fazer

Todas as respostas são JSON. Use `fetch(..., { credentials: 'include' })` em todas as chamadas para que o cookie de sessão seja enviado. A validação de CEP via API (ViaCEP) e a máscara de campos continuam sendo responsabilidade do front-end — o back-end apenas valida o formato final recebido.
