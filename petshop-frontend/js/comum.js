const API_BASE = 'http://localhost:8000/api';

const CHAVE_CARRINHO = 'carrinho';

function obterCarrinho() {
  try {
    const dados = JSON.parse(localStorage.getItem(CHAVE_CARRINHO));
    return Array.isArray(dados) ? dados : [];
  } catch (falha) {
    return [];
  }
}

function salvarCarrinho(carrinho) {
  localStorage.setItem(CHAVE_CARRINHO, JSON.stringify(carrinho));
  atualizarBadgeCarrinho();
}

function adicionarAoCarrinho(produto, quantidade) {
  const carrinho = obterCarrinho();
  const existente = carrinho.find((item) => item.id === produto.id);
  if (existente) {
    existente.quantidade += quantidade;
  } else {
    carrinho.push({
      id: produto.id,
      nome: produto.nome,
      preco: Number(produto.preco),
      imagem: produto.imagem,
      quantidade,
    });
  }
  salvarCarrinho(carrinho);
}

function removerDoCarrinho(id) {
  const carrinho = obterCarrinho().filter((item) => item.id !== id);
  salvarCarrinho(carrinho);
}

function atualizarQuantidadeCarrinho(id, quantidade) {
  const carrinho = obterCarrinho();
  const item = carrinho.find((produto) => produto.id === id);
  if (!item) return;
  item.quantidade = Math.max(1, quantidade);
  salvarCarrinho(carrinho);
}

function calcularTotalCarrinho(carrinho) {
  return carrinho.reduce((total, item) => total + item.preco * item.quantidade, 0);
}

function contarItensCarrinho() {
  return obterCarrinho().reduce((total, item) => total + item.quantidade, 0);
}

function atualizarBadgeCarrinho() {
  const badge = document.getElementById('carrinho-contagem');
  if (!badge) return;
  const total = contarItensCarrinho();
  badge.textContent = total;
  badge.hidden = total === 0;
}

function inicializarIconeCarrinho() {
  const acoes = document.querySelector('.cabecalho-acoes');
  const contaExistente = document.getElementById('area-conta');
  if (!acoes || document.getElementById('link-carrinho')) return;

  const link = document.createElement('a');
  link.href = 'carrinho.html';
  link.id = 'link-carrinho';
  link.className = 'link-carrinho';
  link.setAttribute('aria-label', 'Ver carrinho');
  link.innerHTML = `
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M6 6h15l-1.5 9h-12L6 6zM6 6L5 3H2" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/><circle cx="9.5" cy="19" r="1.4" fill="currentColor"/><circle cx="17" cy="19" r="1.4" fill="currentColor"/></svg>
    <span class="carrinho-badge" id="carrinho-contagem" hidden>0</span>
  `;
  acoes.insertBefore(link, contaExistente);
  atualizarBadgeCarrinho();
}

function mostrarAviso(texto) {
  const aviso = document.getElementById('aviso');
  aviso.textContent = texto;
  aviso.classList.add('mostrar');
  window.clearTimeout(mostrarAviso.temporizador);
  mostrarAviso.temporizador = window.setTimeout(() => {
    aviso.classList.remove('mostrar');
  }, 2800);
}

function formatarPreco(valor) {
  return Number(valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function formatarDataHora(valor) {
  const data = new Date(valor.replace(' ', 'T'));
  return data.toLocaleString('pt-BR');
}

function renderizarAreaConta(usuario) {
  const area = document.getElementById('area-conta');
  const menu = document.getElementById('menu');
  if (!area || !menu) return;

  if (!usuario) {
    area.innerHTML = `
      <a class="conta-link" href="login.html">Entrar</a>
      <a class="conta-link" href="cadastro.html">Cadastrar</a>
    `;
    menu.innerHTML = '<a href="index.html" class="menu-link">Loja</a>';
    return;
  }

  area.innerHTML = `
    <div class="conta-usuario">
      <span class="conta-nome">${usuario.nome_completo.split(' ')[0]}</span>
      <button type="button" class="conta-sair" id="botao-sair">Sair</button>
    </div>
  `;

  const linksMenu = ['<a href="index.html" class="menu-link">Loja</a>'];
  if (usuario.perfil === '') {
    linksMenu.push('<a href="consulta-usuario.html" class="menu-link">Usuários</a>');
    linksMenu.push('<a href="log.html" class="menu-link">Log</a>');
  } else {
    linksMenu.push('<a href="minha-conta.html" class="menu-link">Minha conta</a>');
  }
  linksMenu.push('<a href="modelo-bd.html" class="menu-link">Modelo do BD</a>');
  menu.innerHTML = linksMenu.join('');

  const paginaAtual = document.body.dataset.pagina;
  menu.querySelectorAll('a').forEach((link) => {
    if (link.getAttribute('href') === paginaAtual) {
      link.classList.add('ativo');
    }
  });

  document.getElementById('botao-sair').addEventListener('click', async () => {
    try {
      await fetch(`${API_BASE}/logout.php`, { method: 'POST', credentials: 'include' });
    } catch (falha) {
      /* segue o fluxo mesmo se a chamada falhar */
    }
    window.location.href = 'index.html';
  });
}

async function carregarSessao() {
  try {
    const resposta = await fetch(`${API_BASE}/perfil.php`, { credentials: 'include' });
    if (!resposta.ok) {
      renderizarAreaConta(null);
      return null;
    }
    const dados = await resposta.json();
    renderizarAreaConta(dados.usuario);
    return dados.usuario;
  } catch (falha) {
    renderizarAreaConta(null);
    return null;
  }
}

function exigirPerfilNaPagina(perfilExigido) {
  carregarSessao().then((usuario) => {
    if (!usuario || usuario.perfil !== perfilExigido) {
      window.location.href = 'login.html';
    }
  });
}

function configurarAcessibilidade() {
  const raiz = document.documentElement;
  const contrasteSalvo = localStorage.getItem('contraste');
  const escalaSalva = localStorage.getItem('escalaFonte');

  if (contrasteSalvo === 'alto') {
    raiz.setAttribute('data-contraste', 'alto');
  }
  if (escalaSalva) {
    raiz.style.setProperty('--escala-fonte', escalaSalva);
  }

  const botaoContraste = document.getElementById('alternar-contraste');
  const botaoMaior = document.getElementById('fonte-maior');
  const botaoMenor = document.getElementById('fonte-menor');

  if (botaoContraste) {
    botaoContraste.addEventListener('click', () => {
      const ativo = raiz.getAttribute('data-contraste') === 'alto';
      if (ativo) {
        raiz.removeAttribute('data-contraste');
        localStorage.setItem('contraste', 'normal');
      } else {
        raiz.setAttribute('data-contraste', 'alto');
        localStorage.setItem('contraste', 'alto');
      }
    });
  }

  if (botaoMaior) {
    botaoMaior.addEventListener('click', () => {
      const atual = parseFloat(getComputedStyle(raiz).getPropertyValue('--escala-fonte')) || 1;
      const nova = Math.min(atual + 0.1, 1.4).toFixed(2);
      raiz.style.setProperty('--escala-fonte', nova);
      localStorage.setItem('escalaFonte', nova);
    });
  }

  if (botaoMenor) {
    botaoMenor.addEventListener('click', () => {
      const atual = parseFloat(getComputedStyle(raiz).getPropertyValue('--escala-fonte')) || 1;
      const nova = Math.max(atual - 0.1, 0.85).toFixed(2);
      raiz.style.setProperty('--escala-fonte', nova);
      localStorage.setItem('escalaFonte', nova);
    });
  }
}

configurarAcessibilidade();
inicializarIconeCarrinho();
carregarSessao();
