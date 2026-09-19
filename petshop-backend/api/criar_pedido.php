<?php

require_once __DIR__ . '/../includes/cors.php';

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../includes/funcoes.php';

$sessao = exigirAutenticacao();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    responderJson(['sucesso' => false, 'mensagem' => 'Método não permitido'], 405);
}

$dados = lerCorpoJson();

if (empty($dados['itens']) || !is_array($dados['itens'])) {
    responderJson(['sucesso' => false, 'mensagem' => 'O pedido precisa ter pelo menos um item'], 422);
}

if (!isset($dados['forma_pagamento']) || !in_array($dados['forma_pagamento'], ['credito', 'debito', 'pix'], true)) {
    responderJson(['sucesso' => false, 'mensagem' => 'Forma de pagamento inválida'], 422);
}

$pdo = conectarBanco();

$subtotal = 0;
$itensValidados = [];

foreach ($dados['itens'] as $item) {
    if (empty($item['id']) || empty($item['quantidade']) || (int) $item['quantidade'] < 1) {
        responderJson(['sucesso' => false, 'mensagem' => 'Item de pedido inválido'], 422);
    }

    $consultaProduto = $pdo->prepare('SELECT id, nome, preco FROM produtos WHERE id = ?');
    $consultaProduto->execute([$item['id']]);
    $produto = $consultaProduto->fetch();

    if (!$produto) {
        responderJson(['sucesso' => false, 'mensagem' => "Produto {$item['id']} não encontrado"], 404);
    }

    $quantidade = (int) $item['quantidade'];
    $subtotal += $produto['preco'] * $quantidade;

    $itensValidados[] = [
        'produto_id' => $produto['id'],
        'nome_produto' => $produto['nome'],
        'preco_unitario' => $produto['preco'],
        'quantidade' => $quantidade,
    ];
}

$entrega = $subtotal >= 150 ? 0 : 15.90;
$total = $subtotal + $entrega;
$cartaoFinal = null;

if ($dados['forma_pagamento'] !== 'pix' && !empty($dados['cartao_final'])) {
    $cartaoFinal = substr(preg_replace('/\D/', '', $dados['cartao_final']), -4);
}

$numeroPedido = 'CF' . str_pad((string) random_int(0, 99999999), 8, '0', STR_PAD_LEFT);

try {
    $pdo->beginTransaction();

    $inserirPedido = $pdo->prepare(
        'INSERT INTO pedidos (usuario_id, numero_pedido, subtotal, entrega, total, forma_pagamento, cartao_final)
         VALUES (?, ?, ?, ?, ?, ?, ?)'
    );
    $inserirPedido->execute([
        $sessao['usuario_id'],
        $numeroPedido,
        $subtotal,
        $entrega,
        $total,
        $dados['forma_pagamento'],
        $cartaoFinal,
    ]);

    $pedidoId = $pdo->lastInsertId();

    $inserirItem = $pdo->prepare(
        'INSERT INTO itens_pedido (pedido_id, produto_id, nome_produto, preco_unitario, quantidade)
         VALUES (?, ?, ?, ?, ?)'
    );
    foreach ($itensValidados as $item) {
        $inserirItem->execute([
            $pedidoId,
            $item['produto_id'],
            $item['nome_produto'],
            $item['preco_unitario'],
            $item['quantidade'],
        ]);
    }

    $pdo->commit();
} catch (Exception $falha) {
    $pdo->rollBack();
    responderJson(['sucesso' => false, 'mensagem' => 'Não foi possível registrar o pedido'], 500);
}

responderJson([
    'sucesso' => true,
    'pedido' => [
        'numero' => $numeroPedido,
        'subtotal' => $subtotal,
        'entrega' => $entrega,
        'total' => $total,
        'forma_pagamento' => $dados['forma_pagamento'],
        'cartao_final' => $cartaoFinal,
        'itens' => $itensValidados,
    ],
]);
