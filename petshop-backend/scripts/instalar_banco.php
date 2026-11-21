<?php

// Instala o banco local ou completa a estrutura conhecida sem apagar registros.
if (PHP_SAPI !== 'cli') {
    http_response_code(404);
    exit;
}

try {
    $schema = file_get_contents(__DIR__ . '/../sql/schema.sql');
    if ($schema === false) throw new RuntimeException('Nao foi possivel ler o schema.');

    // O instalador aceita somente as tabelas e o cadastro inicial do schema do projeto.
    preg_match_all('/^CREATE TABLE ([a-z_]+) \(\n.*?^\);/ms', $schema, $tabelas, PREG_SET_ORDER);
    $nomes = array_column($tabelas, 1);
    if ($nomes !== ['usuarios', 'log_autenticacao', 'categorias', 'produtos', 'pedidos', 'itens_pedido']
        || !preg_match('/^INSERT INTO usuarios \(\n.*?^\);/ms', $schema, $master)) {
        throw new RuntimeException('Formato do schema nao reconhecido; nenhuma instalacao iniciada.');
    }

    $usuario = getenv('PETSHOP_DB_USER') ?: 'root';
    $senha = getenv('PETSHOP_DB_PASSWORD');
    if ($senha === false) {
        fwrite(STDOUT, 'Senha do MySQL (entrada visivel; Enter se nao houver): ');
        $entrada = fgets(STDIN);
        if ($entrada === false) throw new RuntimeException('Informe PETSHOP_DB_PASSWORD ou digite a senha.');
        $senha = rtrim($entrada, "\r\n");
        // Os atualizadores reutilizam as mesmas credenciais nesta execucao.
        putenv('PETSHOP_DB_PASSWORD=' . $senha);
    }

    $pdo = new PDO('mysql:host=localhost;charset=utf8mb4', $usuario, $senha, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    ]);
    $pdo->exec('CREATE DATABASE IF NOT EXISTS petshop CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci');
    $pdo->exec('USE petshop');

    foreach ($tabelas as $tabela) {
        $pdo->exec(preg_replace('/^CREATE TABLE /', 'CREATE TABLE IF NOT EXISTS ', $tabela[0]));
    }

    require __DIR__ . '/atualizar_contas.php';

    // Uma conta master existente nunca tem seus dados ou senha substituidos.
    if ((int) $pdo->query("SELECT COUNT(*) FROM usuarios WHERE perfil = 'master'")->fetchColumn() === 0) {
        $conflito = $pdo->query("SELECT COUNT(*) FROM usuarios WHERE login = 'master' OR cpf = '00000000191'");
        if ((int) $conflito->fetchColumn() > 0) {
            throw new RuntimeException('Login ou CPF do master inicial ja utilizado. Revise a conta existente; nenhum perfil foi alterado.');
        }
        $pdo->exec($master[0]);
        echo "Master inicial criado: login master, senha Adminpet.\n";
    } else {
        echo "Conta master existente preservada, incluindo a senha.\n";
    }

    require __DIR__ . '/atualizar_catalogo.php';
    echo "Banco petshop preparado. Usuarios, pedidos e IDs existentes preservados.\n";
} catch (Throwable $erro) {
    fwrite(STDERR, 'Falha na instalacao: ' . $erro->getMessage() . PHP_EOL);
    fwrite(STDERR, "Etapas anteriores podem ter sido aplicadas. Corrija a causa e execute novamente.\n");
    exit(1);
}
