function validarCpf(cpf) {
  const numeros = cpf.replace(/\D/g, '');
  if (numeros.length !== 11 || /^(\d)\1{10}$/.test(numeros)) return false;

  for (let t = 9; t < 11; t++) {
    let soma = 0;
    for (let i = 0; i < t; i++) {
      soma += parseInt(numeros[i], 10) * ((t + 1) - i);
    }
    const digito = ((10 * soma) % 11) % 10;
    if (digito !== parseInt(numeros[t], 10)) return false;
  }
  return true;
}

function validarNome(valor) {
  const texto = valor.trim();
  return texto.length >= 15 && texto.length <= 80 && /^[A-Za-zÀ-ÿ\s]+$/.test(texto);
}

function validarTelefoneFormato(valor) {
  return /^\(\+55\)\d{2}-\d{8,9}$/.test(valor);
}

function validarLoginFormato(valor) {
  return /^[A-Za-z]{6}$/.test(valor);
}

function validarSenhaFormato(valor) {
  return /^[A-Za-z]{8}$/.test(valor);
}

function marcarCampo(idGrupo, valido) {
  const grupo = document.getElementById(idGrupo);
  grupo.classList.remove('valido', 'invalido');
  grupo.classList.add(valido ? 'valido' : 'invalido');
  return valido;
}

function mascararTelefone(campo) {
  campo.addEventListener('input', () => {
    let numeros = campo.value.replace(/\D/g, '').replace(/^55/, '');
    if (numeros.length > 11) numeros = numeros.slice(0, 11);
    if (numeros.length <= 2) {
      campo.value = numeros.length ? `(+55)${numeros}` : '';
      return;
    }
    const ddd = numeros.slice(0, 2);
    const resto = numeros.slice(2);
    campo.value = `(+55)${ddd}-${resto}`;
  });
}

function mascararCep(campo) {
  campo.addEventListener('input', () => {
    let numeros = campo.value.replace(/\D/g, '').slice(0, 8);
    if (numeros.length > 5) {
      campo.value = `${numeros.slice(0, 5)}-${numeros.slice(5)}`;
    } else {
      campo.value = numeros;
    }
  });
}

function mascararCpf(campo) {
  campo.addEventListener('input', () => {
    let numeros = campo.value.replace(/\D/g, '').slice(0, 11);
    let formatado = numeros;
    if (numeros.length > 9) {
      formatado = `${numeros.slice(0, 3)}.${numeros.slice(3, 6)}.${numeros.slice(6, 9)}-${numeros.slice(9)}`;
    } else if (numeros.length > 6) {
      formatado = `${numeros.slice(0, 3)}.${numeros.slice(3, 6)}.${numeros.slice(6)}`;
    } else if (numeros.length > 3) {
      formatado = `${numeros.slice(0, 3)}.${numeros.slice(3)}`;
    }
    campo.value = formatado;
  });
}

async function autoCompletarEndereco(cep) {
  const numeros = cep.replace(/\D/g, '');
  const status = document.getElementById('cep-status');
  if (numeros.length !== 8) return;

  status.textContent = 'Buscando endereço...';
  try {
    const resposta = await fetch(`https://viacep.com.br/ws/${numeros}/json/`);
    const dados = await resposta.json();
    if (dados.erro) {
      status.textContent = 'CEP não encontrado — preencha o endereço manualmente.';
      return;
    }
    document.getElementById('logradouro').value = dados.logradouro || '';
    document.getElementById('bairro').value = dados.bairro || '';
    document.getElementById('cidade').value = dados.localidade || '';
    document.getElementById('uf').value = dados.uf || '';
    status.textContent = 'Endereço preenchido automaticamente.';
  } catch (falha) {
    status.textContent = 'Não foi possível consultar o CEP — preencha manualmente.';
  }
}

mascararTelefone(document.getElementById('telefone_celular'));
mascararTelefone(document.getElementById('telefone_fixo'));
mascararCep(document.getElementById('cep'));
mascararCpf(document.getElementById('cpf'));

document.getElementById('cep').addEventListener('blur', (evento) => {
  autoCompletarEndereco(evento.target.value);
});

document.getElementById('login').addEventListener('input', (evento) => {
  evento.target.value = evento.target.value.replace(/[^A-Za-z]/g, '').slice(0, 6);
});

document.getElementById('senha').addEventListener('input', (evento) => {
  evento.target.value = evento.target.value.replace(/[^A-Za-z]/g, '').slice(0, 8);
});

document.getElementById('confirmacao_senha').addEventListener('input', (evento) => {
  evento.target.value = evento.target.value.replace(/[^A-Za-z]/g, '').slice(0, 8);
});

function validarFormulario() {
  const valores = {
    nome_completo: document.getElementById('nome_completo').value,
    data_nascimento: document.getElementById('data_nascimento').value,
    sexo: document.getElementById('sexo').value,
    nome_materno: document.getElementById('nome_materno').value.trim(),
    cpf: document.getElementById('cpf').value,
    email: document.getElementById('email').value,
    telefone_celular: document.getElementById('telefone_celular').value,
    telefone_fixo: document.getElementById('telefone_fixo').value,
    cep: document.getElementById('cep').value,
    numero: document.getElementById('numero').value.trim(),
    logradouro: document.getElementById('logradouro').value.trim(),
    complemento: document.getElementById('complemento').value.trim(),
    bairro: document.getElementById('bairro').value.trim(),
    cidade: document.getElementById('cidade').value.trim(),
    uf: document.getElementById('uf').value.trim().toUpperCase(),
    login: document.getElementById('login').value,
    senha: document.getElementById('senha').value,
    confirmacao_senha: document.getElementById('confirmacao_senha').value,
  };

  let valido = true;
  valido = marcarCampo('grupo-nome', validarNome(valores.nome_completo)) && valido;

  const dataValida = valores.data_nascimento && new Date(valores.data_nascimento) < new Date();
  valido = marcarCampo('grupo-nascimento', Boolean(dataValida)) && valido;

  valido = marcarCampo('grupo-sexo', Boolean(valores.sexo)) && valido;
  valido = marcarCampo('grupo-mae', valores.nome_materno.length > 0) && valido;
  valido = marcarCampo('grupo-cpf', validarCpf(valores.cpf)) && valido;
  valido = marcarCampo('grupo-email', /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valores.email)) && valido;
  valido = marcarCampo('grupo-celular', validarTelefoneFormato(valores.telefone_celular)) && valido;

  if (valores.telefone_fixo) {
    valido = marcarCampo('grupo-fixo', validarTelefoneFormato(valores.telefone_fixo)) && valido;
  } else {
    document.getElementById('grupo-fixo').classList.remove('invalido', 'valido');
  }

  valido = marcarCampo('grupo-cep', valores.cep.replace(/\D/g, '').length === 8) && valido;
  valido = marcarCampo('grupo-numero', valores.numero.length > 0) && valido;
  valido = marcarCampo('grupo-logradouro', valores.logradouro.length > 0) && valido;
  valido = marcarCampo('grupo-bairro', valores.bairro.length > 0) && valido;
  valido = marcarCampo('grupo-cidade', valores.cidade.length > 0) && valido;
  valido = marcarCampo('grupo-uf', /^[A-Z]{2}$/.test(valores.uf)) && valido;
  valido = marcarCampo('grupo-login', validarLoginFormato(valores.login)) && valido;
  valido = marcarCampo('grupo-senha', validarSenhaFormato(valores.senha)) && valido;
  valido = marcarCampo('grupo-confirmacao', valores.senha === valores.confirmacao_senha && valores.confirmacao_senha.length > 0) && valido;

  return { valido, valores };
}

document.getElementById('form-cadastro').addEventListener('submit', async (evento) => {
  evento.preventDefault();
  const erroGeral = document.getElementById('erro-geral');
  erroGeral.classList.remove('mostrar');

  const { valido, valores } = validarFormulario();
  if (!valido) {
    erroGeral.textContent = 'Revise os campos destacados antes de enviar.';
    erroGeral.classList.add('mostrar');
    return;
  }

  const botao = document.getElementById('botao-enviar');
  botao.disabled = true;
  botao.textContent = 'Enviando...';

  try {
    const resposta = await fetch(`${API_BASE}/cadastro.php`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(valores),
    });
    const dados = await resposta.json();

    if (!resposta.ok || !dados.sucesso) {
      erroGeral.textContent = dados.mensagem || 'Não foi possível concluir o cadastro.';
      erroGeral.classList.add('mostrar');
      return;
    }

    window.location.href = 'login.html?cadastrado=1';
  } catch (falha) {
    erroGeral.textContent = 'Falha de conexão com o servidor. Tente novamente.';
    erroGeral.classList.add('mostrar');
  } finally {
    botao.disabled = false;
    botao.textContent = 'Enviar cadastro';
  }
});
