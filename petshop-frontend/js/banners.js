(function () {
  const raiz = document.querySelector('[data-banners]');
  if (!raiz) return;

  const slides = Array.from(raiz.querySelectorAll('.banner-slide'));
  const pontos = Array.from(raiz.querySelectorAll('.banner-ponto'));
  const botaoAnterior = raiz.querySelector('.banner-seta-anterior');
  const botaoProximo = raiz.querySelector('.banner-seta-proximo');
  const intervalo = parseInt(raiz.dataset.intervalo, 10) || 6000;
  const reduzMovimento = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let atual = 0;
  let temporizador = null;
  let pausado = false;
  let inicioToque = null;

  function exibir(indice) {
    atual = (indice + slides.length) % slides.length;
    slides.forEach((slide, posicao) => {
      const ativo = posicao === atual;
      slide.classList.toggle('ativo', ativo);
      slide.setAttribute('aria-hidden', ativo ? 'false' : 'true');
      slide.querySelectorAll('a').forEach((link) => {
        link.tabIndex = ativo ? 0 : -1;
      });
    });
    pontos.forEach((ponto, posicao) => {
      ponto.classList.toggle('ativo', posicao === atual);
      if (posicao === atual) {
        ponto.setAttribute('aria-current', 'true');
      } else {
        ponto.removeAttribute('aria-current');
      }
    });
  }

  function parar() {
    if (temporizador !== null) {
      window.clearInterval(temporizador);
      temporizador = null;
    }
  }

  function iniciar() {
    parar();
    if (reduzMovimento || pausado || slides.length < 2) return;
    temporizador = window.setInterval(() => exibir(atual + 1), intervalo);
  }

  function irPara(indice) {
    exibir(indice);
    iniciar();
  }

  if (botaoAnterior) botaoAnterior.addEventListener('click', () => irPara(atual - 1));
  if (botaoProximo) botaoProximo.addEventListener('click', () => irPara(atual + 1));
  pontos.forEach((ponto, posicao) => ponto.addEventListener('click', () => irPara(posicao)));

  raiz.addEventListener('mouseenter', () => {
    pausado = true;
    parar();
  });
  raiz.addEventListener('mouseleave', () => {
    pausado = false;
    iniciar();
  });
  raiz.addEventListener('focusin', () => {
    pausado = true;
    parar();
  });
  raiz.addEventListener('focusout', () => {
    pausado = false;
    iniciar();
  });

  raiz.addEventListener('touchstart', (evento) => {
    inicioToque = evento.touches[0].clientX;
  }, { passive: true });

  raiz.addEventListener('touchend', (evento) => {
    if (inicioToque === null) return;
    const deslocamento = evento.changedTouches[0].clientX - inicioToque;
    inicioToque = null;
    if (Math.abs(deslocamento) < 45) return;
    irPara(deslocamento < 0 ? atual + 1 : atual - 1);
  }, { passive: true });

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      parar();
    } else {
      iniciar();
    }
  });

  raiz.querySelectorAll('.banner-foto img').forEach((imagem) => {
    imagem.addEventListener('error', () => {
      imagem.style.display = 'none';
    });
  });

  exibir(0);
  iniciar();
})();
