# Proximas features

## Pagamento integrado em ambiente de testes

Status: planejado; implementacao ainda nao iniciada.
Branch sugerida: `feature/pagamento-mercadopago-sandbox`.

Integrar a Casa Focinho ao Mercado Pago Checkout Pro usando exclusivamente
contas e credenciais de teste, sem movimentar dinheiro real.

- [ ] Criar a aplicacao e configurar as contas de teste no provedor.
- [ ] Manter credenciais no ambiente do PHP, fora do repositorio.
- [ ] Criar pedidos pendentes com totais recalculados pelo servidor.
- [ ] Criar a preferencia de pagamento e encaminhar para o checkout do provedor.
- [ ] Salvar referencia da transacao e status do pagamento no banco por migracao.
- [ ] Verificar notificacoes do provedor no backend, conferindo pedido e valor,
      e processar notificacoes repetidas sem duplicar operacoes.
- [ ] Exibir estados pendente, aprovado, recusado e cancelado.
- [ ] Testar retorno ao site, notificacoes e falhas de conexao.

A simulacao atual de cartao permanece como esta ate essa feature.

Documentacao:
- https://www.mercadopago.com.br/developers/pt/docs/checkout-pro-preferences/overview
- https://www.mercadopago.com.br/developers/pt/docs/checkout-pro-preferences/integration-test/test-purchases
