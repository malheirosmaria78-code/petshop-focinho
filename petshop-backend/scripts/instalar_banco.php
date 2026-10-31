<?php

/**
 * PARA QUE SERVE
 * Prepara o banco local "petshop" usando sql/schema.sql como base:
 * cria tabelas ausentes, inclui dados de exemplo ausentes e adiciona usuarios.ativo.
 * Não é necessário executar toda vez que abrir o site.
 *
 * COMO EXECUTAR (MySQL ligado; terminal na pasta que contém frontend e backend)
 * Linux:  php petshop-backend/scripts/instalar_banco.php
 * Windows/XAMPP (PowerShell):
 *   C:\xampp\php\php.exe petshop-backend/scripts/instalar_banco.php
 * A senha solicitada é a do banco MySQL, não a senha de login do site.
 * Atenção: a senha digitada aqui aparece no terminal.
 *
 * ANTES DE USAR EM BANCO EXISTENTE: faça um backup.
 * Este arquivo EXECUTA SQL: não é apenas uma consulta ou uma prévia.
 * Não sincroniza bancos de computadores diferentes e não registra migrations aplicadas.
 * Não atualiza produtos já encontrados pelo nome (inclusive suas imagens).
 * Não corrige toda diferença de estrutura em tabelas existentes, nem remove CASCADE.
 * Depende do formato atual do schema.sql; não é um leitor genérico de arquivos SQL.
 * Se falhar no meio, alterações anteriores podem já ter sido aplicadas.
 */

// Permite execução somente pelo terminal (CLI); bloqueia execução pelo navegador.
if (PHP_SAPI !== 'cli') {
    http_response_code(404);
    exit;
}

// Lê o usuário do ambiente do terminal; se ausente ou vazio, usa root.
$usuario = getenv('PETSHOP_DB_USER') ?: 'root';
// getenv retorna false quando a variável não foi definida. Senha vazia é diferente.
$senha = getenv('PETSHOP_DB_PASSWORD');
if ($senha === false) {
    $senha = readline('Senha do MySQL (Enter se nao houver; entrada visivel): ');
}

try {
    // Abre conexão com o MySQL deste computador, ainda sem selecionar um banco.
    // O CREATE DATABASE e o USE presentes no schema.sql fazem essa seleção depois.
    $pdo = new PDO('mysql:host=localhost;charset=utf8mb4', $usuario, $senha, [
        // Faz erros SQL lançarem uma exceção, tratada no catch ao final.
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
    ]);
    // __DIR__ é a pasta deste script; ../sql aponta para a pasta SQL do backend.
    // Lê o arquivo inteiro para depois separar e adaptar seus comandos.
    $sql = file_get_contents(__DIR__ . '/../sql/schema.sql');
    if ($sql === false) {
        throw new RuntimeException('Nao foi possivel ler schema.sql.');
    }

    // Divide o texto em comandos usando ponto e vírgula seguido de fim de linha/arquivo.
    // A expressão considera espaços e quebras de linha de Linux e Windows.
    // Isso depende da formatação: SQL mais complexo pode exigir outro mecanismo.
    $instrucoes = preg_split('/;\s*(?:\r?\n|$)/', trim($sql));
    // Mapa: número de categoria usado nos exemplos -> ID real neste banco.
    $categorias = [];
    foreach ($instrucoes as $instrucao) {
        // Remove espaços nas pontas e ignora trechos vazios.
        $instrucao = trim($instrucao);
        if ($instrucao === '') continue;

        if (str_starts_with($instrucao, 'CREATE TABLE ')) {
            // Evita recriar uma tabela que já existe; não atualiza suas colunas.
            $instrucao = preg_replace('/^CREATE TABLE /', 'CREATE TABLE IF NOT EXISTS ', $instrucao);
        } elseif (str_starts_with($instrucao, 'INSERT INTO usuarios ')) {
            // Se algum campo UNIQUE (como login ou CPF) conflitar, mantém o registro.
            // id = id é uma atualização sem alteração de valor; não troca senha/perfil.
            $instrucao .= ' ON DUPLICATE KEY UPDATE id = id';
        } elseif (str_starts_with($instrucao, 'INSERT INTO categorias ')) {
            // Extrai os nomes das categorias do INSERT no formato esperado pelo schema.
            preg_match_all("/\('([^']+)'\)/u", $instrucao, $nomes);
            foreach ($nomes[1] as $indice => $nome) {
                // O ? é um parâmetro: o nome é enviado separado do comando SQL.
                // categorias.nome é UNIQUE; se já existir, não cria outra categoria.
                $inserir = $pdo->prepare('INSERT INTO categorias (nome) VALUES (?) ON DUPLICATE KEY UPDATE id = id');
                $inserir->execute([$nome]);
                // Descobre o ID real, que pode ser diferente do número do exemplo.
                $buscar = $pdo->prepare('SELECT id FROM categorias WHERE nome = ?');
                $buscar->execute([$nome]);
                // O índice começa em zero; os exemplos SQL numeram a partir de um.
                $categorias[$indice + 1] = $buscar->fetchColumn();
            }
            // Este INSERT já foi tratado acima; não executar o original novamente.
            continue;
        } elseif (str_starts_with($instrucao, 'INSERT INTO produtos ')) {
            // Extrai categoria, nome e demais valores de cada linha de produto.
            // Esta expressão regular depende da formatação e das aspas do schema.sql.
            preg_match_all("/^\s*\((\d+), '([^']+)', (.+)\),?$/mu", $instrucao, $linhas, PREG_SET_ORDER);
            // Checagem de formato: interrompe se a quantidade de linhas não bater.
            // Não substitui uma validação completa de SQL.
            if (count($linhas) !== substr_count($instrucao, "\n    (")) {
                throw new RuntimeException('Formato dos produtos no schema nao reconhecido; revise o instalador.');
            }
            // Usa o nome como critério para decidir se o produto já foi cadastrado.
            $existe = $pdo->prepare('SELECT id FROM produtos WHERE nome = ? LIMIT 1');
            foreach ($linhas as $linha) {
                $existe->execute([$linha[2]]);
                // Produto existente é pulado: imagem, preço e descrição NÃO são atualizados.
                // Nome não é uma chave UNIQUE aqui; não garante deduplicação em execuções simultâneas.
                if ($existe->fetchColumn() !== false) continue;
                // Substitui a categoria do exemplo pelo ID encontrado neste banco.
                $categoria = $categorias[(int) $linha[1]];
                // Insere somente o produto ausente. Converte o ID para inteiro e protege
                // o nome com quote(); os outros valores vêm diretamente do SQL do projeto.
                // Por isso o schema precisa ser confiável e seguir o formato esperado.
                $pdo->exec('INSERT INTO produtos (categoria_id, nome, descricao, preco, imagem, especie_indicada) VALUES ('
                    . (int) $categoria . ', ' . $pdo->quote($linha[2]) . ', ' . $linha[3] . ')');
            }
            // Este INSERT já foi tratado acima; não executar o original novamente.
            continue;
        }
        // Executa o comando restante/adaptado: por exemplo CREATE DATABASE, USE e CREATE TABLE.
        $pdo->exec($instrucao);
    }

    // Atualização específica para bancos anteriores à desativação de usuários.
    // Verifica antes para não tentar adicionar a mesma coluna novamente.
    $coluna = $pdo->query("SHOW COLUMNS FROM usuarios LIKE 'ativo'");
    if (!$coluna->fetch()) {
        // 1 = ativo; 0 = desativado. Registros existentes recebem o padrão 1.
        // Adicionar essa coluna não muda sozinho o comportamento dos endpoints PHP.
        $pdo->exec('ALTER TABLE usuarios ADD COLUMN ativo TINYINT(1) NOT NULL DEFAULT 1');
    }
    echo "Banco petshop preparado. Dados existentes preservados.\n";
} catch (Throwable $erro) {
    // Mostra a falha no canal de erros do terminal e termina com código 1.
    // Não há desfazimento automático de tudo que já foi executado.
    fwrite(STDERR, "Falha na instalacao: " . $erro->getMessage() . "\n");
    exit(1);
}
