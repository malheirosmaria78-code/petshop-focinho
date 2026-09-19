<?php

require_once __DIR__ . '/../includes/cors.php';

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../includes/funcoes.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    responderJson(['sucesso' => false, 'mensagem' => 'Método não permitido'], 405);
}

$dados = lerCorpoJson();

if (empty($dados['login']) || empty($dados['senha'])) {
    responderJson(['sucesso' => false, 'mensagem' => 'Login e senha são obrigatórios'], 422);
}

$pdo = conectarBanco();

$consulta = $pdo->prepare('SELECT * FROM usuarios WHERE login = ?');
$consulta->execute([$dados['login']]);
$usuario = $consulta->fetch();

if (!$usuario || !password_verify($dados['senha'], $usuario['senha_hash'])) {
    responderJson(['sucesso' => false, 'mensagem' => 'Login ou senha inválidos'], 401);
}

$perguntas = ['nome_mae', 'data_nascimento', 'cep'];
$perguntaSorteada = $perguntas[array_rand($perguntas)];

iniciarSessaoSegura();
session_regenerate_id(true);

$_SESSION['usuario_id'] = $usuario['id'];
$_SESSION['nome_completo'] = $usuario['nome_completo'];
$_SESSION['cpf'] = $usuario['cpf'];
$_SESSION['perfil'] = $usuario['perfil'];
$_SESSION['login'] = $usuario['login'];
$_SESSION['autenticado_completo'] = false;
$_SESSION['pergunta_2fa'] = $perguntaSorteada;
$_SESSION['tentativas_2fa'] = 0;

$rotulos = [
    'nome_mae' => 'Qual o nome da sua mãe?',
    'data_nascimento' => 'Qual a data do seu nascimento?',
    'cep' => 'Qual o CEP do seu endereço?',
];

responderJson([
    'sucesso' => true,
    'mensagem' => 'Credenciais válidas, prossiga para o 2FA',
    'pergunta_2fa' => $perguntaSorteada,
    'pergunta_2fa_texto' => $rotulos[$perguntaSorteada],
]);
