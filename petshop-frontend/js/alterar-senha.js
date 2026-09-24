exigirPerfilNaPagina('comum');

function validarSenhaFormato(valor) {
  return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{8}$/.test(valor);
}

['senha_atual', 'nova_senha', 'confirmacao_nova_senha'].forEach((id) => {
  document.getElementById(id).addEventListener('input', (evento) => {
    evento.target.value = evento.target.value.replace(/[^A-Za-z\d]/g, '').slice(0, 8);
  });
});

document.getElementById('form-senha').addEventListener('submit', async (evento) => {
  evento.preventDefault();
  const erroGeral = document.getElementById('erro-geral');
  erroGeral.classList.remove('mostrar');

  const senhaAtual = document.getElementById('senha_atual').value;
  const novaSenha = document.getElementById('nova_senha').value;
  const confirmacao = document.getElementById('confirmacao_nova_senha').value;

  let valido = true;
  valido = marcarValidacao('grupo-atual', senhaAtual.length > 0) && valido;
  valido = marcarValidacao('grupo-nova', validarSenhaFormato(novaSenha)) && valido;
  valido = marcarValidacao('grupo-confirmacao', novaSenha === confirmacao && confirmacao.length > 0) && valido;

  if (!valido) {
    erroGeral.textContent = 'Revise os campos destacados.';
    erroGeral.classList.add('mostrar');
    return;
  }

  const botao = document.getElementById('botao-salvar');
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

function marcarValidacao(idGrupo, valido) {
  const grupo = document.getElementById(idGrupo);
  grupo.classList.toggle('invalido', !valido);
  grupo.classList.toggle('valido', valido);
  return valido;
}
