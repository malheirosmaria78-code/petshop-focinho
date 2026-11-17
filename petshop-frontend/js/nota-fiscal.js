const rotulosPagamento = {
  credito: 'Cartão de crédito',
  debito: 'Cartão de débito',
  pix: 'Pix',
};

async function carregarNotaFiscal() {
  const usuario = await carregarSessao();
  if (!usuario) {
    sessionStorage.removeItem('ultimoPedido');
    window.location.replace('login.html');
    return;
  }

  const bruto = sessionStorage.getItem('ultimoPedido');
  if (!bruto) {
    document.getElementById('estado-sem-pedido').hidden = false;
    return;
  }

  let pedido;
  try {
    pedido = JSON.parse(bruto);
    if (!pedido || !Array.isArray(pedido.itens)) throw new Error('Pedido inválido');
  } catch (falha) {
    sessionStorage.removeItem('ultimoPedido');
    document.getElementById('estado-sem-pedido').hidden = false;
    return;
  }

  document.getElementById('nota-numero').textContent = pedido.numero;
  document.getElementById('nota-data').textContent = new Date(pedido.dataHora).toLocaleString('pt-BR');

  const itensHtml = pedido.itens
    .map((item) => `
      <div class="nota-fiscal-item">
        <span>${item.quantidade}x ${item.nome_produto}</span>
        <span>${formatarPreco(item.preco_unitario * item.quantidade)}</span>
      </div>
    `)
    .join('');
  document.getElementById('nota-itens').innerHTML = itensHtml;

  document.getElementById('nota-subtotal').textContent = formatarPreco(pedido.subtotal);
  document.getElementById('nota-entrega').textContent = pedido.entrega == 0 ? 'Grátis' : formatarPreco(pedido.entrega);
  document.getElementById('nota-total').textContent = formatarPreco(pedido.total);

  const rotuloPagamento = rotulosPagamento[pedido.forma_pagamento] || pedido.forma_pagamento;
  document.getElementById('nota-pagamento').textContent = pedido.cartao_final
    ? `${rotuloPagamento} final ${pedido.cartao_final}`
    : rotuloPagamento;

  document.getElementById('nota-fiscal').hidden = false;
  document.getElementById('acoes-nota').hidden = false;
}

document.getElementById('botao-imprimir').addEventListener('click', () => {
  window.print();
});

carregarNotaFiscal();
