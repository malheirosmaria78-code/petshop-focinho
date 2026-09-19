<?php

require_once __DIR__ . '/../includes/cors.php';

require_once __DIR__ . '/../includes/funcoes.php';

$sessao = exigirAutenticacao();

responderJson([
    'sucesso' => true,
    'usuario' => [
        'nome_completo' => $sessao['nome_completo'],
        'login' => $sessao['login'],
        'perfil' => $sessao['perfil'],
    ],
]);
