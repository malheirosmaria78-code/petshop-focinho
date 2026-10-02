<?php

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../includes/funcoes.php';

$login = 'master';
$senha = 'Adminp3t';

if (php_sapi_name() !== 'cli') {
    exit('Execute este script pela linha de comando: php scripts/criar_master.php');
}

if (!validarLogin($login) || !validarSenha($senha)) {
    exit('Login ou senha definidos no script não atendem às regras de formato.');
}

$pdo = conectarBanco();

$verificacao = $pdo->prepare('SELECT id FROM usuarios WHERE login = ?');
$verificacao->execute([$login]);
if ($verificacao->fetch()) {
    exit("Já existe um usuário com o login '{$login}'." . PHP_EOL);
}

$senhaHash = password_hash($senha, PASSWORD_BCRYPT);

$sql = 'INSERT INTO usuarios (
    nome_completo, data_nascimento, sexo, nome_materno, cpf, email,
    telefone_celular, cep, logradouro, numero, bairro, cidade, uf,
    login, senha_hash, resposta_nome_mae, resposta_data_nascimento, resposta_cep, perfil
) VALUES (
    :nome_completo, :data_nascimento, :sexo, :nome_materno, :cpf, :email,
    :telefone_celular, :cep, :logradouro, :numero, :bairro, :cidade, :uf,
    :login, :senha_hash, :resposta_nome_mae, :resposta_data_nascimento, :resposta_cep, "master"
)';

$insercao = $pdo->prepare($sql);
$insercao->execute([
    'nome_completo' => 'Administrador do Sistema Pet Shop',
    'data_nascimento' => '1990-01-01',
    'sexo' => 'Outro',
    'nome_materno' => 'Nao Informado',
    'cpf' => '00000000191',
    'email' => 'admin@petshop.local',
    'telefone_celular' => '(+55)21-999999999',
    'cep' => '20000000',
    'logradouro' => 'Sede Administrativa',
    'numero' => '1',
    'bairro' => 'Centro',
    'cidade' => 'Rio de Janeiro',
    'uf' => 'RJ',
    'login' => $login,
    'senha_hash' => $senhaHash,
    'resposta_nome_mae' => 'Nao Informado',
    'resposta_data_nascimento' => '1990-01-01',
    'resposta_cep' => '20000000',
]);

echo "Usuário master criado. Login: {$login} | Senha: {$senha}" . PHP_EOL;
