exigirPerfilNaPagina('master');

const rotulosPergunta = {
  nome_mae: 'Nome da mãe',
  data_nascimento: 'Data de nascimento',
  cep: 'CEP',
};

function renderizarLog(registros) {
  const corpo = document.getElementById('corpo-tabela-log');
  const vazio = document.getElementById('log-vazio');
  corpo.innerHTML = '';

  if (registros.length === 0) {
    vazio.hidden = false;
    return;
  }
  vazio.hidden = true;

  registros.forEach((registro) => {
    const linha = document.createElement('tr');
    const badge = registro.sucesso == 1
      ? '<span class="badge badge-sucesso">Sucesso</span>'
      : '<span class="badge badge-falha">Falha</span>';
    linha.innerHTML = `
      <td>${formatarDataHora(registro.data_hora)}</td>
      <td>${registro.nome}</td>
      <td>${registro.cpf}</td>
      <td>${rotulosPergunta[registro.pergunta_2fa] || registro.pergunta_2fa}</td>
      <td>${badge}</td>
    `;
    corpo.appendChild(linha);
  });
}

async function buscarLog() {
  const tipo = document.getElementById('filtro-tipo').value;
  const busca = document.getElementById('filtro-busca').value.trim();

  try {
    const url = new URL(`${API_BASE}/log.php`);
    url.searchParams.set('tipo', tipo);
    if (busca) url.searchParams.set('busca', busca);
    const resposta = await fetch(url, { credentials: 'include' });
    const dados = await resposta.json();
    if (dados.sucesso) {
      renderizarLog(dados.registros);
    }
  } catch (falha) {
    mostrarAviso('Não foi possível carregar o log');
  }
}

document.getElementById('filtro-tipo').addEventListener('change', (evento) => {
  const busca = document.getElementById('filtro-busca');
  busca.disabled = evento.target.value === 'todos';
  if (busca.disabled) busca.value = '';
  buscarLog();
});

document.getElementById('filtro-busca').addEventListener('input', () => {
  buscarLog();
});

buscarLog();
