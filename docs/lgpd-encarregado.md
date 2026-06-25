# Encarregado pelo Tratamento de Dados (DPO)

Designação e atribuições do encarregado, conforme o art. 41 da LGPD. Documento **interno** do controlador.

> Última revisão: 25 de junho de 2026.

## Designação

- **Encarregado (DPO):** _[confirmar nome completo do responsável pelo projeto]_
- **Canal de contato do titular:** eduardolima2417@gmail.com
- **Forma de divulgação:** o contato é publicado na [Política de Privacidade](../src/app/privacidade/page.tsx) e no rodapé da aplicação (`src/components/layout/Footer.tsx`).

> Em tratamentos de pequeno porte/projetos pessoais, o próprio responsável pode acumular a função de encarregado. Recomenda-se confirmar o nome completo acima antes de publicar.

## Atribuições (art. 41, §2º)

1. **Receber reclamações e comunicações dos titulares**, prestar esclarecimentos e adotar providências.
2. **Receber comunicações da ANPD** e adotar providências.
3. **Orientar** colaboradores e prestadores sobre as práticas de proteção de dados.
4. **Executar** as demais atribuições definidas pelo controlador.

## Procedimento de atendimento ao titular

- **Canal:** e-mail acima.
- **Prazo de resposta:** responder em prazo razoável (referência: até 15 dias para pedidos de acesso, conforme art. 19, II, da LGPD).
- **Direitos atendidos** (art. 18) e como:
  - **Acesso / portabilidade:** o titular pode baixar seus dados em `/perfil` → "Baixar meus dados" (`GET /api/account/export`), ou solicitar por e-mail.
  - **Eliminação:** exclusão da conta em `/perfil` → "Excluir minha conta" (`deleteAccount()`), ou por e-mail.
  - **Correção:** o apelido é imutável por design; demais correções de cadastro pelo canal de e-mail.
  - **Informação sobre compartilhamento:** ver [ROPA](./lgpd-ropa.md) (lista de operadores).
- **Verificação de identidade:** atender solicitações apenas após confirmar que o solicitante é o titular dos dados (ex.: a partir do e-mail cadastrado).

## Registro de solicitações

| Data | Titular (e-mail) | Direito exercido | Providência | Concluído em |
|------|------------------|------------------|-------------|--------------|
| — | (nenhuma solicitação registrada) | — | — | — |
