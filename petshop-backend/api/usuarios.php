<?php

require_once __DIR__ . '/../includes/cors.php';

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../includes/funcoes.php';

exigirPerfilMaster();

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    responderJson(['sucesso' => false, 'mensagem' => 'Método não permitido'], 405);
}

$busca = trim($_GET['busca'] ?? '');

$pdo = conectarBanco();

if ($busca !== '') {
    $consulta = $pdo->prepare(
        "SELECT id, nome_completo, cpf, email, login, criado_em FROM usuarios
         WHERE perfil = 'comum' AND ativo = 1 AND nome_completo LIKE ?
         ORDER BY nome_completo"
    );
    $consulta->execute(['%' . $busca . '%']);
} else {
    $consulta = $pdo->query(
        "SELECT id, nome_completo, cpf, email, login, criado_em FROM usuarios
         WHERE perfil = 'comum' AND ativo = 1
         ORDER BY nome_completo"
    );
}

responderJson(['sucesso' => true, 'usuarios' => $consulta->fetchAll()]);
