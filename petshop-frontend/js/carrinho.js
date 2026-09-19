const CUSTO_ENTREGA = 15.9;
const FRETE_GRATIS_ACIMA_DE = 150;

function calcularEntrega(subtotal) {
  return subtotal >= FRETE_GRATIS_ACIMA_DE || subtotal === 0 ? 0 : CUSTO_ENTREGA;
}

function renderizarCarrinhoPagina() {
  const carrinho = obterCarrinho();
  const vazio = document.getElementById('carrinho-vazio');
  const layout = document.getElementById('carrinho-layout');
  const subtituloEl = document.getElementById('subtitulo-carrinho');

  if (carrinho.length === 0) {
    vazio.hidden = false;
    layout.hidden = true;
    subtituloEl.textContent = '';
    return;
  }

  vazio.hidden = true;
  layout.hidden = false;
  const totalItens = carrinho.reduce((total, item) => total + item.quantidade, 0);
  subtituloEl.textContent = `${totalItens} ${totalItens === 1 ? 'item' : 'itens'} no carrinho`;

  const lista = document.getElementById('lista-itens-carrinho');
  lista.innerHTML = '';

  carrinho.forEach((item) => {
    const linha = document.createElement('div');
    linha.className = 'carrinho-item';
    linha.innerHTML = `
      <img src="${item.imagem}" alt="${item.nome}">
      <div>
        <p class="carrinho-item-nome">${item.nome}</p>
        <p class="carrinho-item-preco">${formatarPreco(item.preco)} cada</p>
        <div class="carrinho-item-acoes">
          <div class="seletor-quantidade">
            <button type="button" data-acao="menos" data-id="${item.id}">−</button>
            <span>${item.quantidade}</span>
            <button type="button" data-acao="mais" data-id="${item.id}">+</button>
          </div>
          <button type="button" class="carrinho-item-remover" data-acao="remover" data-id="${item.id}">Remover</button>
        </div>
      </div>
      <strong>${formatarPreco(item.preco * item.quantidade)}</strong>
    `;
    lista.appendChild(linha);
  });

  lista.querySelectorAll('[data-acao="mais"]').forEach((botao) => {
    botao.addEventListener('click', () => {
      const item = carrinho.find((produto) => produto.id === Number(botao.dataset.id));
      atualizarQuantidadeCarrinho(item.id, item.quantidade + 1);
      renderizarCarrinhoPagina();
    });
  });

  lista.querySelectorAll('[data-acao="menos"]').forEach((botao) => {
    botao.addEventListener('click', () => {
      const item = carrinho.find((produto) => produto.id === Number(botao.dataset.id));
      if (item.quantidade <= 1) return;
      atualizarQuantidadeCarrinho(item.id, item.quantidade - 1);
      renderizarCarrinhoPagina();
    });
  });

  lista.querySelectorAll('[data-acao="remover"]').forEach((botao) => {
    botao.addEventListener('click', () => {
      removerDoCarrinho(Number(botao.dataset.id));
      mostrarAviso('Item removido do carrinho');
      renderizarCarrinhoPagina();
    });
  });

  const subtotal = calcularTotalCarrinho(carrinho);
  const entrega = calcularEntrega(subtotal);
  document.getElementById('resumo-subtotal').textContent = formatarPreco(subtotal);
  document.getElementById('resumo-entrega').textContent = entrega === 0 ? 'Grátis' : formatarPreco(entrega);
  document.getElementById('resumo-total').textContent = formatarPreco(subtotal + entrega);
}

document.getElementById('botao-ir-pagamento').addEventListener('click', () => {
  window.location.href = 'pagamento.html';
});

carregarSessao().then((usuario) => {
  if (!usuario) {
    sessionStorage.setItem('redirecionarApos', 'carrinho.html');
    window.location.href = 'login.html';
    return;
  }
  renderizarCarrinhoPagina();
});
