<?php

require_once __DIR__ . '/../includes/cors.php';

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../includes/funcoes.php';

exigirPerfilMaster();

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    responderJson(['sucesso' => false, 'mensagem' => 'Método não permitido'], 405);
}

$tipo = $_GET['tipo'] ?? 'todos';
$busca = trim($_GET['busca'] ?? '');

$pdo = conectarBanco();

$sqlBase = "SELECT id, nome, cpf, data_hora, pergunta_2fa, sucesso FROM log_autenticacao WHERE perfil = 'comum'";
$parametros = [];

if ($tipo === 'nome' && $busca !== '') {
    $sqlBase .= ' AND nome LIKE ?';
    $parametros[] = '%' . $busca . '%';
} elseif ($tipo === 'cpf' && $busca !== '') {
    $sqlBase .= ' AND cpf LIKE ?';
    $parametros[] = '%' . preg_replace('/[^0-9]/', '', $busca) . '%';
}

$sqlBase .= ' ORDER BY data_hora DESC';

$consulta = $pdo->prepare($sqlBase);
$consulta->execute($parametros);

responderJson(['sucesso' => true, 'registros' => $consulta->fetchAll()]);
