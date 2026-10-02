<?php

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
        session_set_cookie_params([
            'httponly' => true,
            'samesite' => 'Lax',
        ]);
        session_start();
    }
}

function exigirAutenticacao(): array {
    iniciarSessaoSegura();
    if (empty($_SESSION['usuario_id']) || empty($_SESSION['autenticado_completo'])) {
        responderJson(['sucesso' => false, 'mensagem' => 'Sessão não autenticada'], 401);
    }
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
