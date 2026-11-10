<?php

require_once __DIR__ . '/../config/database.php';

const TEMPO_INATIVIDADE_SEGUNDOS = 1800;

function responderJson(array $dados, int $status = 200): void {
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($dados, JSON_UNESCAPED_UNICODE);
    exit;
}

function lerCorpoJson(): array {
    $corpo = file_get_contents('php://input');
    $dados = json_decode($corpo, true);
    return is_array($dados) ? $dados : [];
}

function validarCpf(string $cpf): bool {
    $cpf = preg_replace('/[^0-9]/', '', $cpf);

    if (strlen($cpf) !== 11 || preg_match('/^(\d)\1{10}$/', $cpf)) {
        return false;
    }

    for ($t = 9; $t < 11; $t++) {
        $soma = 0;
        for ($i = 0; $i < $t; $i++) {
            $soma += (int) $cpf[$i] * (($t + 1) - $i);
        }
        $digito = ((10 * $soma) % 11) % 10;
        if ((int) $cpf[$t] !== $digito) {
            return false;
        }
    }

    return true;
}

function validarLogin(string $login): bool {
    return (bool) preg_match('/^[A-Za-z]{6}$/', $login);
}

function validarSenha(string $senha): bool {
    return (bool) preg_match('/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{8}$/', $senha);
}

function validarTelefone(string $telefone): bool {
    return (bool) preg_match('/^\(\+55\)\d{2}-\d{8,9}$/', $telefone);
}

function validarNome(string $nome): bool {
    $tamanho = mb_strlen(trim($nome));
    return $tamanho >= 15 && $tamanho <= 80 && (bool) preg_match('/^[\p{L}\s]+$/u', $nome);
}

function iniciarSessaoSegura(): void {
    if (session_status() === PHP_SESSION_NONE) {
        ini_set('session.gc_maxlifetime', (string) (TEMPO_INATIVIDADE_SEGUNDOS * 2));
        session_set_cookie_params([
            'httponly' => true,
            'samesite' => 'Lax',
        ]);
        session_start();
    }
}

function encerrarSessao(): void {
    $_SESSION = [];
    if (ini_get('session.use_cookies')) {
        $c = session_get_cookie_params();
        setcookie(session_name(), '', time() - 42000, $c['path'], $c['domain'], $c['secure'], $c['httponly']);
    }
    session_destroy();
}

function exigirAutenticacao(): array {
    iniciarSessaoSegura();
    if (empty($_SESSION['usuario_id']) || empty($_SESSION['autenticado_completo'])) {
        responderJson(['sucesso' => false, 'mensagem' => 'Sessão não autenticada'], 401);
    }

    $agora = time();
    if (isset($_SESSION['ultima_atividade']) && ($agora - $_SESSION['ultima_atividade']) > TEMPO_INATIVIDADE_SEGUNDOS) {
        encerrarSessao();
        responderJson([
            'sucesso' => false,
            'expirada' => true,
            'mensagem' => 'Sua sessão expirou por inatividade. Entre novamente.',
        ], 401);
    }

    try {
        $consulta = conectarBanco()->prepare('SELECT ativo FROM usuarios WHERE id = ?');
        $consulta->execute([$_SESSION['usuario_id']]);
        $linha = $consulta->fetch();
        if (!$linha || (int) $linha['ativo'] !== 1) {
            encerrarSessao();
            responderJson([
                'sucesso' => false,
                'sessao_encerrada' => true,
                'mensagem' => 'Sua conta foi desativada. Entre em contato com a loja.',
            ], 401);
        }
    } catch (PDOException $e) {
        responderJson(['sucesso' => false, 'mensagem' => 'Não foi possível verificar a conta. Tente novamente.'], 503);
    }

    $_SESSION['ultima_atividade'] = $agora;
    return $_SESSION;
}

function exigirPerfilMaster(): array {
    $sessao = exigirAutenticacao();
    if ($sessao['perfil'] !== 'master') {
        responderJson(['sucesso' => false, 'mensagem' => 'Acesso restrito ao perfil master'], 403);
    }
    return $sessao;
}

function exigirPerfilComum(): array {
    $sessao = exigirAutenticacao();
    if ($sessao['perfil'] !== 'comum') {
        responderJson(['sucesso' => false, 'mensagem' => 'Acesso restrito ao perfil comum'], 403);
    }
    return $sessao;
}
