const parametros = new URLSearchParams(window.location.search);
if (parametros.get('cadastrado') === '1') {
  mostrarAviso('Cadastro concluído — faça login para continuar');
}
const avisoSessao = sessionStorage.getItem('avisoSessao');
if (avisoSessao) {
  sessionStorage.removeItem('avisoSessao');
  mostrarAviso(avisoSessao);
}
if (parametros.get('bloqueado') === '1') {
  mostrarAviso('3 tentativas sem sucesso! Favor realizar Login novamente.');
}

document.getElementById('form-login').addEventListener('submit', async (evento) => {
  evento.preventDefault();
  const erroGeral = document.getElementById('erro-geral');
  erroGeral.classList.remove('mostrar');

  const login = document.getElementById('login').value.trim();
  const senha = document.getElementById('senha').value;

  const grupoLogin = document.getElementById('grupo-login');
  const grupoSenha = document.getElementById('grupo-senha');
  grupoLogin.classList.toggle('invalido', login.length === 0);
  grupoSenha.classList.toggle('invalido', senha.length === 0);

  if (!login || !senha) return;

  const botao = document.getElementById('botao-entrar');
  botao.disabled = true;
  botao.textContent = 'Verificando...';

  try {
    const resposta = await fetch(`${API_BASE}/login.php`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ login, senha }),
    });
    const dados = await resposta.json();

    if (!resposta.ok || !dados.sucesso) {
      window.location.href = `erro.html?origem=login&mensagem=${encodeURIComponent(dados.mensagem || 'Login ou senha inválidos.')}`;
      return;
    }

    sessionStorage.removeItem('ultimoPedido');
    sessionStorage.setItem('pergunta2fa', dados.pergunta_2fa);
    sessionStorage.setItem('pergunta2faTexto', dados.pergunta_2fa_texto);
    window.location.href = 'dupla-fator.html';
  } catch (falha) {
    window.location.href = `erro.html?origem=login&mensagem=${encodeURIComponent('Falha de conexão com o servidor. Tente novamente.')}`;
  } finally {
    botao.disabled = false;
    botao.textContent = 'Entrar';
  }
});

document.getElementById('form-login').addEventListener('reset', () => {
  document.querySelectorAll('.campo-grupo').forEach((grupo) => grupo.classList.remove('valido', 'invalido'));
  document.getElementById('erro-geral').classList.remove('mostrar');
});
