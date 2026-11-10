<?php

// Atualizacao local, compativel com MySQL e MariaDB. Nao importa dados de terceiros.
if (PHP_SAPI !== 'cli') {
    http_response_code(404);
    exit;
}

require_once __DIR__ . '/../config/database.php';

try {
    $pdo = conectarBanco();
    foreach ([
        'ativo' => 'TINYINT(1) NOT NULL DEFAULT 1',
        'desativado_em' => 'DATETIME NULL',
    ] as $coluna => $definicao) {
        $consulta = $pdo->prepare(
            'SELECT COUNT(*) FROM information_schema.COLUMNS
             WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = ?'
        );
        $consulta->execute(['usuarios', $coluna]);
        if ((int) $consulta->fetchColumn() === 0) {
            $pdo->exec("ALTER TABLE usuarios ADD COLUMN `{$coluna}` {$definicao}");
        }
    }

    $chaves = $pdo->query(
        "SELECT r.CONSTRAINT_NAME, r.DELETE_RULE
         FROM information_schema.REFERENTIAL_CONSTRAINTS r
         JOIN information_schema.KEY_COLUMN_USAGE k
           ON k.CONSTRAINT_SCHEMA = r.CONSTRAINT_SCHEMA
          AND k.TABLE_NAME = r.TABLE_NAME AND k.CONSTRAINT_NAME = r.CONSTRAINT_NAME
         WHERE r.CONSTRAINT_SCHEMA = DATABASE() AND r.TABLE_NAME = 'pedidos'
           AND r.REFERENCED_TABLE_NAME = 'usuarios'
           AND k.COLUMN_NAME = 'usuario_id' AND k.REFERENCED_COLUMN_NAME = 'id'"
    )->fetchAll();

    if (count($chaves) > 1) {
        throw new RuntimeException('Mais de uma referencia de pedidos para usuarios; revise a estrutura.');
    }
    if (!$chaves) {
        $pdo->exec('ALTER TABLE pedidos ADD CONSTRAINT pedidos_usuario_preservado
                    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE RESTRICT');
    } elseif (!in_array($chaves[0]['DELETE_RULE'], ['RESTRICT', 'NO ACTION'], true)) {
        $nome = str_replace('`', '``', $chaves[0]['CONSTRAINT_NAME']);
        // MySQL nao aceita remover e recriar o mesmo nome em um unico ALTER.
        $novoNome = $chaves[0]['CONSTRAINT_NAME'] === 'pedidos_usuario_preservado'
            ? 'pedidos_usuario_protegido' : 'pedidos_usuario_preservado';
        $pdo->exec("ALTER TABLE pedidos DROP FOREIGN KEY `{$nome}`,
                    ADD CONSTRAINT `{$novoNome}` FOREIGN KEY (usuario_id)
                    REFERENCES usuarios(id) ON DELETE RESTRICT");
    }

    echo "Estrutura de contas atualizada. Usuarios e pedidos preservados.\n";
} catch (Throwable $erro) {
    fwrite(STDERR, 'Falha na atualizacao: ' . $erro->getMessage() . PHP_EOL);
    exit(1);
}
