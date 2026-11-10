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
    (1, 'Ração Premium Cães Adultos 15kg', 'Ração completa para cães adultos de porte médio e grande, com carne e cereais integrais.', 189.90, 'https://images.pexels.com/photos/8434633/pexels-photo-8434633.jpeg?auto=compress&cs=tinysrgb&w=800', 'Cães'),
    (6, 'Petisco Natural em Bifinho 200g', 'Petisco desidratado sem conservantes, ideal para treinamento e recompensa.', 28.90, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSOA6-gfX9eoclSH-ufKPckr7BK8pFsbILYg4OMQJvfAw&s=10', 'Cães'),
    (1, 'Ração Filhotes Gatos 3kg', 'Fórmula balanceada para o desenvolvimento de filhotes felinos até 12 meses.', 79.90, 'https://images.pexels.com/photos/27130348/pexels-photo-27130348.jpeg?auto=compress&cs=tinysrgb&w=800', 'Gatos'),
    (2, 'Shampoo Neutro Pet 500ml', 'Shampoo hipoalergênico para todos os tipos de pelagem, sem corantes.', 34.50, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRk_TJy-u1BbHo1ZP4Tx08pcuCFVLCQGjRRkniu-lxHiw&s=10', 'Cães e gatos'),
    (2, 'Toalha de Microfibra Secagem Rápida', 'Toalha de alta absorção para depois do banho, reduz o tempo de secagem.', 42.00, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSCUx-u0V2_UVvqhN7ntUNkVxswIUqd74Zy4m0qD9Vvkg&s=10', 'Cães e gatos'),
    (3, 'Bola Mordedora Resistente', 'Brinquedo de borracha atóxica para cães de todos os portes, flutua na água.', 24.90, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSLz2VqAZQvcnds99BSBSr3Ru-xEJM-YqbSnFhATyj4HQ&s=10', 'Cães'),
    (3, 'Corda de Algodão para Puxar', 'Brinquedo trançado que ajuda na limpeza dos dentes durante a brincadeira.', 19.90, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTg2ridcNCbUM8zM0yrl9MgWMkFOG9syaU6TKD2cA20kg&s=10', 'Cães'),
    (4, 'Coleira Ajustável com Guia', 'Kit coleira e guia em nylon reforçado, tamanhos P, M e G.', 59.90, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQKkqqsHURs2_6mqYWsfdVHhxchU_8JzFcFgSmO6g-tvQ&s', 'Cães e gatos'),
    (4, 'Comedouro Duplo Inox', 'Comedouro de aço inoxidável com base antiderrapante, fácil de higienizar.', 45.00, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT6_wxremJWE8F2r7skWMBGusGmUzYVGzpW7tPddYkKcg&s=10', 'Cães e gatos'),
    (5, 'Banho e Tosa Completo', 'Serviço de banho, tosa higiênica, corte de unhas e limpeza de ouvidos.', 89.90, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTYRx4B5v60pZmWZt69qYBLgBJwtZBOhnEZnnSJyhx-4g&s=10', 'Cães e gatos'),
    (5, 'Tosa na Tesoura para Raças de Porte Pequeno', 'Acabamento manual na tesoura, indicado para poodles e raças de pelo longo.', 119.90, 'https://images.pexels.com/photos/3299903/pexels-photo-3299903.jpeg?auto=compress&cs=tinysrgb&w=800', 'Cães'),
    (3, 'Varinha com Pena', 'Vareta flexível com penas e guizo na ponta, estimula o instinto de caça do gato.', 22.90, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRXhpnGix214AFqhpYfUmYwkMdiU_EgQ1qpXEH5ywpZcQ&s=10', 'Gatos'),
    (4, 'Caminha Conforto', 'Caminha acolchoada redonda com base antiderrapante, lavável na máquina.', 129.90, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSsSg5oHFQsSdSkOopNdHJwLqIrX4F6Xah_U1Ja-TgZQQ&s=10', 'Cães e gatos'),
    (2, 'Areia Higiênica 4kg', 'Areia aglomerante com controle de odor, para caixas de areia de gatos.', 38.90, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSUk4OaQx5c7Xh7BqGl7NvoaDPyMTsZ-idfvTOvkM9LzA&s=10', 'Gatos'),
    (1, 'Ração para Gatos Castrados 3kg', 'Fórmula com baixo teor de gordura e minerais controlados, indicada para gatos castrados adultos.', 84.90, 'https://images.pexels.com/photos/27130348/pexels-photo-27130348.jpeg?auto=compress&cs=tinysrgb&w=800', 'Gatos'),
    (1, 'Ração Premium Filhotes de Cães 10kg', 'Ração completa com DHA para o desenvolvimento de cães filhotes de raças médias.', 169.90, 'https://agrosolo.fbitsstatic.net/img/p/racao-premier-para-caes-racas-especificas-golden-retriever-filhotes-sabor-frango-10kg-84200/279340-1.jpg?w=1000&h=1000&v=no-value', 'Cães'),
    (1, 'Ração Cães Adultos Porte Pequeno 7kg', 'Grãos pequenos e fáceis de mastigar, desenvolvida para cães adultos de raças pequenas.', 129.90, 'https://agrosolo.fbitsstatic.net/img/p/racao-premier-para-caes-racas-especificas-golden-retriever-filhotes-sabor-frango-10kg-84200/279340-1.jpg?w=1000&h=1000&v=no-value', 'Cães'),
    (1, 'Ração Gatos Adultos Sabor Salmão 3kg', 'Ração completa para gatos adultos, com salmão e ômega 3 para manter a pelagem saudável.', 89.90, 'https://adimax.com.br/wp-content/uploads/2024/06/380.2.2.V1_R1_Origens_class_gato_adulto_frango_salmao_frente-e1783688517532.webp', 'Gatos'),
    (6, 'Petisco Dental para Cães 7 unidades', 'Bastões que ajudam a reduzir a formação de tártaro enquanto o cão mastiga.', 32.90, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQbvUcDgKGTrziU4yJazfysCEHdXANJx1MjjcupKYZ9_DaBpGbtFP5lAE17&s=10', 'Cães'),
    (6, 'Sachê para Gatos Sabor Atum 70g', 'Alimento úmido complementar com pedaços macios de atum ao molho.', 4.90, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQyraEKfc_lIUWL_DqB3hmj7KkmyeYzA_JQbMFZX9sg_MWSFJPaKOx5xpE&s=10', 'Gatos'),
    (6, 'Biscoito Natural para Cães 250g', 'Biscoitos assados sem corantes artificiais, ótimos como recompensa no adestramento.', 18.90, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSvcDBdhXVLZoe3nVajTioWN0vwB1-qHpU79psNM3XrYuDAaNE6Q_fxcxY&s=10', 'Cães'),
    (6, 'Snack Cremoso para Gatos 4 unidades', 'Petisco cremoso sabor frango em bisnagas individuais, que ajuda a hidratar e agrada o paladar felino.', 14.90, NULL, 'Gatos'),
    (2, 'Condicionador Pet Hidratante 500ml', 'Facilita o desembaraço dos pelos e deixa a pelagem macia e perfumada após o banho.', 36.90, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRA8o8qZ-EHPDggcsklWlSgoozAiRVmpKP5lhDJMD1EZvrPPgR8-OXo-BJF&s=10', 'Cães e gatos'),
    (2, 'Escova Removedora de Pelos', 'Escova com cerdas macias que remove os pelos soltos e massageia a pele do animal.', 27.90, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQID1uK8Kn7wgTGfzPWFHuaoh-qCxN7_AB6nnWBJO8Xi84hw2hTJiXq-33h&s=10', 'Cães e gatos'),
    (2, 'Lenço Umedecido Pet 50 unidades', 'Lenços hipoalergênicos para limpeza rápida de patas, focinho e pelagem.', 19.90, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSInicEd9-RIyrwN6eIoeIKYxOPIUoh-DhwS3RuY9zVwJSAC8arXy3CEa8&s=10', 'Cães e gatos'),
    (2, 'Tapete Higiênico Absorvente 30 unidades', 'Tapetes com gel superabsorvente e controle de odor, ideais para o treino de xixi de cães.', 59.90, 'https://encrypted-tbn3.gstatic.com/shopping?q=tbn:ANd9GcTT4UQQ_sVL0TdgTL3CNpDKVHznHNACW20iPR0ujLe0fIvvcs4gCzX2pUPeFTzOphqwPL4uIYfgCauNYh5K4XmZcrmD09k2jOpYYyJEDdOOGTrn-VIASiKreAj4', 'Cães'),
    (3, 'Ratinho de Pelúcia com Catnip', 'Ratinho macio recheado com catnip para estimular a brincadeira dos gatos.', 12.90, 'https://encrypted-tbn3.gstatic.com/shopping?q=tbn:ANd9GcSCPRVy-_4DIe09mXVHuGk5WRDcEQwYU1dML0iWY060naZX7XGqN0cyVmtxq-pgsDyKAW1NN8tGXVAbejh5mJBU0P5e9EwtnSCmMnYd2lUH-bYMHUNd8o2s', 'Gatos'),
    (3, 'Frisbee de Borracha Flexível', 'Disco flexível e resistente para brincadeiras ao ar livre com cães.', 29.90, 'https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcTRLLr5vXdTWGqCcof2gQilgzMHV5zh0BSO8Til7ffys4J8525Y3wSza59CAv7uqBHFNk5XFgGMO0WvEZBYjSCCtQRGtb1yFtILb2sONDk&usqp=CAc', 'Cães'),
    (3, 'Túnel Dobrável para Gatos', 'Túnel com bolinha pendurada que estimula a exploração e dobra para guardar.', 54.90, 'https://encrypted-tbn2.gstatic.com/shopping?q=tbn:ANd9GcQ92N3VwO0yCj0vtPKTNbSyzFIEqpLNxkIWZcVtrMtg98CEp983sRKkWJC5W-GtS82GIStM3J_45ElXyBZTkPWJdhJ1Tu009yYSoh94DdSefe9EuyoMrfuAbIY', 'Gatos'),
    (3, 'Pelúcia com Apito para Cães', 'Pelúcia resistente com apito interno, indicada para cães de pequeno e médio porte.', 26.90, 'https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcSq44uyVQXn_R8AlZuLdxHIKYFFfwb3Rpg046ZSWaDbBb2fU7fwGDOU0LFq1pokxqI06cs8S3es6Td3Cq-0uAJvH6H4Qa17', 'Cães'),
    (4, 'Peitoral Ajustável Acolchoado', 'Peitoral com acolchoado macio, fecho rápido e ajuste em três pontos para maior conforto no passeio.', 64.90, 'https://http2.mlstatic.com/D_NQ_NP_2X_871985-MLB96168741879_102025-F-coleira-para-cachorros-kit-guia-amortecedor-de-puxoes-pet.webp', 'Cães'),
    (4, 'Bebedouro Fonte Automático 2L', 'Fonte com filtro e circulação contínua de água, que estimula a hidratação dos pets.', 119.90, 'https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRNOc1nApg7Q5ODp7_AS82Mw0D6NtPybYINtNNSrZsYFWoo9R3gCGvxW_vlkQbsk39hqJi5H8BQ8V7hlFZJgSs1WyUIn3yaRA', 'Cães e gatos'),
    (4, 'Caixa de Transporte Nº 3', 'Caixa de transporte rígida com ventilação lateral e porta de grade, para cães e gatos de pequeno e médio porte.', 99.90, 'https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcT-qDOl3BMzXaJyXJFbrTcIaSSrvQc_bAcOidghv8bpA5PbyzC6kdwTXuQozMpnPQWkr0o7Gbf41TNZhdDmk1Y87b4l1pK6egbdLR4bRuBcCa__UDa_KxvVvA', 'Cães e gatos'),
    (4, 'Arranhador Torre para Gatos', 'Torre com revestimento de sisal e plataformas, que preserva sofás e móveis.', 189.90, NULL, 'Gatos'),
    (5, 'Hidratação de Pelos', 'Tratamento com máscara hidratante que devolve brilho e maciez à pelagem.', 49.90, NULL, 'Cães e gatos'),
    (5, 'Corte de Unhas', 'Corte e lixamento das unhas feitos com cuidado por profissional treinado.', 25.00, NULL, 'Cães e gatos'),
    (5, 'Escovação de Dentes', 'Higiene bucal com pasta própria para pets, ajuda a prevenir tártaro e mau hálito.', 35.00, NULL, 'Cães'),
    (5, 'Tosa Higiênica', 'Aparo das regiões íntimas, patas e barriga para mais higiene no dia a dia.', 45.00, NULL, 'Cães e gatos');
