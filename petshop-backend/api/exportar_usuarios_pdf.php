<?php

require_once __DIR__ . '/../includes/cors.php';

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../includes/funcoes.php';
require_once __DIR__ . '/../lib/fpdf/fpdf.php';

exigirPerfilMaster();

$pdo = conectarBanco();
$consulta = $pdo->query(
    "SELECT nome_completo, cpf, email, login, criado_em FROM usuarios
     WHERE perfil = 'comum'
     ORDER BY nome_completo"
);
$usuarios = $consulta->fetchAll();

$pdf = new FPDF();
$pdf->AddPage();
$pdf->SetFont('Arial', 'B', 14);
$pdf->Cell(0, 10, utf8_decode('Lista de Usuarios - Pet Shop'), 0, 1, 'C');
$pdf->Ln(4);

$pdf->SetFont('Arial', 'B', 10);
$pdf->Cell(60, 8, utf8_decode('Nome'), 1);
$pdf->Cell(35, 8, 'CPF', 1);
$pdf->Cell(60, 8, 'E-mail', 1);
$pdf->Cell(25, 8, 'Login', 1);
$pdf->Ln();

$pdf->SetFont('Arial', '', 10);
foreach ($usuarios as $usuario) {
    $pdf->Cell(60, 8, utf8_decode($usuario['nome_completo']), 1);
    $pdf->Cell(35, 8, $usuario['cpf'], 1);
    $pdf->Cell(60, 8, $usuario['email'], 1);
    $pdf->Cell(25, 8, $usuario['login'], 1);
    $pdf->Ln();
}

$pdf->Output('D', 'usuarios-petshop.pdf');
