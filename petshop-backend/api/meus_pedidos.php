<?php

require_once __DIR__ . '/../includes/cors.php';

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../includes/funcoes.php';

$sessao = exigirAutenticacao();

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    responderJson(['sucesso' => false, 'mensagem' => 'Método não permitido'], 405);
}

$pdo = conectarBanco();

$consultaPedidos = $pdo->prepare(
    'SELECT id, numero_pedido, subtotal, entrega, total, forma_pagamento, cartao_final, criado_em
     FROM pedidos
     WHERE usuario_id = ?
     ORDER BY criado_em DESC'
);
$consultaPedidos->execute([$sessao['usuario_id']]);
$pedidos = $consultaPedidos->fetchAll();

$consultaItens = $pdo->prepare(
    'SELECT nome_produto, preco_unitario, quantidade FROM itens_pedido WHERE pedido_id = ?'
);

foreach ($pedidos as &$pedido) {
    $consultaItens->execute([$pedido['id']]);
    $pedido['itens'] = $consultaItens->fetchAll();
}
unset($pedido);

responderJson(['sucesso' => true, 'pedidos' => $pedidos]);
