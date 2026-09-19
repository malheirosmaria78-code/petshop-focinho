<?php

require_once __DIR__ . '/../includes/cors.php';

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../includes/funcoes.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    responderJson(['sucesso' => false, 'mensagem' => 'Método não permitido'], 405);
}

$pdo = conectarBanco();

if (!empty($_GET['id'])) {
    $consulta = $pdo->prepare(
        'SELECT p.id, p.nome, p.descricao, p.preco, p.imagem, p.especie_indicada, c.nome AS categoria
         FROM produtos p
         LEFT JOIN categorias c ON c.id = p.categoria_id
         WHERE p.id = ?'
    );
    $consulta->execute([$_GET['id']]);
    $produto = $consulta->fetch();

    if (!$produto) {
        responderJson(['sucesso' => false, 'mensagem' => 'Produto não encontrado'], 404);
    }

    responderJson(['sucesso' => true, 'produto' => $produto]);
}

$consulta = $pdo->query(
    'SELECT p.id, p.nome, p.descricao, p.preco, p.imagem, p.especie_indicada, c.nome AS categoria
     FROM produtos p
     LEFT JOIN categorias c ON c.id = p.categoria_id
     ORDER BY c.nome, p.nome'
);

responderJson(['sucesso' => true, 'produtos' => $consulta->fetchAll()]);
