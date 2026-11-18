<?php

require_once __DIR__ . '/../includes/cors.php';

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../includes/funcoes.php';
require_once __DIR__ . '/../lib/fpdf/fpdf.php';

exigirPerfilMaster();

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    responderJson(['sucesso' => false, 'mensagem' => 'Método não permitido'], 405);
}

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

class TabelaUsuariosPdf extends FPDF {
    private array $larguras = [55, 32, 55, 22, 24];

    public function Header() {
        $this->SetFont('Arial', 'B', 14);
        $this->Cell(0, 10, latin('Lista de Usuarios - Pet Shop'), 0, 1, 'C');
        $this->Ln(4);
        $this->SetFont('Arial', 'B', 10);
        foreach (['Nome', 'CPF', 'E-mail', 'Login', 'Status'] as $indice => $titulo) {
            $this->Cell($this->larguras[$indice], 8, latin($titulo), 1);
        }
        $this->Ln();
        $this->SetFont('Arial', '', 9);
    }

    private function contarLinhas(float $largura, string $texto): int {
        $limite = ($largura - 2 * $this->cMargin) * 1000 / $this->FontSize;
        $texto = str_replace("\r", '', $texto);
        $total = strlen(rtrim($texto, "\n"));
        $inicio = 0;
        $espaco = -1;
        $tamanho = 0;
        $linhas = 1;
        for ($i = 0; $i < $total;) {
            $letra = $texto[$i];
            if ($letra === "\n") {
                $i++;
                $inicio = $i;
                $espaco = -1;
                $tamanho = 0;
                $linhas++;
                continue;
            }
            if ($letra === ' ') $espaco = $i;
            $tamanho += $this->CurrentFont['cw'][$letra];
            if ($tamanho > $limite) {
                $i = $espaco >= $inicio ? $espaco + 1 : ($i === $inicio ? $i + 1 : $i);
                $inicio = $i;
                $espaco = -1;
                $tamanho = 0;
                $linhas++;
            } else {
                $i++;
            }
        }
        return $linhas;
    }

    public function linha(array $valores): void {
        $linhas = 1;
        foreach ($valores as $indice => $texto) {
            $linhas = max($linhas, $this->contarLinhas($this->larguras[$indice], $texto));
        }
        $altura = max(8, $linhas * 5 + 2);
        if ($this->GetY() + $altura > $this->PageBreakTrigger) $this->AddPage();
        $y = $this->GetY();
        foreach ($valores as $indice => $texto) {
            $x = $this->GetX();
            $largura = $this->larguras[$indice];
            $this->Rect($x, $y, $largura, $altura);
            $this->SetXY($x, $y + 1);
            $this->MultiCell($largura, 5, $texto, 0, 'L');
            $this->SetXY($x + $largura, $y);
        }
        $this->SetXY($this->lMargin, $y + $altura);
    }
}

$pdf = new TabelaUsuariosPdf();
$pdf->AddPage();
foreach ($usuarios as $usuario) {
    $pdf->linha([
        latin($usuario['nome_completo']), $usuario['cpf'], latin($usuario['email']),
        $usuario['login'], (int) $usuario['ativo'] === 1 ? 'Ativo' : 'Excluido',
    ]);
}
$pdf->Output('D', 'usuarios-petshop.pdf');
