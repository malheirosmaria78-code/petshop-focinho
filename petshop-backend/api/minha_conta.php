<?php

require_once __DIR__ . '/../includes/cors.php';

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../includes/funcoes.php';

$sessao = exigirAutenticacao();

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    responderJson(['sucesso' => false, 'mensagem' => 'Método não permitido'], 405);
}

$pdo = conectarBanco();
$consulta = $pdo->prepare(
    'SELECT nome_completo, email, cpf, telefone_celular, telefone_fixo,
            logradouro, numero, complemento, bairro, cidade, uf, cep,
            login, perfil, criado_em
     FROM usuarios WHERE id = ?'
);
$consulta->execute([$sessao['usuario_id']]);
$usuario = $consulta->fetch();

if (!$usuario) {
    responderJson(['sucesso' => false, 'mensagem' => 'Usuário não encontrado'], 404);
}

responderJson(['sucesso' => true, 'usuario' => $usuario]);
