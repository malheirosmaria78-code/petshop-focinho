<?php

function conectarBanco(): PDO {
    $host = 'localhost';
    $dbname = 'petshop';
    $usuario = 'root';
    $senha = '';

    $dsn = "mysql:host={$host};dbname={$dbname};charset=utf8mb4";

    try {
        $pdo = new PDO($dsn, $usuario, $senha);
        $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
        return $pdo;
    } catch (PDOException $e) {
        http_response_code(500);
        header('Content-Type: application/json');
        echo json_encode(['sucesso' => false, 'mensagem' => 'Falha na conexão com o banco de dados']);
        exit;
    }
}
