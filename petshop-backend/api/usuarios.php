<?php

require_once __DIR__ . '/../includes/cors.php';

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../includes/funcoes.php';

exigirPerfilMaster();

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    responderJson(['sucesso' => false, 'mensagem' => 'Método não permitido'], 405);
}

$busca = trim($_GET['busca'] ?? '');
$status = $_GET['status'] ?? 'todos'; // todos | ativos | desativados

$sql = "SELECT u.id, u.nome_completo, u.cpf, u.email, u.login, u.criado_em, u.ativo, u.desativado_em,
               (SELECT COUNT(*) FROM pedidos p WHERE p.usuario_id = u.id) AS total_pedidos
        FROM usuarios u
        WHERE u.perfil = 'comum'";
$parametros = [];

if ($busca !== '') {
    $sql .= ' AND u.nome_completo LIKE ?';
    $parametros[] = '%' . $busca . '%';
}
if ($status === 'ativos') {
    $sql .= ' AND u.ativo = 1';
} elseif ($status === 'desativados') {
    $sql .= ' AND u.ativo = 0';
}
$sql .= ' ORDER BY u.nome_completo';

try {
    $consulta = conectarBanco()->prepare($sql);
    $consulta->execute($parametros);
} catch (PDOException $e) {
    responderJson([
        'sucesso' => false,
        'mensagem' => 'Banco desatualizado: execute o script scripts/atualizar_contas.php pelo terminal.',
    ], 500);
}

responderJson(['sucesso' => true, 'usuarios' => $consulta->fetchAll()]);
