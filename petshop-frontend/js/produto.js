const idProduto = new URLSearchParams(window.location.search).get('id');
let quantidadeAtual = 1;
let produtoCarregado = null;

async function carregarProduto() {
  const carregando = document.getElementById('estado-carregando');
  const erro = document.getElementById('estado-erro');
  const conteudo = document.getElementById('conteudo-produto');

  if (!idProduto) {
    carregando.hidden = true;
    erro.hidden = false;
    return;
  }

  try {
    const resultado = await buscarProdutoPorId(idProduto);

    produtoCarregado = resultado.produto;
    const imagemProduto = document.getElementById('produto-imagem');
    imagemProduto.onerror = () => {
      imagemProduto.onerror = null;
      imagemProduto.src = IMAGEM_PADRAO;
    };
    imagemProduto.src = urlImagemProduto(produtoCarregado.imagem);
    imagemProduto.alt = produtoCarregado.nome;
    document.getElementById('produto-especie').textContent = produtoCarregado.especie_indicada;
    document.getElementById('produto-nome').textContent = produtoCarregado.nome;
    document.getElementById('produto-preco').textContent = formatarPreco(produtoCarregado.preco);
    document.getElementById('produto-descricao').textContent = produtoCarregado.descricao;
    document.title = `${produtoCarregado.nome} — Casa Focinho`;

    conteudo.hidden = false;
  } catch (falha) {
    erro.hidden = false;
  } finally {
    carregando.hidden = true;
  }
}

document.getElementById('quantidade-mais').addEventListener('click', () => {
  quantidadeAtual += 1;
  document.getElementById('quantidade-valor').textContent = quantidadeAtual;
});

document.getElementById('quantidade-menos').addEventListener('click', () => {
  quantidadeAtual = Math.max(1, quantidadeAtual - 1);
  document.getElementById('quantidade-valor').textContent = quantidadeAtual;
});

document.getElementById('botao-adicionar').addEventListener('click', () => {
  if (!produtoCarregado) return;
  adicionarAoCarrinho(produtoCarregado, quantidadeAtual);
  mostrarAviso(`${produtoCarregado.nome} adicionado ao carrinho`);
});

carregarProduto();
