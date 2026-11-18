<?php

require_once __DIR__ . '/../includes/cors.php';

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../includes/funcoes.php';

$sessao = exigirPerfilComum();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    responderJson(['sucesso' => false, 'mensagem' => 'Método não permitido'], 405);
}

$dados = lerCorpoJson();

if (!isset($dados['senha_atual'], $dados['nova_senha'], $dados['confirmacao_nova_senha'])
    || !is_string($dados['senha_atual']) || !is_string($dados['nova_senha'])
    || !is_string($dados['confirmacao_nova_senha'])
    || $dados['senha_atual'] === '' || $dados['nova_senha'] === '' || $dados['confirmacao_nova_senha'] === '') {
    responderJson(['sucesso' => false, 'mensagem' => 'Todos os campos são obrigatórios'], 422);
}

if (!validarSenha($dados['nova_senha'])) {
    responderJson(['sucesso' => false, 'mensagem' => 'Nova senha deve ter exatamente 8 letras'], 422);
}

if ($dados['nova_senha'] !== $dados['confirmacao_nova_senha']) {
    responderJson(['sucesso' => false, 'mensagem' => 'Nova senha e confirmação não conferem'], 422);
}

$pdo = conectarBanco();

$consulta = $pdo->prepare('SELECT senha_hash FROM usuarios WHERE id = ?');
$consulta->execute([$sessao['usuario_id']]);
$usuario = $consulta->fetch();

if (!$usuario || !password_verify($dados['senha_atual'], $usuario['senha_hash'])) {
    responderJson(['sucesso' => false, 'mensagem' => 'Senha atual incorreta'], 401);
}

$novoHash = password_hash($dados['nova_senha'], PASSWORD_BCRYPT);
$atualizacao = $pdo->prepare('UPDATE usuarios SET senha_hash = ? WHERE id = ?');
$atualizacao->execute([$novoHash, $sessao['usuario_id']]);

responderJson(['sucesso' => true, 'mensagem' => 'Senha alterada com sucesso']);
