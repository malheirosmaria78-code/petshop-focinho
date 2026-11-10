<?php

require_once __DIR__ . '/../config/database.php';

$ehTerminal = php_sapi_name() === 'cli';
$enderecoRemoto = $_SERVER['REMOTE_ADDR'] ?? '';

if (!$ehTerminal && !in_array($enderecoRemoto, ['127.0.0.1', '::1'], true)) {
    http_response_code(403);
    exit('Acesso permitido apenas a partir do próprio computador.');
}

function responderTexto(string $mensagem, bool $ehTerminal): void {
    if (!$ehTerminal) {
        header('Content-Type: text/plain; charset=utf-8');
    }
    echo $mensagem . PHP_EOL;
}

$pdo = conectarBanco();

$consulta = $pdo->query(
    'SELECT p.id, p.nome, p.descricao, p.preco, p.imagem, p.especie_indicada, c.nome AS categoria
     FROM produtos p
     LEFT JOIN categorias c ON c.id = p.categoria_id
     ORDER BY c.nome, p.nome'
);

$produtos = array_map(static function (array $linha): array {
    return [
        'id' => (int) $linha['id'],
        'nome' => $linha['nome'],
        'descricao' => $linha['descricao'],
        'preco' => (float) $linha['preco'],
        'imagem' => $linha['imagem'] !== null && $linha['imagem'] !== '' ? $linha['imagem'] : null,
        'especie_indicada' => $linha['especie_indicada'],
        'categoria' => $linha['categoria'],
    ];
}, $consulta->fetchAll());

$json = json_encode($produtos, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT);
$conteudo = "window.PRODUTOS_FALLBACK = {$json};\n";

$pastaFront = __DIR__ . '/../../petshop-frontend/js';
$destino = is_dir($pastaFront)
    ? $pastaFront . '/produtos-fallback.js'
    : __DIR__ . '/produtos-fallback.js';

if (file_put_contents($destino, $conteudo) === false) {
    http_response_code(500);
    responderTexto('Não foi possível gravar o arquivo em: ' . $destino, $ehTerminal);
    exit;
}

$mensagem = count($produtos) . ' produtos gravados em: ' . realpath($destino);
if (!is_dir($pastaFront)) {
    $mensagem .= PHP_EOL . 'A pasta petshop-frontend/js não foi encontrada ao lado do back-end. '
        . 'Copie esse arquivo manualmente para a pasta js do front-end.';
}
responderTexto($mensagem, $ehTerminal);
