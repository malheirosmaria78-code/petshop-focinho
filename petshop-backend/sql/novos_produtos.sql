USE petshop;
SET NAMES utf8mb4;

INSERT INTO produtos (categoria_id, nome, descricao, preco, imagem, especie_indicada)
SELECT c.id, n.nome, n.descricao, n.preco, NULL, n.especie
FROM (
    SELECT 'Ração' AS categoria, 'Ração para Gatos Castrados 3kg' AS nome, 'Fórmula com baixo teor de gordura e minerais controlados, indicada para gatos castrados adultos.' AS descricao, 84.90 AS preco, 'Gatos' AS especie
    UNION ALL SELECT 'Ração', 'Ração Premium Filhotes de Cães 10kg', 'Ração completa com DHA para o desenvolvimento de cães filhotes de raças médias.', 169.90, 'Cães'
    UNION ALL SELECT 'Ração', 'Ração Cães Adultos Porte Pequeno 7kg', 'Grãos pequenos e fáceis de mastigar, desenvolvida para cães adultos de raças pequenas.', 129.90, 'Cães'
    UNION ALL SELECT 'Ração', 'Ração Gatos Adultos Sabor Salmão 3kg', 'Ração completa para gatos adultos, com salmão e ômega 3 para manter a pelagem saudável.', 89.90, 'Gatos'

    UNION ALL SELECT 'Petisco', 'Petisco Dental para Cães 7 unidades', 'Bastões que ajudam a reduzir a formação de tártaro enquanto o cão mastiga.', 32.90, 'Cães'
    UNION ALL SELECT 'Petisco', 'Sachê para Gatos Sabor Atum 70g', 'Alimento úmido complementar com pedaços macios de atum ao molho.', 4.90, 'Gatos'
    UNION ALL SELECT 'Petisco', 'Biscoito Natural para Cães 250g', 'Biscoitos assados sem corantes artificiais, ótimos como recompensa no adestramento.', 18.90, 'Cães'
    UNION ALL SELECT 'Petisco', 'Snack Cremoso para Gatos 4 unidades', 'Petisco cremoso sabor frango em bisnagas individuais, que ajuda a hidratar e agrada o paladar felino.', 14.90, 'Gatos'

    UNION ALL SELECT 'Higiene e Banho', 'Condicionador Pet Hidratante 500ml', 'Facilita o desembaraço dos pelos e deixa a pelagem macia e perfumada após o banho.', 36.90, 'Cães e gatos'
    UNION ALL SELECT 'Higiene e Banho', 'Escova Removedora de Pelos', 'Escova com cerdas macias que remove os pelos soltos e massageia a pele do animal.', 27.90, 'Cães e gatos'
    UNION ALL SELECT 'Higiene e Banho', 'Lenço Umedecido Pet 50 unidades', 'Lenços hipoalergênicos para limpeza rápida de patas, focinho e pelagem.', 19.90, 'Cães e gatos'
    UNION ALL SELECT 'Higiene e Banho', 'Tapete Higiênico Absorvente 30 unidades', 'Tapetes com gel superabsorvente e controle de odor, ideais para o treino de xixi de cães.', 59.90, 'Cães'

    UNION ALL SELECT 'Brinquedos', 'Ratinho de Pelúcia com Catnip', 'Ratinho macio recheado com catnip para estimular a brincadeira dos gatos.', 12.90, 'Gatos'
    UNION ALL SELECT 'Brinquedos', 'Frisbee de Borracha Flexível', 'Disco flexível e resistente para brincadeiras ao ar livre com cães.', 29.90, 'Cães'
    UNION ALL SELECT 'Brinquedos', 'Túnel Dobrável para Gatos', 'Túnel com bolinha pendurada que estimula a exploração e dobra para guardar.', 54.90, 'Gatos'
    UNION ALL SELECT 'Brinquedos', 'Pelúcia com Apito para Cães', 'Pelúcia resistente com apito interno, indicada para cães de pequeno e médio porte.', 26.90, 'Cães'

    UNION ALL SELECT 'Acessórios', 'Peitoral Ajustável Acolchoado', 'Peitoral com acolchoado macio, fecho rápido e ajuste em três pontos para maior conforto no passeio.', 64.90, 'Cães'
    UNION ALL SELECT 'Acessórios', 'Bebedouro Fonte Automático 2L', 'Fonte com filtro e circulação contínua de água, que estimula a hidratação dos pets.', 119.90, 'Cães e gatos'
    UNION ALL SELECT 'Acessórios', 'Caixa de Transporte Nº 3', 'Caixa de transporte rígida com ventilação lateral e porta de grade, para cães e gatos de pequeno e médio porte.', 99.90, 'Cães e gatos'
    UNION ALL SELECT 'Acessórios', 'Arranhador Torre para Gatos', 'Torre com revestimento de sisal e plataformas, que preserva sofás e móveis.', 189.90, 'Gatos'

    UNION ALL SELECT 'Serviços', 'Hidratação de Pelos', 'Tratamento com máscara hidratante que devolve brilho e maciez à pelagem.', 49.90, 'Cães e gatos'
    UNION ALL SELECT 'Serviços', 'Corte de Unhas', 'Corte e lixamento das unhas feitos com cuidado por profissional treinado.', 25.00, 'Cães e gatos'
    UNION ALL SELECT 'Serviços', 'Escovação de Dentes', 'Higiene bucal com pasta própria para pets, ajuda a prevenir tártaro e mau hálito.', 35.00, 'Cães'
    UNION ALL SELECT 'Serviços', 'Tosa Higiênica', 'Aparo das regiões íntimas, patas e barriga para mais higiene no dia a dia.', 45.00, 'Cães e gatos'
) AS n
JOIN categorias c ON c.nome = n.categoria
WHERE NOT EXISTS (SELECT 1 FROM produtos p WHERE p.nome = n.nome);
