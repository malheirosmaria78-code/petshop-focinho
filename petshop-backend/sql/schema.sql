CREATE DATABASE IF NOT EXISTS petshop CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE petshop;

CREATE TABLE usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome_completo VARCHAR(80) NOT NULL,
    data_nascimento DATE NOT NULL,
    sexo ENUM('M', 'F', 'Outro') NOT NULL,
    nome_materno VARCHAR(80) NOT NULL,
    cpf CHAR(11) NOT NULL UNIQUE,
    email VARCHAR(150) NOT NULL,
    telefone_celular VARCHAR(20) NOT NULL,
    telefone_fixo VARCHAR(20) NULL,
    cep CHAR(8) NOT NULL,
    logradouro VARCHAR(150) NOT NULL,
    numero VARCHAR(10) NOT NULL,
    complemento VARCHAR(100) NULL,
    bairro VARCHAR(100) NOT NULL,
    cidade VARCHAR(100) NOT NULL,
    uf CHAR(2) NOT NULL,
    login CHAR(6) NOT NULL UNIQUE,
    senha_hash VARCHAR(255) NOT NULL,
    resposta_nome_mae VARCHAR(100) NOT NULL,
    resposta_data_nascimento DATE NOT NULL,
    resposta_cep CHAR(8) NOT NULL,
    perfil ENUM('master', 'comum') NOT NULL DEFAULT 'comum',
    ativo TINYINT(1) NOT NULL DEFAULT 1,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO usuarios (
    nome_completo, data_nascimento, sexo, nome_materno, cpf, email,
    telefone_celular, cep, logradouro, numero, bairro, cidade, uf,
    login, senha_hash, resposta_nome_mae, resposta_data_nascimento, resposta_cep, perfil
) VALUES (
    'Administrador do Sistema Pet Shop', '1990-01-01', 'Outro', 'Nao Informado', '00000000191', 'admin@petshop.local',
    '(+55)21-999999999', '20000000', 'Sede Administrativa', '1', 'Centro', 'Rio de Janeiro', 'RJ',
    'master', '$2y$12$YXaQgT4yusnJ/R1EI7dTfe.KCZOnXdCC2R83G60xs/p8PwrPOQJIi', 'Nao Informado', '1990-01-01', '20000000', 'master'
);

CREATE TABLE log_autenticacao (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NULL,
    nome VARCHAR(80) NOT NULL,
    cpf CHAR(11) NOT NULL,
    perfil ENUM('master', 'comum') NOT NULL DEFAULT 'comum',
    data_hora DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    pergunta_2fa ENUM('nome_mae', 'data_nascimento', 'cep') NOT NULL,
    sucesso TINYINT(1) NOT NULL,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE SET NULL
);

CREATE TABLE categorias (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(60) NOT NULL UNIQUE
);

CREATE TABLE produtos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    categoria_id INT NULL,
    nome VARCHAR(100) NOT NULL,
    descricao TEXT NOT NULL,
    preco DECIMAL(10, 2) NOT NULL,
    imagem VARCHAR(255) NULL,
    especie_indicada ENUM('Cães', 'Gatos', 'Cães e gatos') NOT NULL DEFAULT 'Cães e gatos',
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (categoria_id) REFERENCES categorias(id) ON DELETE SET NULL
);

CREATE TABLE pedidos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL,
    numero_pedido VARCHAR(20) NOT NULL UNIQUE,
    subtotal DECIMAL(10, 2) NOT NULL,
    entrega DECIMAL(10, 2) NOT NULL DEFAULT 0,
    total DECIMAL(10, 2) NOT NULL,
    forma_pagamento ENUM('credito', 'debito', 'pix') NOT NULL,
    cartao_final CHAR(4) NULL,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

CREATE TABLE itens_pedido (
    id INT AUTO_INCREMENT PRIMARY KEY,
    pedido_id INT NOT NULL,
    produto_id INT NULL,
    nome_produto VARCHAR(100) NOT NULL,
    preco_unitario DECIMAL(10, 2) NOT NULL,
    quantidade INT NOT NULL,
    FOREIGN KEY (pedido_id) REFERENCES pedidos(id) ON DELETE CASCADE,
    FOREIGN KEY (produto_id) REFERENCES produtos(id) ON DELETE SET NULL
);

INSERT INTO categorias (nome) VALUES
    ('Ração'),
    ('Higiene e Banho'),
    ('Brinquedos'),
    ('Acessórios'),
    ('Serviços'),
    ('Petisco');

INSERT INTO produtos (categoria_id, nome, descricao, preco, imagem, especie_indicada) VALUES
    (1, 'Ração Premium Cães Adultos 15kg', 'Ração completa para cães adultos de porte médio e grande, com carne e cereais integrais.', 189.90, 'https://images.pexels.com/photos/8434633/pexels-photo-8434633.jpeg?auto=compress&cs=tinysrgb&w=800', 'Cães'),
    (6, 'Petisco Natural em Bifinho 200g', 'Petisco desidratado sem conservantes, ideal para treinamento e recompensa.', 28.90, 'https://images.pexels.com/photos/8434641/pexels-photo-8434641.jpeg?auto=compress&cs=tinysrgb&w=800', 'Cães'),
    (1, 'Ração Filhotes Gatos 3kg', 'Fórmula balanceada para o desenvolvimento de filhotes felinos até 12 meses.', 79.90, 'https://images.pexels.com/photos/27130348/pexels-photo-27130348.jpeg?auto=compress&cs=tinysrgb&w=800', 'Gatos'),
    (2, 'Shampoo Neutro Pet 500ml', 'Shampoo hipoalergênico para todos os tipos de pelagem, sem corantes.', 34.50, 'https://images.pexels.com/photos/6131158/pexels-photo-6131158.jpeg?auto=compress&cs=tinysrgb&w=800', 'Cães e gatos'),
    (2, 'Toalha de Microfibra Secagem Rápida', 'Toalha de alta absorção para depois do banho, reduz o tempo de secagem.', 42.00, 'https://images.pexels.com/photos/6131158/pexels-photo-6131158.jpeg?auto=compress&cs=tinysrgb&w=800', 'Cães e gatos'),
    (3, 'Bola Mordedora Resistente', 'Brinquedo de borracha atóxica para cães de todos os portes, flutua na água.', 24.90, 'https://images.pexels.com/photos/26843463/pexels-photo-26843463.jpeg?auto=compress&cs=tinysrgb&w=800', 'Cães'),
    (3, 'Corda de Algodão para Puxar', 'Brinquedo trançado que ajuda na limpeza dos dentes durante a brincadeira.', 19.90, 'https://images.pexels.com/photos/26843463/pexels-photo-26843463.jpeg?auto=compress&cs=tinysrgb&w=800', 'Cães'),
    (4, 'Coleira Ajustável com Guia', 'Kit coleira e guia em nylon reforçado, tamanhos P, M e G.', 59.90, 'https://images.pexels.com/photos/20843108/pexels-photo-20843108.jpeg?auto=compress&cs=tinysrgb&w=800', 'Cães e gatos'),
    (4, 'Comedouro Duplo Inox', 'Comedouro de aço inoxidável com base antiderrapante, fácil de higienizar.', 45.00, 'https://images.pexels.com/photos/20843108/pexels-photo-20843108.jpeg?auto=compress&cs=tinysrgb&w=800', 'Cães e gatos'),
    (5, 'Banho e Tosa Completo', 'Serviço de banho, tosa higiênica, corte de unhas e limpeza de ouvidos.', 89.90, 'https://images.pexels.com/photos/3299903/pexels-photo-3299903.jpeg?auto=compress&cs=tinysrgb&w=800', 'Cães e gatos'),
    (5, 'Tosa na Tesoura para Raças de Porte Pequeno', 'Acabamento manual na tesoura, indicado para poodles e raças de pelo longo.', 119.90, 'https://images.pexels.com/photos/3299903/pexels-photo-3299903.jpeg?auto=compress&cs=tinysrgb&w=800', 'Cães'),
    (3, 'Varinha com Pena', 'Vareta flexível com penas e guizo na ponta, estimula o instinto de caça do gato.', 22.90, 'https://images.pexels.com/photos/27130348/pexels-photo-27130348.jpeg?auto=compress&cs=tinysrgb&w=800', 'Gatos'),
    (4, 'Caminha Conforto', 'Caminha acolchoada redonda com base antiderrapante, lavável na máquina.', 129.90, 'https://images.pexels.com/photos/20843108/pexels-photo-20843108.jpeg?auto=compress&cs=tinysrgb&w=800', 'Cães e gatos'),
    (2, 'Areia Higiênica 4kg', 'Areia aglomerante com controle de odor, para caixas de areia de gatos.', 38.90, 'https://images.pexels.com/photos/27130348/pexels-photo-27130348.jpeg?auto=compress&cs=tinysrgb&w=800', 'Gatos');
