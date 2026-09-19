const parametros = new URLSearchParams(window.location.search);
if (parametros.get('cadastrado') === '1') {
  mostrarAviso('Cadastro concluído — faça login para continuar');
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
      erroGeral.textContent = dados.mensagem || 'Login ou senha inválidos.';
      erroGeral.classList.add('mostrar');
      return;
    }

    sessionStorage.setItem('pergunta2fa', dados.pergunta_2fa);
    sessionStorage.setItem('pergunta2faTexto', dados.pergunta_2fa_texto);
    window.location.href = 'dupla-fator.html';
  } catch (falha) {
    erroGeral.textContent = 'Falha de conexão com o servidor. Tente novamente.';
    erroGeral.classList.add('mostrar');
  } finally {
    botao.disabled = false;
    botao.textContent = 'Entrar';
  }
});
