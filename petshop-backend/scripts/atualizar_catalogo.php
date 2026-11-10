<?php

// Atualiza somente o catalogo; preserva IDs, usuarios, pedidos e produtos extras.
if (PHP_SAPI !== 'cli') {
    http_response_code(404);
    exit;
}

require_once __DIR__ . '/../config/database.php';

try {
    $pdo = conectarBanco();
    $schema = file_get_contents(__DIR__ . '/../sql/schema.sql');
    if ($schema === false
        || !preg_match('/INSERT INTO categorias \(nome\) VALUES\s*(.*?);/s', $schema, $categorias)
        || !preg_match('/INSERT INTO produtos \(categoria_id, nome, descricao, preco, imagem, especie_indicada\) VALUES\s*(.*?);/s', $schema, $produtos)) {
        throw new RuntimeException('Nao foi possivel ler o catalogo do schema.');
    }

    // Ler os dados do proprio schema evita manter duas listas diferentes.
    $pdo->exec('CREATE TEMPORARY TABLE catalogo_categorias (
        id INT AUTO_INCREMENT PRIMARY KEY, nome VARCHAR(60) NOT NULL UNIQUE
    ) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci');
    $pdo->exec('CREATE TEMPORARY TABLE catalogo_produtos (
        categoria_id INT, nome VARCHAR(100) NOT NULL, descricao TEXT NOT NULL,
        preco DECIMAL(10,2) NOT NULL, imagem VARCHAR(255), especie_indicada VARCHAR(20)
    ) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci');
    $pdo->exec('INSERT INTO catalogo_categorias (nome) VALUES ' . $categorias[1]);
    $pdo->exec('INSERT INTO catalogo_produtos VALUES ' . $produtos[1]);
    $itens = $pdo->query('SELECT p.*, c.nome AS categoria FROM catalogo_produtos p
                        JOIN catalogo_categorias c ON c.id = p.categoria_id')->fetchAll();

    $pdo->beginTransaction();
    $inserirCategoria = $pdo->prepare('INSERT INTO categorias (nome) VALUES (?) ON DUPLICATE KEY UPDATE id = id');
    $buscarCategoria = $pdo->prepare('SELECT id FROM categorias WHERE nome = ?');
    $buscarProduto = $pdo->prepare('SELECT id FROM produtos WHERE nome = ?');
    $inserirProduto = $pdo->prepare('INSERT INTO produtos
        (categoria_id, descricao, preco, imagem, especie_indicada, nome) VALUES (?, ?, ?, ?, ?, ?)');
    $atualizarProduto = $pdo->prepare("UPDATE produtos SET categoria_id = ?, descricao = ?, preco = ?,
        imagem = CASE WHEN imagem LIKE 'assets/%' THEN imagem ELSE ? END,
        especie_indicada = ? WHERE nome = ?");

    foreach ($itens as $item) {
        $inserirCategoria->execute([$item['categoria']]);
        $buscarCategoria->execute([$item['categoria']]);
        $idCategoria = $buscarCategoria->fetchColumn();
        $buscarProduto->execute([$item['nome']]);
        $dados = [$idCategoria, $item['descricao'], $item['preco'], $item['imagem'],
                  $item['especie_indicada'], $item['nome']];
        if ($buscarProduto->fetchColumn() === false) {
            $inserirProduto->execute($dados);
        } else {
            $atualizarProduto->execute($dados);
        }
    }
    $pdo->commit();
    echo count($itens) . " produtos do schema sincronizados. IDs e historico preservados.\n";
} catch (Throwable $erro) {
    if (isset($pdo) && $pdo->inTransaction()) $pdo->rollBack();
    fwrite(STDERR, 'Falha na atualizacao do catalogo: ' . $erro->getMessage() . PHP_EOL);
    exit(1);
}

// A copia offline usa os IDs reais deste banco, em vez dos IDs da exportacao.
require __DIR__ . '/gerar_produtos_fallback.php';
