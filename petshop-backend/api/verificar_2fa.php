<?php

require_once __DIR__ . '/../includes/cors.php';

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../includes/funcoes.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    responderJson(['sucesso' => false, 'mensagem' => 'Método não permitido'], 405);
}

iniciarSessaoSegura();

if (empty($_SESSION['usuario_id']) || empty($_SESSION['pergunta_2fa'])) {
    responderJson(['sucesso' => false, 'mensagem' => 'Nenhum login pendente de verificação'], 401);
}

$dados = lerCorpoJson();

if (!isset($dados['resposta']) || trim($dados['resposta']) === '') {
    responderJson(['sucesso' => false, 'mensagem' => 'A resposta é obrigatória'], 422);
}

$pdo = conectarBanco();
$consulta = $pdo->prepare('SELECT * FROM usuarios WHERE id = ?');
$consulta->execute([$_SESSION['usuario_id']]);
$usuario = $consulta->fetch();

if (!$usuario) {
    responderJson(['sucesso' => false, 'mensagem' => 'Usuário não encontrado'], 404);
}

$pergunta = $_SESSION['pergunta_2fa'];
$colunas = [
    'nome_mae' => 'resposta_nome_mae',
    'data_nascimento' => 'resposta_data_nascimento',
    'cep' => 'resposta_cep',
];
$valorEsperado = (string) $usuario[$colunas[$pergunta]];
$respostaEnviada = trim((string) $dados['resposta']);

$acertou = strcasecmp($valorEsperado, $respostaEnviada) === 0;

$registroLog = $pdo->prepare(
    'INSERT INTO log_autenticacao (usuario_id, nome, cpf, perfil, pergunta_2fa, sucesso) VALUES (?, ?, ?, ?, ?, ?)'
);
$registroLog->execute([$usuario['id'], $usuario['nome_completo'], $usuario['cpf'], $usuario['perfil'], $pergunta, $acertou ? 1 : 0]);

if ($acertou) {
    $_SESSION['autenticado_completo'] = true;
    unset($_SESSION['pergunta_2fa'], $_SESSION['tentativas_2fa']);
    responderJson([
        'sucesso' => true,
        'mensagem' => 'Autenticação concluída',
        'usuario' => [
            'nome_completo' => $usuario['nome_completo'],
            'login' => $usuario['login'],
            'perfil' => $usuario['perfil'],
        ],
    ]);
}

$_SESSION['tentativas_2fa'] = ($_SESSION['tentativas_2fa'] ?? 0) + 1;

if ($_SESSION['tentativas_2fa'] >= 3) {
    session_unset();
    session_destroy();
    responderJson([
        'sucesso' => false,
        'bloqueado' => true,
        'mensagem' => '3 tentativas sem sucesso! Favor realizar Login novamente.',
    ], 401);
}

responderJson([
    'sucesso' => false,
    'bloqueado' => false,
    'tentativas_restantes' => 3 - $_SESSION['tentativas_2fa'],
    'mensagem' => 'Resposta incorreta',
], 401);
