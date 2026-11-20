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
    'telefone_celular', 'telefone_fixo', 'cep', 'logradouro', 'numero', 'bairro', 'cidade', 'uf',
    'login', 'senha', 'confirmacao_senha',
];

foreach ($camposObrigatorios as $campo) {
    if (!isset($dados[$campo]) || !is_string($dados[$campo])
        || trim($dados[$campo]) === '' || str_contains($dados[$campo], "\0")) {
        responderJson(['sucesso' => false, 'mensagem' => "Campo obrigatório inválido: {$campo}"], 422);
    }
}

foreach (['complemento'] as $campo) {
    if (isset($dados[$campo]) && (!is_string($dados[$campo]) || str_contains($dados[$campo], "\0"))) {
        responderJson(['sucesso' => false, 'mensagem' => "Campo inválido: {$campo}"], 422);
    }
}

// Os limites do banco devem ser verificados antes de tentar gravar.
foreach ([
    'nome_completo' => 80, 'nome_materno' => 80, 'email' => 150,
    'telefone_celular' => 20, 'telefone_fixo' => 20, 'logradouro' => 150,
    'numero' => 10, 'complemento' => 100, 'bairro' => 100, 'cidade' => 100,
] as $campo => $limite) {
    if (isset($dados[$campo]) && mb_strlen($dados[$campo]) > $limite) {
        responderJson(['sucesso' => false, 'mensagem' => "Campo {$campo} excede {$limite} caracteres"], 422);
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

if (!validarTelefone($dados['telefone_fixo'])) {
    responderJson(['sucesso' => false, 'mensagem' => 'Telefone fixo deve seguir o formato (+55)XX-XXXXXXXX'], 422);
}

if (!validarLogin($dados['login'])) {
    responderJson(['sucesso' => false, 'mensagem' => 'Login deve ter exatamente 6 caracteres alfabéticos'], 422);
}

if (!validarSenha($dados['senha'])) {
    responderJson(['sucesso' => false, 'mensagem' => 'Senha deve ter exatamente 8 letras'], 422);
}

if ($dados['senha'] !== $dados['confirmacao_senha']) {
    responderJson(['sucesso' => false, 'mensagem' => 'Senha e confirmação não conferem'], 422);
}

$fuso = new DateTimeZone('America/Sao_Paulo');
$nascimento = DateTimeImmutable::createFromFormat('!Y-m-d', $dados['data_nascimento'], $fuso);
if (!$nascimento || $nascimento->format('Y-m-d') !== $dados['data_nascimento']
    || $nascimento < new DateTimeImmutable('1000-01-01', $fuso)
    || $nascimento >= new DateTimeImmutable('today', $fuso)) {
    responderJson(['sucesso' => false, 'mensagem' => 'Informe uma data de nascimento válida e anterior a hoje'], 422);
}

if (!in_array($dados['sexo'], ['M', 'F', 'Outro'], true)) {
    responderJson(['sucesso' => false, 'mensagem' => 'Selecione uma opção de sexo válida'], 422);
}

$dados['cep'] = trim($dados['cep']);
if (!preg_match('/\A[0-9]{5}-?[0-9]{3}\z/', $dados['cep'])) {
    responderJson(['sucesso' => false, 'mensagem' => 'CEP deve conter oito dígitos'], 422);
}

$dados['uf'] = strtoupper(trim($dados['uf']));
$ufs = [
    'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO',
    'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI',
    'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO',
];
if (!in_array($dados['uf'], $ufs, true)) {
    responderJson(['sucesso' => false, 'mensagem' => 'Informe uma UF brasileira válida'], 422);
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
