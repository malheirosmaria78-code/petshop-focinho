let produtosCarregados = [];

function agruparPorCategoria(produtos) {
  const grupos = new Map();
  produtos.forEach((produto) => {
    const categoria = produto.categoria || 'Outros';
    if (!grupos.has(categoria)) {
      grupos.set(categoria, []);
    }
    grupos.get(categoria).push(produto);
  });
  return grupos;
}

function renderizarCatalogo(produtos) {
  const container = document.getElementById('grupos-categorias');
  const estadoVazio = document.getElementById('estado-vazio');
  const contagem = document.getElementById('contagem-resultados');

  container.innerHTML = '';

  if (produtos.length === 0) {
    estadoVazio.hidden = false;
    contagem.textContent = '';
    return;
  }

  estadoVazio.hidden = true;
  contagem.textContent = `${produtos.length} produto${produtos.length === 1 ? '' : 's'}`;

  const grupos = agruparPorCategoria(produtos);

  grupos.forEach((itens, categoria) => {
    const secao = document.createElement('div');
    secao.className = 'categoria-grupo';

    const titulo = document.createElement('h3');
    titulo.className = 'categoria-titulo';
    titulo.textContent = categoria;
    secao.appendChild(titulo);

    const grade = document.createElement('div');
    grade.className = 'produtos-grade';

    itens.forEach((produto) => {
      const card = document.createElement('article');
      card.className = 'produto-card';
      card.innerHTML = `
        <a href="produto.html?id=${produto.id}" class="produto-foto">
          <img src="${produto.imagem}" alt="${produto.nome}" loading="lazy">
        </a>
        <a href="produto.html?id=${produto.id}" class="produto-nome-link">
          <h4 class="produto-nome">${produto.nome}</h4>
        </a>
        <p class="produto-descricao">${produto.descricao}</p>
        <div class="produto-rodape">
          <span class="produto-preco">${formatarPreco(produto.preco)}</span>
          <button type="button" data-produto="${produto.id}" class="botao-adicionar-rapido">Adicionar</button>
        </div>
      `;
      grade.appendChild(card);
      card.querySelector('.botao-adicionar-rapido').addEventListener('click', () => {
        adicionarAoCarrinho(produto, 1);
        mostrarAviso(`${produto.nome} adicionado ao carrinho`);
      });
    });

    secao.appendChild(grade);
    container.appendChild(secao);
  });
}

async function carregarProdutos() {
  const carregando = document.getElementById('estado-carregando');
  const erro = document.getElementById('estado-erro');

  carregando.hidden = false;
  erro.hidden = true;

  try {
    const resposta = await fetch(`${API_BASE}/produtos.php`, { credentials: 'include' });
    const dados = await resposta.json();

    if (!resposta.ok || !dados.sucesso) {
      throw new Error(dados.mensagem || 'Falha ao carregar produtos');
    }

    produtosCarregados = dados.produtos;
    renderizarCatalogo(produtosCarregados);
  } catch (falha) {
    erro.hidden = false;
  } finally {
    carregando.hidden = true;
  }
}

function filtrarProdutos(termo) {
  const termoNormalizado = termo.trim().toLowerCase();
  if (termoNormalizado === '') {
    renderizarCatalogo(produtosCarregados);
    return;
  }
  const filtrados = produtosCarregados.filter((produto) =>
    produto.nome.toLowerCase().includes(termoNormalizado)
  );
  renderizarCatalogo(filtrados);
}

document.getElementById('form-busca').addEventListener('submit', (evento) => {
  evento.preventDefault();
  filtrarProdutos(document.getElementById('busca-produto').value);
});

document.getElementById('busca-produto').addEventListener('input', (evento) => {
  filtrarProdutos(evento.target.value);
});

carregarProdutos();
