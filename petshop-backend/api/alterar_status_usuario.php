<?php

require_once __DIR__ . '/../includes/cors.php';

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../includes/funcoes.php';

exigirPerfilMaster();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    responderJson(['sucesso' => false, 'mensagem' => 'Método não permitido'], 405);
}

$dados = lerCorpoJson();

if (empty($dados['id']) || !isset($dados['ativo'])) {
    responderJson(['sucesso' => false, 'mensagem' => 'Informe o usuário e o novo status'], 422);
}

if (!is_bool($dados['ativo'])) {
    responderJson(['sucesso' => false, 'mensagem' => 'O status ativo deve ser verdadeiro ou falso'], 422);
}
$ativar = $dados['ativo'];

$pdo = conectarBanco();

$consulta = $pdo->prepare('SELECT id, perfil FROM usuarios WHERE id = ?');
$consulta->execute([$dados['id']]);
$usuario = $consulta->fetch();

if (!$usuario) {
    responderJson(['sucesso' => false, 'mensagem' => 'Usuário não encontrado'], 404);
}

if ($usuario['perfil'] === 'master') {
    responderJson(['sucesso' => false, 'mensagem' => 'Não é permitido desativar um usuário master'], 403);
}

$atualizacao = $pdo->prepare(
    'UPDATE usuarios SET ativo = ?, desativado_em = ' . ($ativar ? 'NULL' : 'NOW()') . ' WHERE id = ?'
);
$atualizacao->execute([$ativar ? 1 : 0, $dados['id']]);

responderJson([
    'sucesso' => true,
    'mensagem' => $ativar ? 'Conta reativada com sucesso' : 'Conta desativada. O histórico foi preservado.',
]);
