const CHAVE_PIX_DEMONSTRACAO = '3858a25f-240f-4e9d-9a27-3a46df1d0010';
const NOME_RECEBEDOR_PIX = 'CASA FOCINHO';
const CIDADE_RECEBEDOR_PIX = 'RIO DE JANEIRO';

function campoEmv(id, valor) {
  return id + String(valor.length).padStart(2, '0') + valor;
}

function calcularCrc16(texto) {
  let crc = 0xFFFF;
  for (let i = 0; i < texto.length; i++) {
    crc ^= texto.charCodeAt(i) << 8;
    for (let bit = 0; bit < 8; bit++) {
      crc = (crc & 0x8000) ? ((crc << 1) ^ 0x1021) & 0xFFFF : (crc << 1) & 0xFFFF;
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, '0');
}

function montarPayloadPix(valor, identificador) {
  const conta = campoEmv('00', 'br.gov.bcb.pix') + campoEmv('01', CHAVE_PIX_DEMONSTRACAO);
  const corpo =
    campoEmv('00', '01') +
    campoEmv('01', '12') +
    campoEmv('26', conta) +
    campoEmv('52', '0000') +
    campoEmv('53', '986') +
    campoEmv('54', Number(valor).toFixed(2)) +
    campoEmv('58', 'BR') +
    campoEmv('59', NOME_RECEBEDOR_PIX) +
    campoEmv('60', CIDADE_RECEBEDOR_PIX) +
    campoEmv('62', campoEmv('05', identificador)) +
    '6304';
  return corpo + calcularCrc16(corpo);
}

function gerarIdentificadorPix() {
  const sorteio = String(Math.floor(Math.random() * 1e8)).padStart(8, '0');
  return `CF${sorteio}`;
}

function desenharQrCode(texto, alvo) {
  const qr = qrcode(0, 'M');
  qr.addData(texto);
  qr.make();
  const modulos = qr.getModuleCount();
  const margem = 4;
  const lado = modulos + margem * 2;
  let caminho = '';
  for (let linha = 0; linha < modulos; linha++) {
    for (let coluna = 0; coluna < modulos; coluna++) {
      if (qr.isDark(linha, coluna)) {
        caminho += `M${coluna + margem} ${linha + margem}h1v1h-1z`;
      }
    }
  }
  alvo.innerHTML =
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${lado} ${lado}" shape-rendering="crispEdges" role="img" aria-label="QR Code para pagamento via Pix">` +
    `<rect width="${lado}" height="${lado}" fill="#FFFFFF"/>` +
    `<path d="${caminho}" fill="#000000"/>` +
    '</svg>';
}

(function () {
  const area = document.getElementById('area-pix');
  if (!area) return;

  const validadeSegundos = parseInt(area.dataset.validade, 10) || 600;
  const confirmacaoSegundos = parseInt(area.dataset.confirmacao, 10) || 15;
  const pausaAposConfirmar = parseInt(area.dataset.pausa, 10);

  const painel = area.querySelector('.pix-painel');
  const caixaQr = document.getElementById('pix-qr');
  const campoCodigo = document.getElementById('pix-codigo');
  const botaoCopiar = document.getElementById('pix-copiar');
  const botaoNovo = document.getElementById('pix-novo');
  const valorTempo = document.getElementById('pix-tempo-valor');
  const barra = document.getElementById('pix-barra-preenchimento');
  const status = document.getElementById('pix-status');
  const valorTotal = document.getElementById('pix-valor');
  const botaoConfirmar = document.getElementById('botao-confirmar-pagamento');

  let relogio = null;
  let confirmacao = null;
  let encaminhamento = null;
  let limite = 0;

  function formatarTempo(segundos) {
    const minutos = Math.floor(segundos / 60);
    const resto = segundos % 60;
    return `${String(minutos).padStart(2, '0')}:${String(resto).padStart(2, '0')}`;
  }

  function limparTemporizadores() {
    window.clearInterval(relogio);
    window.clearTimeout(confirmacao);
    window.clearTimeout(encaminhamento);
    relogio = null;
    confirmacao = null;
    encaminhamento = null;
  }

  function definirEstado(estado, mensagem) {
    painel.dataset.estado = estado;
    status.textContent = mensagem;
    botaoNovo.hidden = estado !== 'expirado' && estado !== 'falha';
  }

  function atualizarRelogio() {
    const restante = Math.max(0, Math.ceil((limite - Date.now()) / 1000));
    valorTempo.textContent = formatarTempo(restante);
    barra.style.width = `${(restante / validadeSegundos) * 100}%`;
    painel.classList.toggle('urgente', restante <= 60);
    if (restante === 0) expirar();
  }

  function expirar() {
    limparTemporizadores();
    definirEstado('expirado', 'Este código expirou. Gere um novo para pagar.');
  }

  function confirmarPagamento() {
    window.clearInterval(relogio);
    window.clearTimeout(confirmacao);
    definirEstado('confirmado', 'Pagamento confirmado! Gerando a sua nota fiscal...');
    encaminhamento = window.setTimeout(() => botaoConfirmar.click(), Number.isNaN(pausaAposConfirmar) ? 1600 : pausaAposConfirmar);
  }

  function iniciar() {
    limparTemporizadores();
    const total = totalDoPedidoAtual();
    const payload = montarPayloadPix(total, gerarIdentificadorPix());
    desenharQrCode(payload, caixaQr);
    campoCodigo.value = payload;
    valorTotal.textContent = formatarPreco(total);
    botaoCopiar.textContent = 'Copiar código';
    limite = Date.now() + validadeSegundos * 1000;
    definirEstado('aguardando', 'Aguardando o pagamento...');
    atualizarRelogio();
    relogio = window.setInterval(atualizarRelogio, 250);
    confirmacao = window.setTimeout(confirmarPagamento, confirmacaoSegundos * 1000);
  }

  function parar() {
    limparTemporizadores();
  }

  async function copiarCodigo() {
    const codigo = campoCodigo.value;
    let copiou = false;
    try {
      await navigator.clipboard.writeText(codigo);
      copiou = true;
    } catch (falha) {
      campoCodigo.select();
      copiou = document.execCommand && document.execCommand('copy');
    }
    if (copiou) {
      botaoCopiar.textContent = 'Código copiado!';
      mostrarAviso('Código Pix copiado');
      window.setTimeout(() => {
        botaoCopiar.textContent = 'Copiar código';
      }, 2500);
    } else {
      mostrarAviso('Não foi possível copiar. Selecione o código e copie manualmente.');
    }
  }

  document.querySelectorAll('input[name="metodo"]').forEach((radio) => {
    radio.addEventListener('change', (evento) => {
      if (evento.target.value === 'pix') {
        botaoConfirmar.hidden = true;
        iniciar();
      } else {
        parar();
        botaoConfirmar.hidden = false;
      }
    });
  });

  botaoCopiar.addEventListener('click', copiarCodigo);
  botaoNovo.addEventListener('click', iniciar);

  document.addEventListener('pagamento:falha', () => {
    limparTemporizadores();
    botaoConfirmar.hidden = true;
    definirEstado('falha', 'Não foi possível registrar o pedido. Gere um novo código para tentar de novo.');
  });
})();
