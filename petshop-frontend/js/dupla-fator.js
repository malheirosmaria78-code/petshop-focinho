const perguntaTexto = sessionStorage.getItem('pergunta2faTexto');

if (!perguntaTexto) {
  window.location.href = 'login.html';
}

document.getElementById('texto-pergunta').textContent = perguntaTexto;

let tentativasUsadas = 0;

function atualizarPontosTentativas() {
  const pontos = document.querySelectorAll('#tentativas span');
  pontos.forEach((ponto, indice) => {
    ponto.classList.toggle('usada', indice < tentativasUsadas);
  });
}

document.getElementById('form-2fa').addEventListener('submit', async (evento) => {
  evento.preventDefault();
  const erroGeral = document.getElementById('erro-geral');
  erroGeral.classList.remove('mostrar');

  const resposta = document.getElementById('resposta').value.trim();
  const grupoResposta = document.getElementById('grupo-resposta');
  grupoResposta.classList.toggle('invalido', resposta.length === 0);
  if (!resposta) return;

  const botao = document.getElementById('botao-confirmar');
  botao.disabled = true;
  botao.textContent = 'Verificando...';

  try {
    const chamada = await fetch(`${API_BASE}/verificar_2fa.php`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ resposta }),
    });
    const dados = await chamada.json();

    if (dados.sucesso) {
      sessionStorage.removeItem('pergunta2fa');
      sessionStorage.removeItem('pergunta2faTexto');
      const destino = sessionStorage.getItem('redirecionarApos') || 'index.html';
      sessionStorage.removeItem('redirecionarApos');
      window.location.href = destino;
      return;
    }

    if (dados.bloqueado) {
      sessionStorage.removeItem('pergunta2fa');
      sessionStorage.removeItem('pergunta2faTexto');
      window.location.href = 'login.html?bloqueado=1';
      return;
    }

    tentativasUsadas += 1;
    atualizarPontosTentativas();
    erroGeral.textContent = `Resposta incorreta — ${dados.tentativas_restantes} tentativa(s) restante(s).`;
    erroGeral.classList.add('mostrar');
    document.getElementById('resposta').value = '';
  } catch (falha) {
    erroGeral.textContent = 'Falha de conexão com o servidor. Tente novamente.';
    erroGeral.classList.add('mostrar');
  } finally {
    botao.disabled = false;
    botao.textContent = 'Confirmar';
  }
});
