<?php

require_once __DIR__ . '/../includes/cors.php';

require_once __DIR__ . '/../includes/funcoes.php';

iniciarSessaoSegura();
$_SESSION = [];
session_unset();
session_destroy();

responderJson(['sucesso' => true, 'mensagem' => 'Sessão encerrada']);
