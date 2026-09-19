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
    const resposta = await fetch(`${API_BASE}/produtos.php?id=${encodeURIComponent(idProduto)}`, { credentials: 'include' });
    const dados = await resposta.json();

    if (!resposta.ok || !dados.sucesso) {
      throw new Error('Produto não encontrado');
    }

    produtoCarregado = dados.produto;
    document.getElementById('produto-imagem').src = produtoCarregado.imagem;
    document.getElementById('produto-imagem').alt = produtoCarregado.nome;
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
