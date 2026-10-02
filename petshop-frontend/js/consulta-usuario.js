exigirPerfilNaPagina('master');

let idParaExcluir = null;

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
    const linha = document.createElement('tr');
    linha.innerHTML = `
      <td>${usuario.nome_completo}</td>
      <td>${usuario.cpf}</td>
      <td>${usuario.email}</td>
      <td>${usuario.login}</td>
      <td>${formatarDataHora(usuario.criado_em)}</td>
      <td><button type="button" class="botao-excluir" data-id="${usuario.id}" data-nome="${usuario.nome_completo}">Desativar</button></td>
    `;
    corpo.appendChild(linha);
  });

  corpo.querySelectorAll('.botao-excluir').forEach((botao) => {
    botao.addEventListener('click', () => {
      idParaExcluir = botao.dataset.id;
      document.getElementById('modal-texto').textContent =
        `Tem certeza que deseja desativar ${botao.dataset.nome}? Essa pessoa não poderá mais acessar o sistema.`;
      document.getElementById('modal-exclusao').classList.add('aberto');
    });
  });
}

async function buscarUsuarios(termo) {
  try {
    const url = new URL(`${API_BASE}/usuarios.php`);
    if (termo) url.searchParams.set('busca', termo);
    const resposta = await fetch(url, { credentials: 'include' });
    const dados = await resposta.json();
    if (dados.sucesso) {
      renderizarTabela(dados.usuarios);
    }
  } catch (falha) {
    mostrarAviso('Não foi possível carregar os usuários');
  }
}

document.getElementById('busca-usuario').addEventListener('input', (evento) => {
  buscarUsuarios(evento.target.value.trim());
});

document.getElementById('modal-cancelar').addEventListener('click', () => {
  idParaExcluir = null;
  document.getElementById('modal-exclusao').classList.remove('aberto');
});

document.getElementById('modal-confirmar').addEventListener('click', async () => {
  if (!idParaExcluir) return;
  try {
    const resposta = await fetch(`${API_BASE}/excluir_usuario.php`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: idParaExcluir }),
    });
    const dados = await resposta.json();
    if (dados.sucesso) {
      mostrarAviso('Usuário desativado com sucesso');
      buscarUsuarios(document.getElementById('busca-usuario').value.trim());
    } else {
      mostrarAviso(dados.mensagem || 'Não foi possível desativar o usuário');
    }
  } catch (falha) {
    mostrarAviso('Falha de conexão com o servidor');
  } finally {
    idParaExcluir = null;
    document.getElementById('modal-exclusao').classList.remove('aberto');
  }
});

document.getElementById('botao-baixar-pdf').addEventListener('click', () => {
  window.open(`${API_BASE}/exportar_usuarios_pdf.php`, '_blank');
});

buscarUsuarios('');
