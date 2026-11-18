const {chromium}=require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const {spawn,execFileSync}=require('child_process');const net=require('net');const fs=require('fs');const path=require('path');
const repo=path.resolve(__dirname,'..');
const testSocket=process.env.PETSHOP_TEST_SOCKET;
if(!testSocket)throw Error('Execute pelo teste de backend com PETSHOP_TEST_UI=1.');
const out=path.dirname(path.resolve(testSocket));
if(!out.startsWith('/tmp/petshop-'))throw Error('Socket de teste invalido.');
const datadir=execFileSync('mysql',['--no-defaults','--socket='+testSocket,'-u','root','--password=','-N','-e','SELECT @@datadir'],{encoding:'utf8'}).trim();
if(path.resolve(datadir)!==path.join(out,'mysql'))throw Error('Banco nao descartavel: teste interrompido.');
let total=0;function ok(v,msg){if(!v)throw Error(msg);console.log('OK: '+msg);total++;}
(async()=>{
 const probe=net.createServer();await new Promise(r=>probe.listen(0,'127.0.0.1',r));const port=probe.address().port;await new Promise(r=>probe.close(r));
 const base='http://127.0.0.1:'+port;const front=base+'/petshop-frontend/';
 const php=spawn('php',['-d','pdo_mysql.default_socket='+testSocket,'-d','session.save_path='+out,'-S','127.0.0.1:'+port,'-t',repo],{env:{...process.env,PETSHOP_DB_USER:'root',PETSHOP_DB_PASSWORD:''},stdio:'ignore'});
 let browser;
 try{
  for(let i=0;i<60;i++){try{await fetch(front+'login.html');break}catch{await new Promise(r=>setTimeout(r,50))}}
  browser=await chromium.launch({executablePath:process.env.PETSHOP_TEST_CHROME || '/usr/bin/google-chrome',headless:true,args:['--no-sandbox','--disable-gpu']});
  const context=await browser.newContext({viewport:{width:1280,height:900},locale:'pt-BR'});
  await context.route('**/*',route=>route.request().url().startsWith(base)?route.continue():route.abort());
  const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(front+'login.html');await page.locator('#senha').pressSequentially('Master1234!Legado');ok(await page.locator('#senha').inputValue()==='Master1234!Legado','Login aceita digitacao de numeros, simbolos e senha com mais de oito caracteres');await page.locator('#login').fill('master');await page.locator('#senha').fill('Adminpet');await page.locator('#botao-entrar').click();await page.waitForURL('**/dupla-fator.html');
  ok(true,'Login master exige tela de 2FA no navegador');
  const key=await page.evaluate(()=>sessionStorage.getItem('pergunta2fa'));await page.locator('#resposta').fill({nome_mae:'Nao Informado',data_nascimento:'1990-01-01',cep:'20000000'}[key]);await page.locator('#botao-confirmar').click();await page.waitForURL('**/index.html');await page.locator('.conta-nome').waitFor();
  ok((await page.locator('.conta-nome').innerText())==='master','Cabecalho mostra login master');
  ok(await page.locator('#menu a[href="modelo-bd.html"]').isVisible(),'Modelo do BD no menu master');
  await page.locator('#menu a[href="modelo-bd.html"]').click();await page.locator('.imagem-der').waitFor();ok(await page.locator('.imagem-der').evaluate(e=>e.complete&&e.naturalWidth>0),'Diagrama carrega no navegador');
  await page.goto(front+'consulta-usuario.html');await page.locator('#corpo-tabela tr').waitFor();
  ok(await page.locator('#filtro-status').inputValue()==='ativos','Consulta inicia em usuarios ativos');
  await page.locator('button[data-acao="desativar"]').click();ok((await page.locator('#modal-titulo').innerText())==='Excluir usuário','Modal apresenta exclusao visual');
  ok((await page.locator('#modal-texto').innerText()).includes('histórico será preservado'),'Confirmacao explica preservacao do historico');await page.locator('#modal-cancelar').click();
  ok(await page.locator('#corpo-tabela tr').count()===1,'Cancelar exclusao mantem a conta');
  await page.locator('button[data-acao="desativar"]').click();await page.locator('#modal-confirmar').click();await page.waitForFunction(()=>document.querySelectorAll('#corpo-tabela tr').length===0);ok(true,'Exclusao confirmada remove linha dos ativos');
  await page.locator('#filtro-status').selectOption('desativados');await page.locator('button[data-acao="reativar"]').waitFor();ok((await page.locator('#corpo-tabela').innerText()).includes('Excluída'),'Registros excluidos podem ser consultados');
  await page.locator('button[data-acao="reativar"]').click();await page.locator('#modal-confirmar').click();await page.waitForFunction(()=>document.querySelectorAll('#corpo-tabela tr').length===0);ok(true,'Restauracao pela interface funciona');
  await page.locator('#filtro-status').selectOption('ativos');await page.locator('#corpo-tabela tr').waitFor();
  const [download]=await Promise.all([page.waitForEvent('download'),page.locator('#botao-baixar-pdf').click()]);await download.saveAs(out+'/pdf-browser.pdf');ok(download.suggestedFilename()==='usuarios-petshop.pdf','Botao master baixa PDF no navegador');
  for(const nome of ['consulta-usuario.html','log.html','modelo-bd.html']){
   await page.goto(front+nome);await page.locator('.conta-nome').waitFor();
   for(const width of [360,768,1280])for(const scale of [1,1.4]){
    await page.setViewportSize({width,height:900});await page.evaluate(s=>document.documentElement.style.setProperty('--escala-fonte',s),scale);
    const dims=await page.evaluate(()=>({width:innerWidth,scroll:document.documentElement.scrollWidth}));ok(dims.scroll<=dims.width+1,nome+' sem overflow em '+width+'px / fonte '+scale);
    if(await page.locator('.tabela-wrap').count())ok(await page.locator('.tabela-wrap').evaluate(e=>e.scrollWidth<=e.clientWidth+1),nome+' mantem todas as colunas visiveis '+width+'px / fonte '+scale);
   }
  }
  await page.setViewportSize({width:1280,height:900});await page.evaluate(()=>document.documentElement.style.setProperty('--escala-fonte',1));await page.goto(front+'consulta-usuario.html');await page.locator('#corpo-tabela tr').waitFor();await page.screenshot({path:out+'/master-desktop.png',fullPage:true});
  await page.setViewportSize({width:360,height:800});await page.screenshot({path:out+'/master-mobile.png',fullPage:true});
  const anon=await browser.newContext({viewport:{width:360,height:800},locale:'pt-BR'});await anon.route('**/*',route=>route.request().url().startsWith(base)?route.continue():route.abort());const p=await anon.newPage();p.on('pageerror',e=>errors.push(e.message));
  await p.goto(front+'modelo-bd.html');await p.waitForURL('**/login.html');ok(true,'Visitante e direcionado ao login no modelo');
  await p.locator('#login').fill('master');await p.locator('#senha').fill('erradaaa');await p.locator('#botao-entrar').click();await p.waitForURL('**/erro.html?**');
  ok((await p.locator('#mensagem-erro').innerText()).includes('inválidos'),'Erro de autenticacao usa tela de erro');ok((await p.locator('#link-voltar').getAttribute('href'))==='login.html','Tela de erro permite voltar ao login');
  await p.goto(front+'erro.html?origem=login&mensagem='+encodeURIComponent('Erro 100% <teste>'));ok(await p.locator('#mensagem-erro').innerText()==='Erro 100% <teste>','Mensagem de erro com percentual e HTML e mostrada como texto');
  await p.goto(front+'cadastro.html');await p.locator('#telefone_fixo').fill('5535550000');ok(await p.locator('#telefone_fixo').inputValue()==='(+55)55-35550000','Mascara preserva DDD 55');
  ok(await p.locator('#telefone_fixo').getAttribute('required')!==null,'Fixo obrigatorio na interface');
  await p.locator('#senha').fill('Abcdefg1');ok(await p.locator('#senha').inputValue()==='Abcdefg','Campo de nova senha aceita apenas letras');
  await p.locator('#senha').fill('abcdefgh');ok(await p.evaluate(()=>validarSenhaFormato(document.querySelector('#senha').value)),'Oito letras sao validas no frontend');
  await p.locator('#botao-enviar').click();ok(await p.locator('#grupo-fixo').evaluate(e=>!e.classList.contains('invalido')),'Telefone completo nao e rejeitado no formulario');
  await p.locator('button[type="reset"]').click();ok(await p.locator('#telefone_fixo').inputValue()==='' && !await p.locator('#erro-geral').evaluate(e=>e.classList.contains('mostrar')),'Limpar remove valores e mensagens de validacao');
  for(const width of [360,768,1280])for(const scale of [1,1.4]){
   await p.setViewportSize({width,height:900});await p.evaluate(s=>document.documentElement.style.setProperty('--escala-fonte',s),scale);ok(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'Cadastro sem overflow '+width+'px / fonte '+scale);
  }
  // Entrar como comum para conferir modelo e manter a senha anterior digitavel.
  await p.goto(front+'login.html');await p.locator('#login').fill('comumx');await p.locator('#senha').fill('ijklmnop');await p.locator('#botao-entrar').click();await p.waitForURL('**/dupla-fator.html');const k=await p.evaluate(()=>sessionStorage.getItem('pergunta2fa'));await p.locator('#resposta').fill({nome_mae:'Nao Informado',data_nascimento:'1990-01-01',cep:'20000000'}[k]);await p.locator('#botao-confirmar').click();await p.waitForURL('**/index.html');await p.locator('.conta-nome').waitFor();
  ok(await p.locator('.conta-nome').innerText()==='comumx','Cabecalho comum mostra login');ok(await p.locator('#menu a[href="modelo-bd.html"]').isVisible(),'Modelo disponivel no menu comum');
  await p.goto(front+'minha-conta.html');await p.locator('[data-aba="senha"]').click();await p.locator('#senha_atual').pressSequentially('Senha1234!Legada');ok(await p.locator('#senha_atual').inputValue()==='Senha1234!Legada','Minha conta preserva senha atual longa com numeros e simbolos');
  for(const width of [360,768,1280])for(const scale of [1,1.4]){await p.setViewportSize({width,height:900});await p.evaluate(s=>document.documentElement.style.setProperty('--escala-fonte',s),scale);ok(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'Minha conta sem overflow '+width+'px / fonte '+scale);}
  await p.locator('#alternar-contraste').click();ok(await p.locator('html').getAttribute('data-contraste')==='alto','Contraste funciona');
  await p.goto(front+'alterar-senha.html');await p.locator('#senha_atual').pressSequentially('Senha1234!Legada');ok(await p.locator('#senha_atual').inputValue()==='Senha1234!Legada','Pagina de alterar senha preserva senha atual longa');
  ok(errors.length===0,'Nenhum erro JavaScript nas telas testadas: '+errors.join('; '));
  console.log('TOTAL UI: '+total+' verificacoes aprovadas.');
 } finally {if(browser)await browser.close();php.kill();}
})().catch(e=>{console.error(e);process.exitCode=1});
