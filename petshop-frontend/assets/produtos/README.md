# Fotos dos produtos

Esta pasta esta preparada para receber as fotos. **Nenhuma foto foi baixada ou criada.**
O nome esperado para cada arquivo esta na tabela abaixo e ja consta no schema e
na copia offline do catalogo. Coloque a foto nesta pasta com o nome exato para
ela aparecer, sem editar o JavaScript de exibicao.

Enquanto a foto nao existir, o site mostra **Foto em breve**. Nao crie arquivos
.jpg vazios: salve uma imagem real. Os nomes diferenciam maiusculas/minusculas
no Linux; mantenha os nomes em minusculas.

| Produto | Coloque a foto neste arquivo |
|---|---|
| Ração Premium Cães Adultos 15kg | `racao-premium-caes-adultos-15kg.jpg` |
| Petisco Natural em Bifinho 200g | `petisco-natural-em-bifinho-200g.jpg` |
| Ração Filhotes Gatos 3kg | `racao-filhotes-gatos-3kg.jpg` |
| Shampoo Neutro Pet 500ml | `shampoo-neutro-pet-500ml.jpg` |
| Toalha de Microfibra Secagem Rápida | `toalha-de-microfibra-secagem-rapida.jpg` |
| Bola Mordedora Resistente | `bola-mordedora-resistente.jpg` |
| Corda de Algodão para Puxar | `corda-de-algodao-para-puxar.jpg` |
| Coleira Ajustável com Guia | `coleira-ajustavel-com-guia.jpg` |
| Comedouro Duplo Inox | `comedouro-duplo-inox.jpg` |
| Banho e Tosa Completo | `banho-e-tosa-completo.jpg` |
| Tosa na Tesoura para Raças de Porte Pequeno | `tosa-na-tesoura-para-racas-de-porte-pequeno.jpg` |
| Varinha com Pena | `varinha-com-pena.jpg` |
| Caminha Conforto | `caminha-conforto.jpg` |
| Areia Higiênica 4kg | `areia-higienica-4kg.jpg` |
| Ração para Gatos Castrados 3kg | `racao-para-gatos-castrados-3kg.jpg` |
| Ração Premium Filhotes de Cães 10kg | `racao-premium-filhotes-de-caes-10kg.jpg` |
| Ração Cães Adultos Porte Pequeno 7kg | `racao-caes-adultos-porte-pequeno-7kg.jpg` |
| Ração Gatos Adultos Sabor Salmão 3kg | `racao-gatos-adultos-sabor-salmao-3kg.jpg` |
| Petisco Dental para Cães 7 unidades | `petisco-dental-para-caes-7-unidades.jpg` |
| Sachê para Gatos Sabor Atum 70g | `sache-para-gatos-sabor-atum-70g.jpg` |
| Biscoito Natural para Cães 250g | `biscoito-natural-para-caes-250g.jpg` |
| Snack Cremoso para Gatos 4 unidades | `snack-cremoso-para-gatos-4-unidades.jpg` |
| Condicionador Pet Hidratante 500ml | `condicionador-pet-hidratante-500ml.jpg` |
| Escova Removedora de Pelos | `escova-removedora-de-pelos.jpg` |
| Lenço Umedecido Pet 50 unidades | `lenco-umedecido-pet-50-unidades.jpg` |
| Tapete Higiênico Absorvente 30 unidades | `tapete-higienico-absorvente-30-unidades.jpg` |
| Ratinho de Pelúcia com Catnip | `ratinho-de-pelucia-com-catnip.jpg` |
| Frisbee de Borracha Flexível | `frisbee-de-borracha-flexivel.jpg` |
| Túnel Dobrável para Gatos | `tunel-dobravel-para-gatos.jpg` |
| Pelúcia com Apito para Cães | `pelucia-com-apito-para-caes.jpg` |
| Peitoral Ajustável Acolchoado | `peitoral-ajustavel-acolchoado.jpg` |
| Bebedouro Fonte Automático 2L | `bebedouro-fonte-automatico-2l.jpg` |
| Caixa de Transporte Nº 3 | `caixa-de-transporte-no-3.jpg` |
| Arranhador Torre para Gatos | `arranhador-torre-para-gatos.jpg` |
| Hidratação de Pelos | `hidratacao-de-pelos.jpg` |
| Corte de Unhas | `corte-de-unhas.jpg` |
| Escovação de Dentes | `escovacao-de-dentes.jpg` |
| Tosa Higiênica | `tosa-higienica.jpg` |

## Depois de adicionar as fotos

1. Compartilhe os arquivos pelo Git.
2. Bancos novos recebem os caminhos locais ao importar `petshop-backend/sql/schema.sql`.
3. **Lembrete pendente:** atualizar o catalogo do banco local com
   `php petshop-backend/scripts/atualizar_catalogo.php`, com as credenciais do
   MySQL no ambiente. Isso ainda nao foi executado no banco real.
4. O atualizador regenera `produtos-fallback.js` com os IDs do banco.
5. Recarregue a pagina. Um carrinho antigo pode conter links anteriores; o
   caminho de imagem e salvo junto com o item. Limpe o carrinho e adicione os
   produtos novamente apos atualizar o catalogo.

Para usar outra extensao/nome, atualize tambem o caminho correspondente no
schema e sincronize o catalogo; alterar apenas o nome do arquivo nao basta.
