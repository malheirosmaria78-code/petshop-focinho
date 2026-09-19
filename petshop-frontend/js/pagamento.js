const CUSTO_ENTREGA_PAG = 15.9;
const FRETE_GRATIS_ACIMA_DE_PAG = 150;

const carrinhoAtual = obterCarrinho();

if (carrinhoAtual.length === 0) {
  window.location.href = 'carrinho.html';
}

carregarSessao().then((usuario) => {
  if (!usuario) {
    sessionStorage.setItem('redirecionarApos', 'pagamento.html');
    window.location.href = 'login.html';
  }
});

function renderizarResumoPagamento() {
  const container = document.getElementById('resumo-itens-pagamento');
  container.innerHTML = carrinhoAtual
    .map((item) => `
      <div class="resumo-linha">
        <span>${item.quantidade}x ${item.nome}</span>
        <span>${formatarPreco(item.preco * item.quantidade)}</span>
      </div>
    `)
    .join('');

  const subtotal = calcularTotalCarrinho(carrinhoAtual);
  const entrega = subtotal >= FRETE_GRATIS_ACIMA_DE_PAG ? 0 : CUSTO_ENTREGA_PAG;

  document.getElementById('pagamento-subtotal').textContent = formatarPreco(subtotal);
  document.getElementById('pagamento-entrega').textContent = entrega === 0 ? 'Grátis' : formatarPreco(entrega);
  document.getElementById('pagamento-total').textContent = formatarPreco(subtotal + entrega);
}

renderizarResumoPagamento();

document.querySelectorAll('input[name="metodo"]').forEach((radio) => {
  radio.addEventListener('change', (evento) => {
    const ehCartao = evento.target.value !== 'pix';
    document.getElementById('area-cartao').hidden = !ehCartao;
    document.getElementById('area-pix').hidden = ehCartao;
  });
});

document.getElementById('numero_cartao').addEventListener('input', (evento) => {
  const numeros = evento.target.value.replace(/\D/g, '').slice(0, 16);
  const grupos = numeros.match(/.{1,4}/g) || [];
  evento.target.value = grupos.join(' ');
  document.getElementById('preview-numero').textContent = numeros.length
    ? grupos.join(' ').padEnd(19, '•')
    : '•••• •••• •••• ••••';
});

document.getElementById('nome_cartao').addEventListener('input', (evento) => {
  document.getElementById('preview-nome').textContent = evento.target.value.toUpperCase() || 'NOME NO CARTÃO';
});

document.getElementById('validade_cartao').addEventListener('input', (evento) => {
  let numeros = evento.target.value.replace(/\D/g, '').slice(0, 4);
  if (numeros.length > 2) {
    numeros = `${numeros.slice(0, 2)}/${numeros.slice(2)}`;
  }
  evento.target.value = numeros;
  document.getElementById('preview-validade').textContent = numeros || '••/••';
});

document.getElementById('cvv_cartao').addEventListener('input', (evento) => {
  evento.target.value = evento.target.value.replace(/\D/g, '').slice(0, 4);
});

function gerarNumeroPedido() {
  return `CF${Date.now().toString().slice(-8)}`;
}

document.getElementById('botao-confirmar-pagamento').addEventListener('click', async () => {
  const erroGeral = document.getElementById('erro-geral');
  erroGeral.classList.remove('mostrar');

  const metodo = document.querySelector('input[name="metodo"]:checked').value;
  let numeroCartao = null;

  if (metodo !== 'pix') {
    numeroCartao = document.getElementById('numero_cartao').value.replace(/\s/g, '');
    const nomeCartao = document.getElementById('nome_cartao').value.trim();
    const validade = document.getElementById('validade_cartao').value;
    const cvv = document.getElementById('cvv_cartao').value;

    let valido = true;
    valido = marcarCampoPagamento('grupo-nome-cartao', nomeCartao.length > 2) && valido;
    valido = marcarCampoPagamento('grupo-numero-cartao', numeroCartao.length >= 13) && valido;
    valido = marcarCampoPagamento('grupo-validade', /^\d{2}\/\d{2}$/.test(validade)) && valido;
    valido = marcarCampoPagamento('grupo-cvv', cvv.length >= 3) && valido;

    if (!valido) {
      erroGeral.textContent = 'Revise os dados do cartão antes de confirmar.';
      erroGeral.classList.add('mostrar');
      return;
    }
  }

  const botao = document.getElementById('botao-confirmar-pagamento');
  botao.disabled = true;
  botao.textContent = 'Processando...';

  try {
    const resposta = await fetch(`${API_BASE}/criar_pedido.php`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        itens: carrinhoAtual.map((item) => ({ id: item.id, quantidade: item.quantidade })),
        forma_pagamento: metodo,
        cartao_final: numeroCartao,
      }),
    });
    const dados = await resposta.json();

    if (!resposta.ok || !dados.sucesso) {
      erroGeral.textContent = dados.mensagem || 'Não foi possível concluir o pagamento.';
      erroGeral.classList.add('mostrar');
      return;
    }

    sessionStorage.setItem('ultimoPedido', JSON.stringify({
      ...dados.pedido,
      dataHora: new Date().toISOString(),
    }));
    salvarCarrinho([]);
    window.location.href = 'nota-fiscal.html';
  } catch (falha) {
    window.location.href = `erro.html?mensagem=${encodeURIComponent('Não foi possível conectar ao servidor para concluir o pagamento.')}`;
  } finally {
    botao.disabled = false;
    botao.textContent = 'Confirmar pagamento';
  }
});

function marcarCampoPagamento(idGrupo, valido) {
  const grupo = document.getElementById(idGrupo);
  grupo.classList.toggle('invalido', !valido);
  grupo.classList.toggle('valido', valido);
  return valido;
}
