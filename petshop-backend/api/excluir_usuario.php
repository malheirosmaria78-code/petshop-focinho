<?php

require_once __DIR__ . '/../includes/cors.php';

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../includes/funcoes.php';

exigirPerfilMaster();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    responderJson(['sucesso' => false, 'mensagem' => 'Método não permitido'], 405);
}

$dados = lerCorpoJson();

if (empty($dados['id'])) {
    responderJson(['sucesso' => false, 'mensagem' => 'ID do usuário é obrigatório'], 422);
}

$pdo = conectarBanco();

$consulta = $pdo->prepare("SELECT id, perfil FROM usuarios WHERE id = ?");
$consulta->execute([$dados['id']]);
$usuario = $consulta->fetch();

if (!$usuario) {
    responderJson(['sucesso' => false, 'mensagem' => 'Usuário não encontrado'], 404);
}

if ($usuario['perfil'] === 'master') {
    responderJson(['sucesso' => false, 'mensagem' => 'Não é permitido excluir um usuário master'], 403);
}

$desativacao = $pdo->prepare("UPDATE usuarios SET ativo = 0 WHERE id = ? AND perfil = 'comun'");
$desativacao->execute([$dados['id']]);

responderJson(['sucesso' => true, 'mensagem' => 'Usuário excluído com sucesso']);
