<?php

require_once __DIR__ . '/../includes/cors.php';

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../includes/funcoes.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    responderJson(['sucesso' => false, 'mensagem' => 'Método não permitido'], 405);
}

$dados = lerCorpoJson();

$camposObrigatorios = [
    'nome_completo', 'data_nascimento', 'sexo', 'nome_materno', 'cpf', 'email',
    'telefone_celular', 'cep', 'logradouro', 'numero', 'bairro', 'cidade', 'uf',
    'login', 'senha', 'confirmacao_senha',
];

foreach ($camposObrigatorios as $campo) {
    if (empty($dados[$campo])) {
        responderJson(['sucesso' => false, 'mensagem' => "Campo obrigatório ausente: {$campo}"], 422);
    }
}

if (!validarNome($dados['nome_completo'])) {
    responderJson(['sucesso' => false, 'mensagem' => 'Nome deve ter entre 15 e 80 caracteres alfabéticos'], 422);
}

if (!validarCpf($dados['cpf'])) {
    responderJson(['sucesso' => false, 'mensagem' => 'CPF inválido'], 422);
}

if (!filter_var($dados['email'], FILTER_VALIDATE_EMAIL)) {
    responderJson(['sucesso' => false, 'mensagem' => 'E-mail inválido'], 422);
}

if (!validarTelefone($dados['telefone_celular'])) {
    responderJson(['sucesso' => false, 'mensagem' => 'Telefone celular deve seguir o formato (+55)XX-XXXXXXXX'], 422);
}

if (!empty($dados['telefone_fixo']) && !validarTelefone($dados['telefone_fixo'])) {
    responderJson(['sucesso' => false, 'mensagem' => 'Telefone fixo deve seguir o formato (+55)XX-XXXXXXXX'], 422);
}

if (!validarLogin($dados['login'])) {
    responderJson(['sucesso' => false, 'mensagem' => 'Login deve ter exatamente 6 caracteres alfabéticos'], 422);
}

if (!validarSenha($dados['senha'])) {
    responderJson(['sucesso' => false, 'mensagem' => 'Senha deve ter exatamente 8 caracteres alfabéticos'], 422);
}

if ($dados['senha'] !== $dados['confirmacao_senha']) {
    responderJson(['sucesso' => false, 'mensagem' => 'Senha e confirmação não conferem'], 422);
}

$cpfLimpo = preg_replace('/[^0-9]/', '', $dados['cpf']);
$cepLimpo = preg_replace('/[^0-9]/', '', $dados['cep']);

$pdo = conectarBanco();

$verificacao = $pdo->prepare('SELECT id FROM usuarios WHERE cpf = ? OR login = ?');
$verificacao->execute([$cpfLimpo, $dados['login']]);
if ($verificacao->fetch()) {
    responderJson(['sucesso' => false, 'mensagem' => 'Já existe um usuário com este CPF ou login'], 409);
}

$senhaHash = password_hash($dados['senha'], PASSWORD_BCRYPT);

$sql = 'INSERT INTO usuarios (
    nome_completo, data_nascimento, sexo, nome_materno, cpf, email,
    telefone_celular, telefone_fixo, cep, logradouro, numero, complemento,
    bairro, cidade, uf, login, senha_hash,
    resposta_nome_mae, resposta_data_nascimento, resposta_cep, perfil
) VALUES (
    :nome_completo, :data_nascimento, :sexo, :nome_materno, :cpf, :email,
    :telefone_celular, :telefone_fixo, :cep, :logradouro, :numero, :complemento,
    :bairro, :cidade, :uf, :login, :senha_hash,
    :resposta_nome_mae, :resposta_data_nascimento, :resposta_cep, "comum"
)';

$insercao = $pdo->prepare($sql);
$insercao->execute([
    'nome_completo' => $dados['nome_completo'],
    'data_nascimento' => $dados['data_nascimento'],
    'sexo' => $dados['sexo'],
    'nome_materno' => $dados['nome_materno'],
    'cpf' => $cpfLimpo,
    'email' => $dados['email'],
    'telefone_celular' => $dados['telefone_celular'],
    'telefone_fixo' => $dados['telefone_fixo'] ?? null,
    'cep' => $cepLimpo,
    'logradouro' => $dados['logradouro'],
    'numero' => $dados['numero'],
    'complemento' => $dados['complemento'] ?? null,
    'bairro' => $dados['bairro'],
    'cidade' => $dados['cidade'],
    'uf' => $dados['uf'],
    'login' => $dados['login'],
    'senha_hash' => $senhaHash,
    'resposta_nome_mae' => $dados['nome_materno'],
    'resposta_data_nascimento' => $dados['data_nascimento'],
    'resposta_cep' => $cepLimpo,
]);

responderJson(['sucesso' => true, 'mensagem' => 'Usuário cadastrado com sucesso']);
