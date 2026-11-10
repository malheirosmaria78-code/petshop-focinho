exigirPerfilNaPagina('master');

let acaoPendente = null;

const TEXTOS_ACAO = {
  desativar: {
    titulo: 'Desativar conta',
    texto: (nome) => `Desativar a conta de ${nome}? A pessoa não conseguirá mais entrar, mas pedidos e histórico continuam guardados. Você pode reativar quando quiser.`,
    botao: 'Desativar',
    classe: 'botao-excluir',
  },
  reativar: {
    titulo: 'Reativar conta',
    texto: (nome) => `Reativar a conta de ${nome}? A pessoa poderá entrar no site normalmente.`,
    botao: 'Reativar',
    classe: 'botao-primario',
  },

};

function abrirModal(tipo, id, nome) {
  const textos = TEXTOS_ACAO[tipo];
  acaoPendente = { tipo, id };
  document.getElementById('modal-titulo').textContent = textos.titulo;
  document.getElementById('modal-texto').textContent = textos.texto(nome);
  const confirmar = document.getElementById('modal-confirmar');
  confirmar.textContent = textos.botao;
  confirmar.className = textos.classe;
  document.getElementById('modal-exclusao').classList.add('aberto');
}

function fecharModal() {
  acaoPendente = null;
  document.getElementById('modal-exclusao').classList.remove('aberto');
}

function renderizarTabela(usuarios) {
  const corpo = document.getElementById('corpo-tabela');
  const vazio = document.getElementById('tabela-vazia');
  corpo.innerHTML = '';

  if (usuarios.length === 0) {
    vazio.hidden = false;
    return;
  }
  vazio.hidden = true;

  usuarios.forEach((usuario) => {
    const ativo = Number(usuario.ativo) === 1;
    const nome = escaparHtml(usuario.nome_completo);
    const rotuloStatus = ativo
      ? '<span class="badge badge-sucesso">Ativa</span>'
      : '<span class="badge badge-falha">Desativada</span>';
    const botaoStatus = ativo
      ? `<button type="button" class="botao-tabela" data-acao="desativar" data-id="${usuario.id}" data-nome="${nome}">Desativar</button>`
      : `<button type="button" class="botao-tabela" data-acao="reativar" data-id="${usuario.id}" data-nome="${nome}">Reativar</button>`;


    const linha = document.createElement('tr');
    linha.innerHTML = `
      <td data-label="Nome">${nome}</td>
      <td data-label="CPF">${escaparHtml(usuario.cpf)}</td>
      <td data-label="E-mail">${escaparHtml(usuario.email)}</td>
      <td data-label="Login">${escaparHtml(usuario.login)}</td>
      <td data-label="Cadastrado em">${formatarDataHora(usuario.criado_em)}</td>
      <td data-label="Status">${rotuloStatus}</td>
      <td class="celula-acoes">${botaoStatus}</td>
    `;
    corpo.appendChild(linha);
  });

  corpo.querySelectorAll('[data-acao]').forEach((botao) => {
    botao.addEventListener('click', () => abrirModal(botao.dataset.acao, botao.dataset.id, botao.dataset.nome));
  });
}

async function buscarUsuarios() {
  const termo = document.getElementById('busca-usuario').value.trim();
  const status = document.getElementById('filtro-status').value;
  try {
    const url = new URL(`${API_BASE}/usuarios.php`);
    if (termo) url.searchParams.set('busca', termo);
    url.searchParams.set('status', status);
    const resposta = await fetch(url, { credentials: 'include' });
    const dados = await resposta.json();
    if (dados.sucesso) {
      renderizarTabela(dados.usuarios);
    } else if (resposta.status !== 401 && resposta.status !== 403) {
      mostrarAviso(dados.mensagem || 'Não foi possível carregar os usuários');
    }
  } catch (falha) {
    mostrarAviso('Não foi possível carregar os usuários');
  }
}

document.getElementById('busca-usuario').addEventListener('input', buscarUsuarios);
document.getElementById('filtro-status').addEventListener('change', buscarUsuarios);
document.getElementById('modal-cancelar').addEventListener('click', fecharModal);

document.getElementById('modal-confirmar').addEventListener('click', async () => {
  if (!acaoPendente) return;
  const { tipo, id } = acaoPendente;
  const endpoint = 'alterar_status_usuario.php';
  const corpo = { id, ativo: tipo === 'reativar' };

  try {
    const resposta = await fetch(`${API_BASE}/${endpoint}`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(corpo),
    });
    const dados = await resposta.json();
    mostrarAviso(dados.mensagem || (dados.sucesso ? 'Feito' : 'Não foi possível concluir a ação'));
    if (dados.sucesso) buscarUsuarios();
  } catch (falha) {
    mostrarAviso('Falha de conexão com o servidor');
  } finally {
    fecharModal();
  }
});

document.getElementById('botao-baixar-pdf').addEventListener('click', () => {
  window.open(`${API_BASE}/exportar_usuarios_pdf.php`, '_blank');
});

buscarUsuarios();
