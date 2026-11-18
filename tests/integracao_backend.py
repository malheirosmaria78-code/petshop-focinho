#!/usr/bin/env python3
"""Testes HTTP reais em PHP/MySQL descartaveis. Nunca usa o socket do banco local."""
from pathlib import Path
from urllib.parse import urlencode
import http.cookiejar
import json
import os
import re
import shutil
import socket
import subprocess
import tempfile
import time
import urllib.error
import urllib.request

REPO = Path(__file__).resolve().parents[1]
ENV = dict(os.environ, PETSHOP_DB_USER='root', PETSHOP_DB_PASSWORD='')
SERVICOS = []
ARQUIVOS = []
TOTAL = 0


def conferir(condicao, descricao):
    global TOTAL
    if not condicao:
        raise AssertionError(descricao)
    TOTAL += 1
    print('OK: ' + descricao, flush=True)


def sql(comando, deve_falhar=False):
    p = subprocess.run(['mysql', '--no-defaults', '--socket=' + SOCKET, '-u', 'root',
                        '--password=', '--default-character-set=utf8mb4', '-N'], input=comando,
                       text=True, capture_output=True)
    if deve_falhar:
        conferir(p.returncode != 0, 'Banco impede exclusao definitiva de usuario com pedidos')
        return ''
    if p.returncode:
        raise RuntimeError(p.stderr)
    return p.stdout.strip()


def cliente():
    jar = http.cookiejar.CookieJar()
    return urllib.request.build_opener(urllib.request.HTTPCookieProcessor(jar)), jar


def chamar(c, endpoint, dados=None, metodo=None):
    req = urllib.request.Request(BASE + endpoint,
        data=json.dumps(dados).encode() if dados is not None else None,
        headers={'Content-Type': 'application/json'}, method=metodo)
    try:
        resposta = c[0].open(req, timeout=10)
    except urllib.error.HTTPError as erro:
        resposta = erro
    with resposta:
        raw = resposta.read()
        if resposta.headers.get_content_type() == 'application/pdf':
            return resposta.status, raw
        try:
            return resposta.status, json.loads(raw)
        except Exception:
            raise AssertionError('Resposta nao JSON em ' + endpoint + ': ' + raw[:250].decode(errors='replace'))


def entrar(c, login='master', senha='Adminpet', concluir=True):
    status, dados = chamar(c, 'login.php', {'login': login, 'senha': senha})
    if status != 200:
        raise AssertionError(('Login de teste falhou', status, dados))
    if not concluir:
        return dados
    respostas = {'nome_mae': 'Nao Informado', 'data_nascimento': '1990-01-01', 'cep': '20000000'}
    status, resultado = chamar(c, 'verificar_2fa.php', {'resposta': respostas[dados['pergunta_2fa']]})
    if status != 200:
        raise AssertionError(('2FA de teste falhou', status, resultado))
    return resultado


def cpf(base):
    n = list(map(int, str(base).zfill(9)))
    for tamanho in (9, 10):
        digito = (sum(n[i] * (tamanho + 1 - i) for i in range(tamanho)) * 10) % 11
        n.append(0 if digito == 10 else digito)
    return ''.join(map(str, n))


def ficha(login='comumx', numero=123456789):
    return dict(nome_completo='Pessoa Ficticia Integracao', data_nascimento='1990-01-01',
        sexo='Outro', nome_materno='Nao Informado', cpf=cpf(numero),
        email='teste@example.invalid', telefone_celular='(+55)21-35550000',
        telefone_fixo='(+55)21-35550001', cep='20000000', logradouro='Rua de Teste',
        numero='10', bairro='Centro', cidade='Rio de Janeiro', uf='RJ',
        login=login, senha='abcdefgh', confirmacao_senha='abcdefgh')


def executar():
    # Antes de qualquer escrita, confirmar o datadir do servidor descartavel.
    datadir = Path(sql("SELECT @@datadir")).resolve()
    if not str(datadir).startswith('/tmp/petshop-') or datadir != PASTA / 'mysql':
        raise RuntimeError('Servidor nao descartavel: teste interrompido sem alterar dados.')
    sql('DROP DATABASE IF EXISTS petshop;')
    sql((REPO / 'petshop-backend/sql/schema.sql').read_text())
    conferir(sql('SELECT COUNT(*) FROM petshop.produtos') == '38', 'Schema instala 38 produtos')
    conferir(len(sql('SHOW TABLES FROM petshop').splitlines()) == 6, 'Schema instala seis tabelas')

    anon = cliente()
    for endpoint in ['usuarios.php', 'log.php', 'exportar_usuarios_pdf.php']:
        conferir(chamar(anon, endpoint)[0] == 401, 'Anonimo bloqueado em ' + endpoint)
    conferir(chamar(anon, 'login.php', {'login': [], 'senha': {}})[0] == 422, 'Login rejeita estruturas JSON invalidas')
    conferir(chamar(anon, 'login.php', {'login': 'master', 'senha': 'erradaaa'})[0] == 401, 'Senha incorreta nao autentica')

    admin = cliente()
    entrar(admin, concluir=False)
    conferir(chamar(admin, 'usuarios.php')[0] == 401, 'Master sem 2FA nao acessa administracao')
    conferir(chamar(admin, 'verificar_2fa.php', {'resposta': []})[0] == 422, '2FA rejeita tipo de resposta invalido')
    entrar(admin)
    status, dados = chamar(admin, 'perfil.php')
    conferir(status == 200 and dados['usuario']['perfil'] == 'master', 'Master autentica com 2FA e perfil correto')
    conferir(dados['usuario']['login'] == 'master', 'API fornece login para o cabecalho')

    cadastro = ficha()
    for campo in ['telefone_fixo', 'nome_materno']:
        invalido = dict(cadastro); invalido.pop(campo)
        conferir(chamar(anon, 'cadastro.php', invalido)[0] == 422, 'Cadastro exige ' + campo)
    for alteracao, descricao in [({'senha': 'Abcdefg1', 'confirmacao_senha': 'Abcdefg1'}, 'Senha com numero recusada'),
            ({'senha': 'abcdefg', 'confirmacao_senha': 'abcdefg'}, 'Senha com sete letras recusada'),
            ({'confirmacao_senha': 'ijklmnop'}, 'Confirmacao diferente recusada'),
            ({'telefone_celular': '(+55)21-999999999'}, 'Telefone com nove digitos recusado'),
            ({'telefone_fixo': '(+55)21-123'}, 'Telefone incompleto recusado'),
            ({'cpf': '11111111111'}, 'CPF invalido recusado'),
            ({'data_nascimento': '2025-02-30'}, 'Data inexistente recusada'),
            ({'login': 'abcd12'}, 'Login nao alfabetico recusado')]:
        conferir(chamar(anon, 'cadastro.php', dict(cadastro, **alteracao))[0] == 422, descricao)
    status, dados = chamar(anon, 'cadastro.php', dict(cadastro, perfil='master'))
    conferir(status == 200 and dados['sucesso'], 'Cadastro aceita oito letras e todos os campos')
    uid = int(sql("SELECT id FROM petshop.usuarios WHERE login='comumx'"))
    conferir(sql('SELECT perfil FROM petshop.usuarios WHERE id=' + str(uid)) == 'comum', 'Cadastro nao permite criar master pelo JSON')
    conferir(sql("SELECT senha_hash <> 'abcdefgh' FROM petshop.usuarios WHERE id=" + str(uid)) == '1', 'Senha armazenada como hash')
    conferir(chamar(anon, 'cadastro.php', cadastro)[0] == 409, 'Cadastro duplicado recusado')

    user = cliente(); entrar(user, 'comumx', 'abcdefgh')
    for endpoint in ['usuarios.php', 'log.php', 'exportar_usuarios_pdf.php']:
        conferir(chamar(user, endpoint)[0] == 403, 'Comum bloqueado em ' + endpoint)
    conferir(chamar(user, 'alterar_status_usuario.php', {'id': uid, 'ativo': False})[0] == 403, 'Comum nao altera status')
    conferir(chamar(user, 'excluir_usuario.php', {'id': uid})[0] == 403, 'Comum nao exclui contas')
    conferir(chamar(admin, 'alterar_senha.php', {'senha_atual': 'Adminpet', 'nova_senha': 'abcdefgh', 'confirmacao_nova_senha': 'abcdefgh'})[0] == 403, 'Master nao altera senha pela funcao de comum')

    # Busca, filtros e protecao dos endpoints administrativos.
    status, dados = chamar(admin, 'usuarios.php?' + urlencode({'busca': 'Ficticia'}))
    conferir(status == 200 and [int(x['id']) for x in dados['usuarios']] == [uid], 'Master pesquisa substring do nome')
    conferir(all(int(x['id']) != 1 for x in dados['usuarios']), 'Listagem nao inclui master')
    conferir(chamar(admin, 'usuarios.php?status=invalido')[0] == 422, 'Filtro de status invalido recusado')
    conferir(chamar(admin, 'usuarios.php?busca[]=x')[0] == 422, 'Busca com array nao causa erro interno')
    conferir(chamar(admin, 'log.php?tipo=invalido')[0] == 422, 'Filtro de log invalido recusado')
    conferir(chamar(admin, 'log.php?busca[]=x')[0] == 422, 'Busca de log com array recusada')
    conferir(chamar(admin, 'usuarios.php', {}, 'POST')[0] == 405, 'Metodo incorreto recusado na consulta')
    conferir(chamar(admin, 'exportar_usuarios_pdf.php', {})[0] == 405, 'PDF aceita somente GET')
    for invalid in [0, -1, [], 'abc', True]:
        conferir(chamar(admin, 'alterar_status_usuario.php', {'id': invalid, 'ativo': False})[0] == 422, 'ID invalido recusado: ' + repr(invalid))
    conferir(chamar(admin, 'alterar_status_usuario.php', {'id': uid, 'ativo': 'false'})[0] == 422, 'Status deve ser booleano')
    conferir(chamar(admin, 'alterar_status_usuario.php', {'id': 1, 'ativo': False})[0] == 403, 'Master nao pode desativar master')
    conferir(chamar(admin, 'excluir_usuario.php', {'id': 1})[0] == 403, 'Master nao pode excluir master')
    conferir(chamar(admin, 'alterar_status_usuario.php', {'id': 999999, 'ativo': False})[0] == 404, 'Conta inexistente retorna 404')

    status, dados = chamar(user, 'criar_pedido.php', {'itens': [{'id': 1, 'quantidade': 1}], 'forma_pagamento': 'pix'})
    conferir(status == 200 and dados['sucesso'], 'Pedido de teste criado para validar preservacao')
    pedido = sql('SELECT id FROM petshop.pedidos WHERE usuario_id=' + str(uid))
    pendente = cliente(); etapa = entrar(pendente, 'comumx', 'abcdefgh', concluir=False)
    status, dados = chamar(admin, 'excluir_usuario.php', {'id': uid})
    conferir(status == 200 and dados['sucesso'], 'Endpoint de exclusao realiza exclusao logica')
    conferir(sql('SELECT COUNT(*) FROM petshop.usuarios WHERE id=' + str(uid)) == '1', 'Registro excluido logicamente permanece guardado')
    conferir(sql('SELECT COUNT(*) FROM petshop.pedidos WHERE id=' + pedido) == '1', 'Pedido preservado')
    conferir(chamar(user, 'perfil.php')[0] == 401, 'Sessao aberta bloqueada apos exclusao logica')
    conferir(chamar(cliente(), 'login.php', {'login': 'comumx', 'senha': 'abcdefgh'})[0] == 403, 'Novo login de conta excluida bloqueado')
    respostas = {'nome_mae': 'Nao Informado', 'data_nascimento': '1990-01-01', 'cep': '20000000'}
    conferir(chamar(pendente, 'verificar_2fa.php', {'resposta': respostas[etapa['pergunta_2fa']]})[0] == 403, '2FA pendente de conta excluida bloqueado')
    conferir(chamar(admin, 'usuarios.php?status=ativos')[1]['usuarios'] == [], 'Conta sai da lista de ativos')
    conferir(len(chamar(admin, 'usuarios.php?status=desativados')[1]['usuarios']) == 1, 'Master consulta registros excluidos')
    conferir(chamar(admin, 'alterar_status_usuario.php', {'id': uid, 'ativo': True})[0] == 200, 'Master restaura mesma conta')
    conferir(sql('SELECT desativado_em IS NULL FROM petshop.usuarios WHERE id=' + str(uid)) == '1', 'Restauracao limpa data de exclusao')
    entrar(user, 'comumx', 'abcdefgh')
    conferir(len(chamar(user, 'meus_pedidos.php')[1]['pedidos']) == 1, 'Conta restaurada recupera historico')
    sql('DELETE FROM petshop.usuarios WHERE id=' + str(uid), deve_falhar=True)

    falhas = cliente(); entrar(falhas, 'comumx', 'abcdefgh', concluir=False)
    for tentativa in range(3):
        status, dados = chamar(falhas, 'verificar_2fa.php', {'resposta': 'RESPOSTA INCORRETA'})
        conferir(status == 401 and dados['bloqueado'] == (tentativa == 2), '2FA controla tentativa ' + str(tentativa + 1))
    conferir(dados['mensagem'] == '3 tentativas sem sucesso! Favor realizar Login novamente.', 'Mensagem exigida apos tres erros')
    conferir(chamar(falhas, 'verificar_2fa.php', {'resposta': 'Nao Informado'})[0] == 401, 'Sessao 2FA encerrada apos tres erros')

    for parametros in [{'tipo': 'todos'}, {'tipo': 'nome', 'busca': 'Ficticia'}, {'tipo': 'cpf', 'busca': cadastro['cpf']}]:
        status, dados = chamar(admin, 'log.php?' + urlencode(parametros))
        registros = dados['registros']
        conferir(status == 200 and len(registros) > 0, 'Log pesquisavel por ' + parametros['tipo'])
        conferir(all(x['nome'] == cadastro['nome_completo'] for x in registros), 'Log nao mistura autenticacoes do master')
        conferir([x['data_hora'] for x in registros] == sorted([x['data_hora'] for x in registros], reverse=True), 'Log ordenado do mais recente')

    conferir(chamar(user, 'alterar_senha.php', {'senha_atual': [], 'nova_senha': 'ijklmnop', 'confirmacao_nova_senha': 'ijklmnop'})[0] == 422, 'Alteracao de senha rejeita array')
    conferir(chamar(user, 'alterar_senha.php', {'senha_atual': 'erradaaa', 'nova_senha': 'ijklmnop', 'confirmacao_nova_senha': 'ijklmnop'})[0] == 401, 'Senha atual incorreta recusada')
    master_hash = sql('SELECT senha_hash FROM petshop.usuarios WHERE id=1')
    conferir(chamar(user, 'alterar_senha.php', {'id': 1, 'senha_atual': 'abcdefgh', 'nova_senha': 'ijklmnop', 'confirmacao_nova_senha': 'ijklmnop'})[0] == 200, 'Comum altera somente a propria senha')
    conferir(master_hash == sql('SELECT senha_hash FROM petshop.usuarios WHERE id=1'), 'ID enviado nao altera senha do master')
    conferir(chamar(cliente(), 'login.php', {'login': 'comumx', 'senha': 'abcdefgh'})[0] == 401, 'Senha anterior deixa de autenticar')
    entrar(user, 'comumx', 'ijklmnop')
    conferir(chamar(user, 'perfil.php')[0] == 200, 'Nova senha autentica com 2FA')

    hash_antigo = subprocess.check_output(['php', '-r', "echo password_hash('Abcdefg1', PASSWORD_BCRYPT);"], text=True)
    sql("UPDATE petshop.usuarios SET senha_hash='" + hash_antigo + "' WHERE id=" + str(uid))
    entrar(user, 'comumx', 'Abcdefg1')
    conferir(chamar(user, 'alterar_senha.php', {'senha_atual': 'Abcdefg1', 'nova_senha': 'ijklmnop', 'confirmacao_nova_senha': 'ijklmnop'})[0] == 200, 'Senha antiga com numero pode ser trocada por oito letras')
    entrar(user, 'comumx', 'ijklmnop')

    status, pdf = chamar(admin, 'exportar_usuarios_pdf.php')
    conferir(status == 200 and pdf.startswith(b'%PDF-'), 'Master baixa PDF real sem avisos PHP')
    (PASTA / 'usuarios.pdf').write_bytes(pdf)
    # Conta longa para inspecao de quebra de texto no PDF.
    nome_longo = 'Pessoa ' + 'Ficticia ' * 7 + 'Teste'
    sql("UPDATE petshop.usuarios SET nome_completo='" + nome_longo + "',email='" + ('teste' * 20) + "@example.invalid' WHERE id=" + str(uid))
    status, pdf = chamar(admin, 'exportar_usuarios_pdf.php'); (PASTA / 'usuarios-longos.pdf').write_bytes(pdf)
    conferir(status == 200 and pdf.startswith(b'%PDF-'), 'PDF aceita campos extensos')

    # Paginar uma lista extensa sem repetir ou cortar linhas de usuarios.
    colunas = [x.split('\t')[0] for x in sql('SHOW COLUMNS FROM petshop.usuarios').splitlines() if not x.startswith('id\t')]
    for i in range(25):
        login = 'pdf' + chr(97 + i // 26) + chr(97 + i % 26) + 'x'
        campos = {'login': "'" + login + "'", 'cpf': "'" + cpf(200000000 + i) + "'"}
        sql('INSERT INTO petshop.usuarios (' + ','.join('`' + c + '`' for c in colunas) + ') SELECT '
            + ','.join(campos.get(c, '`' + c + '`') for c in colunas)
            + ' FROM petshop.usuarios WHERE id=' + str(uid))
    status, pdf = chamar(admin, 'exportar_usuarios_pdf.php')
    (PASTA / 'usuarios-paginados.pdf').write_bytes(pdf)
    conferir(status == 200 and len(re.findall(rb'/Type /Page\b', pdf)) > 1, 'PDF pagina listas extensas')
    sql("DELETE FROM petshop.usuarios WHERE login LIKE 'pdf%'")

    # Expiracao por inatividade em arquivos de sessao exclusivamente temporarios.
    sessid = next(c.value for c in user[1] if c.name == 'PHPSESSID')
    arquivo = PASTA / ('sess_' + sessid)
    texto = arquivo.read_text(); texto = re.sub(r'ultima_atividade\|i:\d+;', 'ultima_atividade|i:' + str(int(time.time()) - 1801) + ';', texto)
    arquivo.write_text(texto)
    status, dados = chamar(user, 'perfil.php')
    conferir(status == 401 and dados.get('expirada'), 'Sessao expira por inatividade')
    conferir(chamar(admin, 'logout.php', {})[0] == 200, 'Logout do master funciona')
    conferir(chamar(admin, 'usuarios.php')[0] == 401, 'Master perde acesso apos logout')

    # Autenticacao nao deve impor a regra de cadastro a contas antigas.
    senha_master_antiga = 'Master1234!Legado'
    hash_master_antigo = subprocess.check_output(['php', '-r', "echo password_hash('Master1234!Legado', PASSWORD_BCRYPT);"], text=True)
    sql("UPDATE petshop.usuarios SET senha_hash='" + hash_master_antigo + "' WHERE id=1")
    master_antigo = cliente()
    entrar(master_antigo, 'master', senha_master_antiga)
    conferir(chamar(master_antigo, 'usuarios.php')[0] == 200,
             'Master com senha antiga longa, numeros e simbolos autentica e acessa administracao')
    sql("UPDATE petshop.usuarios SET senha_hash='" + master_hash + "' WHERE id=1")

    print('\nTOTAL: ' + str(TOTAL) + ' verificacoes aprovadas.', flush=True)
    print('Artefatos de teste: ' + str(PASTA), flush=True)


if __name__ == '__main__':
    caminho = os.environ.get('PETSHOP_TEST_SOCKET')
    PASTA = Path(caminho).resolve().parent if caminho else Path(tempfile.mkdtemp(prefix='petshop-tests-'))
    if not str(PASTA).startswith('/tmp/petshop-'):
        raise SystemExit('Use apenas uma pasta descartavel /tmp/petshop-*.')
    SOCKET = str(PASTA / 'mysql.sock')
    try:
        if not caminho:
            mysql = shutil.which('mysqld') or '/usr/sbin/mysqld'
            subprocess.run([mysql, '--no-defaults', '--initialize-insecure', '--datadir=' + str(PASTA / 'mysql')], check=True, capture_output=True)
            log = open(PASTA / 'mysql-process.log', 'w'); ARQUIVOS.append(log)
            SERVICOS.append(subprocess.Popen([mysql, '--no-defaults', '--datadir=' + str(PASTA / 'mysql'), '--socket=' + SOCKET, '--pid-file=' + str(PASTA / 'mysql.pid'), '--log-error=' + str(PASTA / 'mysql.log'), '--skip-networking', '--mysqlx=OFF'], stdout=log, stderr=log))
        for _ in range(100):
            try:
                sql('SELECT 1'); break
            except Exception:
                time.sleep(.1)
        else:
            raise RuntimeError('MySQL temporario nao iniciou.')
        with socket.socket() as s:
            s.bind(('127.0.0.1', 0)); porta = s.getsockname()[1]
        BASE = 'http://127.0.0.1:' + str(porta) + '/petshop-backend/api/'
        log = open(PASTA / 'php.log', 'w'); ARQUIVOS.append(log)
        SERVICOS.append(subprocess.Popen(['php', '-d', 'pdo_mysql.default_socket=' + SOCKET, '-d', 'session.save_path=' + str(PASTA), '-S', '127.0.0.1:' + str(porta), '-t', str(REPO)], env=ENV, stdout=log, stderr=log))
        for _ in range(100):
            try:
                urllib.request.urlopen('http://127.0.0.1:' + str(porta) + '/petshop-frontend/login.html', timeout=1); break
            except OSError:
                time.sleep(.05)
        executar()
        if os.environ.get('PETSHOP_TEST_UI') == '1':
            ui_env = dict(ENV, PETSHOP_TEST_SOCKET=SOCKET)
            subprocess.run([os.environ.get('PETSHOP_TEST_NODE', 'node'), str(REPO / 'tests/integracao_frontend.cjs')], env=ui_env, check=True)
    finally:
        for p in reversed(SERVICOS):
            p.terminate()
            try:
                p.wait(timeout=10)
            except subprocess.TimeoutExpired:
                p.kill(); p.wait()
        for f in ARQUIVOS:
            f.close()
