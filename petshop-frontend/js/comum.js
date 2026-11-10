// Mesmo servidor e caminho do projeto no Linux, XAMPP ou acesso pela rede.
const API_BASE = new URL('../../petshop-backend/api', document.currentScript.src).href;

const CHAVE_CARRINHO = 'carrinho';
const CHAVE_CACHE_PRODUTOS = 'cacheProdutos';
const CHAVE_ASSINATURA_CACHE = 'cacheProdutosAssinatura';
const TEMPO_LIMITE_API = 4000;

const IMAGEM_PADRAO = 'data:image/svg+xml;utf8,' + encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300">' +
  '<rect width="400" height="300" fill="#EAE2D0"/>' +
  '<g fill="#B9632E" opacity="0.55">' +
  '<ellipse cx="200" cy="168" rx="42" ry="34"/>' +
  '<ellipse cx="144" cy="120" rx="17" ry="22" transform="rotate(-18 144 120)"/>' +
  '<ellipse cx="184" cy="96" rx="17" ry="23"/>' +
  '<ellipse cx="226" cy="96" rx="17" ry="23"/>' +
  '<ellipse cx="266" cy="120" rx="17" ry="22" transform="rotate(18 266 120)"/>' +
  '</g>' +
  '<text x="200" y="250" text-anchor="middle" font-family="Arial, sans-serif" font-size="15" fill="#6B6558">Foto em breve</text>' +
  '</svg>'
);

function urlImagemProduto(imagem) {
  return imagem && String(imagem).trim() !== '' ? imagem : IMAGEM_PADRAO;
}
function assinaturaFallback() {
  const lista = Array.isArray(window.PRODUTOS_FALLBACK) ? window.PRODUTOS_FALLBACK : [];
  const texto = JSON.stringify(lista);
  let hash = 5381;
  for (let i = 0; i < texto.length; i++) {
    hash = ((hash << 5) + hash + texto.charCodeAt(i)) | 0;
  }
  return `${hash}:${lista.length}`;
}

function lerCacheProdutos() {
  try {
    if (localStorage.getItem(CHAVE_ASSINATURA_CACHE) !== assinaturaFallback()) return null;
    const lista = JSON.parse(localStorage.getItem(CHAVE_CACHE_PRODUTOS));
    return Array.isArray(lista) && lista.length > 0 ? lista : null;
  } catch (falha) {
    return null;
  }
}

function salvarCacheProdutos(lista) {
  try {
    localStorage.setItem(CHAVE_CACHE_PRODUTOS, JSON.stringify(lista));
    localStorage.setItem(CHAVE_ASSINATURA_CACHE, assinaturaFallback());
  } catch (falha) {
    return;
  }
}

function listaLocalDeProdutos() {
  const cache = lerCacheProdutos();
  if (cache) return { produtos: cache, origem: 'cache' };
  if (Array.isArray(window.PRODUTOS_FALLBACK) && window.PRODUTOS_FALLBACK.length > 0) {
    return { produtos: window.PRODUTOS_FALLBACK, origem: 'local' };
  }
  return null;
}

async function requisitarComLimite(url) {
  const controle = new AbortController();
  const temporizador = window.setTimeout(() => controle.abort(), TEMPO_LIMITE_API);
  try {
    return await fetch(url, { credentials: 'include', signal: controle.signal, cache: 'no-store' });
  } finally {
    window.clearTimeout(temporizador);
  }
}

async function buscarProdutos() {
  try {
    const resposta = await requisitarComLimite(`${API_BASE}/produtos.php`);
    const dados = await resposta.json();
    if (!resposta.ok || !dados.sucesso || !Array.isArray(dados.produtos)) {
      throw new Error('Resposta inválida do servidor');
    }
    salvarCacheProdutos(dados.produtos);
    return { produtos: dados.produtos, origem: 'servidor' };
  } catch (falha) {
    const local = listaLocalDeProdutos();
    if (local) return local;
    throw falha;
  }
}

async function buscarProdutoPorId(id) {
  try {
    const resposta = await requisitarComLimite(`${API_BASE}/produtos.php?id=${encodeURIComponent(id)}`);
    if (resposta.status === 404) {
      const naoEncontrado = new Error('Produto não encontrado');
      naoEncontrado.naoEncontrado = true;
      throw naoEncontrado;
    }
    const dados = await resposta.json();
    if (!resposta.ok || !dados.sucesso || !dados.produto) {
      throw new Error('Resposta inválida do servidor');
    }
    return { produto: dados.produto, origem: 'servidor' };
  } catch (falha) {
    if (falha.naoEncontrado) throw falha;
    const local = listaLocalDeProdutos();
    const produto = local && local.produtos.find((item) => Number(item.id) === Number(id));
    if (produto) return { produto, origem: local.origem };
    throw falha;
  }
}

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

function escaparHtml(texto) {
  return String(texto ?? '').replace(/[&<>"']/g, (c) => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
  ));
}

function formatarPreco(valor) {
  return Number(valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function formatarDataHora(valor) {
  const data = new Date(valor.replace(' ', 'T'));
  return data.toLocaleString('pt-BR');
}

function montarMenu(usuario) {
  const menu = document.getElementById('menu');
  if (!menu) return;

  const links = [['index.html', 'Loja'], ['sobre-nos.html', 'Sobre nós'], ['faq.html', 'FAQ']];
  if (usuario) {
    if (usuario.perfil === 'master') {
      links.push(['consulta-usuario.html', 'Usuários'], ['log.html', 'Log']);
    } else {
      links.push(['minha-conta.html', 'Minha conta']);
    }
    links.push(['modelo-bd.html', 'Modelo do BD']);
  }

  menu.classList.toggle('menu-longo', links.length > 4);

  const paginaAtual = document.body.dataset.pagina;
  menu.innerHTML = links
    .map(([href, rotulo]) => `<a href="${href}" class="menu-link${href === paginaAtual ? ' ativo' : ''}">${rotulo}</a>`)
    .join('');
}

function renderizarAreaConta(usuario) {
  const area = document.getElementById('area-conta');
  if (!area || !document.getElementById('menu')) return;

  if (!usuario) {
    area.innerHTML = `
      <a class="conta-link" href="login.html">Entrar</a>
      <a class="conta-link" href="cadastro.html">Cadastrar</a>
    `;
    montarMenu(null);
    return;
  }

  area.innerHTML = `
    <div class="conta-usuario">
      <span class="conta-nome">${usuario.nome_completo.split(' ')[0]}</span>
      <button type="button" class="conta-sair" id="botao-sair">Sair</button>
    </div>
  `;
  montarMenu(usuario);

  document.getElementById('botao-sair').addEventListener('click', async () => {
    try {
      await fetch(`${API_BASE}/logout.php`, { method: 'POST', credentials: 'include' });
    } catch (falha) {
      window.location.href = 'index.html';
      return;
    }
    window.location.href = 'index.html';
  });
}

async function carregarSessao() {
  try {
    const resposta = await fetch(`${API_BASE}/perfil.php`, { credentials: 'include' });
    if (!resposta.ok) {
      try {
        const falha = await resposta.json();
        if (falha.expirada || falha.sessao_encerrada) {
          sessionStorage.setItem('avisoSessao', falha.mensagem);
          mostrarAviso(falha.mensagem);
        }
      } catch (erroLeitura) {
      }
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
