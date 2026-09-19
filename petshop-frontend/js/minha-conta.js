exigirPerfilNaPagina('comum');

document.querySelectorAll('.aba-botao').forEach((botao) => {
  botao.addEventListener('click', () => {
    document.querySelectorAll('.aba-botao').forEach((b) => b.classList.remove('ativa'));
    document.querySelectorAll('.aba-painel').forEach((p) => p.classList.remove('ativa'));
    botao.classList.add('ativa');
    document.getElementById(`painel-${botao.dataset.aba}`).classList.add('ativa');
  });
});

const rotulosCampo = {
  nome_completo: 'Nome completo',
  email: 'E-mail',
  cpf: 'CPF',
  telefone_celular: 'Telefone celular',
  telefone_fixo: 'Telefone fixo',
  logradouro: 'Endereço',
  numero: 'Número',
  complemento: 'Complemento',
  bairro: 'Bairro',
  cidade: 'Cidade',
  uf: 'UF',
  cep: 'CEP',
  login: 'Login',
};

async function carregarDadosConta() {
  const carregando = document.getElementById('dados-carregando');
  const grade = document.getElementById('dados-conta-grade');

  try {
    const resposta = await fetch(`${API_BASE}/minha_conta.php`, { credentials: 'include' });
    const dados = await resposta.json();

    if (!resposta.ok || !dados.sucesso) {
      throw new Error('Falha ao carregar dados');
    }

    grade.innerHTML = Object.entries(rotulosCampo)
      .map(([chave, rotulo]) => {
        const valor = dados.usuario[chave];
        if (!valor) return '';
        return `
          <div class="dados-conta-item">
            <span class="rotulo">${rotulo}</span>
            <span class="valor">${valor}</span>
          </div>
        `;
      })
      .join('');

    grade.hidden = false;
  } catch (falha) {
    carregando.textContent = 'Não foi possível carregar seus dados agora.';
    return;
  }
  carregando.hidden = true;
}

function validarSenhaFormato(valor) {
  return /^[A-Za-z]{8}$/.test(valor);
}

['senha_atual', 'nova_senha', 'confirmacao_nova_senha'].forEach((id) => {
  document.getElementById(id).addEventListener('input', (evento) => {
    evento.target.value = evento.target.value.replace(/[^A-Za-z]/g, '').slice(0, 8);
  });
});

function marcarValidacaoSenha(idGrupo, valido) {
  const grupo = document.getElementById(idGrupo);
  grupo.classList.toggle('invalido', !valido);
  grupo.classList.toggle('valido', valido);
  return valido;
}

document.getElementById('form-senha').addEventListener('submit', async (evento) => {
  evento.preventDefault();
  const erroGeral = document.getElementById('erro-geral-senha');
  erroGeral.classList.remove('mostrar');

  const senhaAtual = document.getElementById('senha_atual').value;
  const novaSenha = document.getElementById('nova_senha').value;
  const confirmacao = document.getElementById('confirmacao_nova_senha').value;

  let valido = true;
  valido = marcarValidacaoSenha('grupo-atual', senhaAtual.length > 0) && valido;
  valido = marcarValidacaoSenha('grupo-nova', validarSenhaFormato(novaSenha)) && valido;
  valido = marcarValidacaoSenha('grupo-confirmacao', novaSenha === confirmacao && confirmacao.length > 0) && valido;

  if (!valido) {
    erroGeral.textContent = 'Revise os campos destacados.';
    erroGeral.classList.add('mostrar');
    return;
  }

  const botao = document.getElementById('botao-salvar-senha');
  botao.disabled = true;
  botao.textContent = 'Salvando...';

  try {
    const resposta = await fetch(`${API_BASE}/alterar_senha.php`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        senha_atual: senhaAtual,
        nova_senha: novaSenha,
        confirmacao_nova_senha: confirmacao,
      }),
    });
    const dados = await resposta.json();

    if (!resposta.ok || !dados.sucesso) {
      erroGeral.textContent = dados.mensagem || 'Não foi possível alterar a senha.';
      erroGeral.classList.add('mostrar');
      return;
    }

    mostrarAviso('Senha alterada com sucesso');
    document.getElementById('form-senha').reset();
  } catch (falha) {
    erroGeral.textContent = 'Falha de conexão com o servidor. Tente novamente.';
    erroGeral.classList.add('mostrar');
  } finally {
    botao.disabled = false;
    botao.textContent = 'Salvar nova senha';
  }
});

const rotulosPagamentoConta = {
  credito: 'Cartão de crédito',
  debito: 'Cartão de débito',
  pix: 'Pix',
};

async function carregarPedidos() {
  const carregando = document.getElementById('pedidos-carregando');
  const vazio = document.getElementById('pedidos-vazio');
  const lista = document.getElementById('lista-pedidos');

  try {
    const resposta = await fetch(`${API_BASE}/meus_pedidos.php`, { credentials: 'include' });
    const dados = await resposta.json();

    if (!resposta.ok || !dados.sucesso) {
      throw new Error('Falha ao carregar pedidos');
    }

    if (dados.pedidos.length === 0) {
      vazio.hidden = false;
      return;
    }

    lista.innerHTML = dados.pedidos
      .map((pedido) => `
        <div class="pedido-card">
          <div class="pedido-card-cabecalho">
            <span class="pedido-card-numero">${pedido.numero_pedido}</span>
            <span class="pedido-card-data">${formatarDataHora(pedido.criado_em)}</span>
          </div>
          ${pedido.itens
            .map((item) => `
              <div class="pedido-card-item">
                <span>${item.quantidade}x ${item.nome_produto}</span>
                <span>${formatarPreco(item.preco_unitario * item.quantidade)}</span>
              </div>
            `)
            .join('')}
          <div class="pedido-card-total">
            <span>Total (${rotulosPagamentoConta[pedido.forma_pagamento] || pedido.forma_pagamento})</span>
            <span>${formatarPreco(pedido.total)}</span>
          </div>
        </div>
      `)
      .join('');
  } catch (falha) {
    carregando.textContent = 'Não foi possível carregar seus pedidos agora.';
    return;
  }
  carregando.hidden = true;
}

carregarDadosConta();
carregarPedidos();
