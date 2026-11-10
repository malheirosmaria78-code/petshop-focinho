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
    desativado_em DATETIME NULL,
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
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE RESTRICT
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
    (1, 'Ração Premium Cães Adultos 15kg', 'Ração completa para cães adultos de porte médio e grande, com carne e cereais integrais.', 189.90, 'assets/produtos/racao-premium-caes-adultos-15kg.jpg', 'Cães'),
    (6, 'Petisco Natural em Bifinho 200g', 'Petisco desidratado sem conservantes, ideal para treinamento e recompensa.', 28.90, 'assets/produtos/petisco-natural-em-bifinho-200g.jpg', 'Cães'),
    (1, 'Ração Filhotes Gatos 3kg', 'Fórmula balanceada para o desenvolvimento de filhotes felinos até 12 meses.', 79.90, 'assets/produtos/racao-filhotes-gatos-3kg.jpg', 'Gatos'),
    (2, 'Shampoo Neutro Pet 500ml', 'Shampoo hipoalergênico para todos os tipos de pelagem, sem corantes.', 34.50, 'assets/produtos/shampoo-neutro-pet-500ml.jpg', 'Cães e gatos'),
    (2, 'Toalha de Microfibra Secagem Rápida', 'Toalha de alta absorção para depois do banho, reduz o tempo de secagem.', 42.00, 'assets/produtos/toalha-de-microfibra-secagem-rapida.jpg', 'Cães e gatos'),
    (3, 'Bola Mordedora Resistente', 'Brinquedo de borracha atóxica para cães de todos os portes, flutua na água.', 24.90, 'assets/produtos/bola-mordedora-resistente.jpg', 'Cães'),
    (3, 'Corda de Algodão para Puxar', 'Brinquedo trançado que ajuda na limpeza dos dentes durante a brincadeira.', 19.90, 'assets/produtos/corda-de-algodao-para-puxar.jpg', 'Cães'),
    (4, 'Coleira Ajustável com Guia', 'Kit coleira e guia em nylon reforçado, tamanhos P, M e G.', 59.90, 'assets/produtos/coleira-ajustavel-com-guia.jpg', 'Cães e gatos'),
    (4, 'Comedouro Duplo Inox', 'Comedouro de aço inoxidável com base antiderrapante, fácil de higienizar.', 45.00, 'assets/produtos/comedouro-duplo-inox.jpg', 'Cães e gatos'),
    (5, 'Banho e Tosa Completo', 'Serviço de banho, tosa higiênica, corte de unhas e limpeza de ouvidos.', 89.90, 'assets/produtos/banho-e-tosa-completo.jpg', 'Cães e gatos'),
    (5, 'Tosa na Tesoura para Raças de Porte Pequeno', 'Acabamento manual na tesoura, indicado para poodles e raças de pelo longo.', 119.90, 'assets/produtos/tosa-na-tesoura-para-racas-de-porte-pequeno.jpg', 'Cães'),
    (3, 'Varinha com Pena', 'Vareta flexível com penas e guizo na ponta, estimula o instinto de caça do gato.', 22.90, 'assets/produtos/varinha-com-pena.jpg', 'Gatos'),
    (4, 'Caminha Conforto', 'Caminha acolchoada redonda com base antiderrapante, lavável na máquina.', 129.90, 'assets/produtos/caminha-conforto.jpg', 'Cães e gatos'),
    (2, 'Areia Higiênica 4kg', 'Areia aglomerante com controle de odor, para caixas de areia de gatos.', 38.90, 'assets/produtos/areia-higienica-4kg.jpg', 'Gatos'),
    (1, 'Ração para Gatos Castrados 3kg', 'Fórmula com baixo teor de gordura e minerais controlados, indicada para gatos castrados adultos.', 84.90, 'assets/produtos/racao-para-gatos-castrados-3kg.jpg', 'Gatos'),
    (1, 'Ração Premium Filhotes de Cães 10kg', 'Ração completa com DHA para o desenvolvimento de cães filhotes de raças médias.', 169.90, 'assets/produtos/racao-premium-filhotes-de-caes-10kg.jpg', 'Cães'),
    (1, 'Ração Cães Adultos Porte Pequeno 7kg', 'Grãos pequenos e fáceis de mastigar, desenvolvida para cães adultos de raças pequenas.', 129.90, 'assets/produtos/racao-caes-adultos-porte-pequeno-7kg.jpg', 'Cães'),
    (1, 'Ração Gatos Adultos Sabor Salmão 3kg', 'Ração completa para gatos adultos, com salmão e ômega 3 para manter a pelagem saudável.', 89.90, 'assets/produtos/racao-gatos-adultos-sabor-salmao-3kg.jpg', 'Gatos'),
    (6, 'Petisco Dental para Cães 7 unidades', 'Bastões que ajudam a reduzir a formação de tártaro enquanto o cão mastiga.', 32.90, 'assets/produtos/petisco-dental-para-caes-7-unidades.jpg', 'Cães'),
    (6, 'Sachê para Gatos Sabor Atum 70g', 'Alimento úmido complementar com pedaços macios de atum ao molho.', 4.90, 'assets/produtos/sache-para-gatos-sabor-atum-70g.jpg', 'Gatos'),
    (6, 'Biscoito Natural para Cães 250g', 'Biscoitos assados sem corantes artificiais, ótimos como recompensa no adestramento.', 18.90, 'assets/produtos/biscoito-natural-para-caes-250g.jpg', 'Cães'),
    (6, 'Snack Cremoso para Gatos 4 unidades', 'Petisco cremoso sabor frango em bisnagas individuais, que ajuda a hidratar e agrada o paladar felino.', 14.90, 'assets/produtos/snack-cremoso-para-gatos-4-unidades.jpg', 'Gatos'),
    (2, 'Condicionador Pet Hidratante 500ml', 'Facilita o desembaraço dos pelos e deixa a pelagem macia e perfumada após o banho.', 36.90, 'assets/produtos/condicionador-pet-hidratante-500ml.jpg', 'Cães e gatos'),
    (2, 'Escova Removedora de Pelos', 'Escova com cerdas macias que remove os pelos soltos e massageia a pele do animal.', 27.90, 'assets/produtos/escova-removedora-de-pelos.jpg', 'Cães e gatos'),
    (2, 'Lenço Umedecido Pet 50 unidades', 'Lenços hipoalergênicos para limpeza rápida de patas, focinho e pelagem.', 19.90, 'assets/produtos/lenco-umedecido-pet-50-unidades.jpg', 'Cães e gatos'),
    (2, 'Tapete Higiênico Absorvente 30 unidades', 'Tapetes com gel superabsorvente e controle de odor, ideais para o treino de xixi de cães.', 59.90, 'assets/produtos/tapete-higienico-absorvente-30-unidades.jpg', 'Cães'),
    (3, 'Ratinho de Pelúcia com Catnip', 'Ratinho macio recheado com catnip para estimular a brincadeira dos gatos.', 12.90, 'assets/produtos/ratinho-de-pelucia-com-catnip.jpg', 'Gatos'),
    (3, 'Frisbee de Borracha Flexível', 'Disco flexível e resistente para brincadeiras ao ar livre com cães.', 29.90, 'assets/produtos/frisbee-de-borracha-flexivel.jpg', 'Cães'),
    (3, 'Túnel Dobrável para Gatos', 'Túnel com bolinha pendurada que estimula a exploração e dobra para guardar.', 54.90, 'assets/produtos/tunel-dobravel-para-gatos.jpg', 'Gatos'),
    (3, 'Pelúcia com Apito para Cães', 'Pelúcia resistente com apito interno, indicada para cães de pequeno e médio porte.', 26.90, 'assets/produtos/pelucia-com-apito-para-caes.jpg', 'Cães'),
    (4, 'Peitoral Ajustável Acolchoado', 'Peitoral com acolchoado macio, fecho rápido e ajuste em três pontos para maior conforto no passeio.', 64.90, 'assets/produtos/peitoral-ajustavel-acolchoado.jpg', 'Cães'),
    (4, 'Bebedouro Fonte Automático 2L', 'Fonte com filtro e circulação contínua de água, que estimula a hidratação dos pets.', 119.90, 'assets/produtos/bebedouro-fonte-automatico-2l.jpg', 'Cães e gatos'),
    (4, 'Caixa de Transporte Nº 3', 'Caixa de transporte rígida com ventilação lateral e porta de grade, para cães e gatos de pequeno e médio porte.', 99.90, 'assets/produtos/caixa-de-transporte-no-3.jpg', 'Cães e gatos'),
    (4, 'Arranhador Torre para Gatos', 'Torre com revestimento de sisal e plataformas, que preserva sofás e móveis.', 189.90, 'assets/produtos/arranhador-torre-para-gatos.jpg', 'Gatos'),
    (5, 'Hidratação de Pelos', 'Tratamento com máscara hidratante que devolve brilho e maciez à pelagem.', 49.90, 'assets/produtos/hidratacao-de-pelos.jpg', 'Cães e gatos'),
    (5, 'Corte de Unhas', 'Corte e lixamento das unhas feitos com cuidado por profissional treinado.', 25.00, 'assets/produtos/corte-de-unhas.jpg', 'Cães e gatos'),
    (5, 'Escovação de Dentes', 'Higiene bucal com pasta própria para pets, ajuda a prevenir tártaro e mau hálito.', 35.00, 'assets/produtos/escovacao-de-dentes.jpg', 'Cães'),
    (5, 'Tosa Higiênica', 'Aparo das regiões íntimas, patas e barriga para mais higiene no dia a dia.', 45.00, 'assets/produtos/tosa-higienica.jpg', 'Cães e gatos');
