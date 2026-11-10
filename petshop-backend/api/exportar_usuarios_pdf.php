<?php

require_once __DIR__ . '/../includes/cors.php';

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../includes/funcoes.php';
require_once __DIR__ . '/../lib/fpdf/fpdf.php';

exigirPerfilMaster();

$pdo = conectarBanco();
$consulta = $pdo->query(
    "SELECT nome_completo, cpf, email, login, ativo, criado_em FROM usuarios
     WHERE perfil = 'comum'
     ORDER BY nome_completo"
);
$usuarios = $consulta->fetchAll();

function latin(string $texto): string {
    return mb_convert_encoding($texto, 'ISO-8859-1', 'UTF-8');
}

$pdf = new FPDF();
$pdf->AddPage();
$pdf->SetFont('Arial', 'B', 14);
$pdf->Cell(0, 10, latin('Lista de Usuarios - Pet Shop'), 0, 1, 'C');
$pdf->Ln(4);

$pdf->SetFont('Arial', 'B', 10);
$pdf->Cell(55, 8, latin('Nome'), 1);
$pdf->Cell(32, 8, 'CPF', 1);
$pdf->Cell(55, 8, 'E-mail', 1);
$pdf->Cell(22, 8, 'Login', 1);
$pdf->Cell(24, 8, 'Status', 1);
$pdf->Ln();

$pdf->SetFont('Arial', '', 10);
foreach ($usuarios as $usuario) {
    $pdf->Cell(55, 8, latin($usuario['nome_completo']), 1);
    $pdf->Cell(32, 8, $usuario['cpf'], 1);
    $pdf->Cell(55, 8, $usuario['email'], 1);
    $pdf->Cell(22, 8, $usuario['login'], 1);
    $pdf->Cell(24, 8, (int) $usuario['ativo'] === 1 ? 'Ativo' : 'Desativado', 1);
    $pdf->Ln();
}

$pdf->Output('D', 'usuarios-petshop.pdf');
