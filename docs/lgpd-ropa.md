# ROPA — Registro das Operações de Tratamento

Registro das atividades de tratamento de dados pessoais do Bolão Copa do Mundo 2026, conforme o art. 37 da LGPD. Documento **interno** do controlador.

> Última revisão: 25 de junho de 2026. Reavaliar a cada mudança de schema, operador ou finalidade.

## Identificação

- **Controlador:** Bolão Copa do Mundo 2026 (projeto pessoal — responsável no doc do [Encarregado](./lgpd-encarregado.md)).
- **Encarregado (DPO):** ver [lgpd-encarregado.md](./lgpd-encarregado.md) — contato eduardolima2417@gmail.com.
- **Titulares:** participantes do bolão (pessoas físicas maiores de 18 anos).
- **Categorias de dados:** cadastrais (nome, e-mail, apelido, foto), de autenticação (tokens OAuth), de uso (palpites, pontuação, ligas) e de pagamento (identificador/status de cobrança PIX). Não há dados sensíveis (art. 5º, II).

## Operadores (suboperadores / destinatários)

| Operador | Papel | Dados acessados | Transferência internacional |
|----------|-------|-----------------|------------------------------|
| Google (Google Ireland/LLC) | autenticação OAuth | nome, e-mail, foto | Sim (art. 33) |
| Vercel Inc. | hospedagem + analytics de uso | dados de acesso; serve a aplicação | Sim (art. 33) |
| Turso / libSQL | banco de dados | todos os dados persistidos | Sim (art. 33) |
| Asaas (Asaas Gestão Financeira S.A.) | cobrança PIX | nome, e-mail, CPF, identificador da cobrança | Não (Brasil) |
| football-data.org | dados de jogos | nenhum dado pessoal (apenas partidas) | n/a |

> Transferências internacionais ocorrem nos termos do art. 33 da LGPD, com prestadores que adotam salvaguardas contratuais e padrões de proteção adequados.

## Operações de tratamento

### 1. Autenticação e gestão de conta
- **Finalidade:** permitir login e identificar o usuário.
- **Dados:** nome, e-mail, foto, tokens OAuth.
- **Base legal:** execução de serviço (art. 7º, V).
- **Operadores:** Google, Vercel, Turso.
- **Retenção:** enquanto a conta existir.

### 2. Palpites e pontuação
- **Finalidade:** registrar palpites e calcular pontos (núcleo do serviço).
- **Dados:** palpites de placar, pontuação, vínculo com o usuário.
- **Base legal:** execução de serviço (art. 7º, V).
- **Operadores:** Vercel, Turso; dados de jogos vindos da football-data.org.
- **Retenção:** enquanto a conta existir.

### 3. Rankings (geral e por liga)
- **Finalidade:** exibir a classificação dos participantes.
- **Dados:** apelido, foto, pontuação agregada.
- **Base legal:** execução de serviço (art. 7º, V) — natureza pública da competição.
- **Observação:** apelido, foto e posição são visíveis a outros participantes.

### 4. Ligas (grupos)
- **Finalidade:** rankings privados entre amigos.
- **Dados:** nome da liga, membros, função, código de convite.
- **Base legal:** execução de serviço (art. 7º, V).
- **Retenção:** enquanto a conta/liga existir.

### 5. Pagamento PIX (criação de liga)
- **Finalidade:** cobrar a taxa única de criação de liga.
- **Dados:** nome, e-mail, CPF (enviados à Asaas), identificador e status da cobrança (armazenados).
- **Base legal:** execução de contrato (art. 7º, V) + obrigação legal/fiscal (art. 7º, II) para os registros PAID.
- **Operador:** Asaas (Brasil). Não armazenamos dados de cartão/conta bancária.
- **Retenção:** PAID — prazo fiscal/legal; PENDING — expurgado após expirar.

### 6. Analytics de uso
- **Finalidade:** medir uso agregado para melhorar a plataforma.
- **Dados:** métricas de acesso pseudonimizadas/agregadas (Vercel Analytics).
- **Base legal:** legítimo interesse (art. 7º, IX).

### 7. Prevenção a abuso
- **Finalidade:** limitar criação/entrada em ligas; idempotência de pagamento.
- **Dados:** contagens de ligas, status de pagamento.
- **Base legal:** legítimo interesse (art. 7º, IX).

### 8. Atendimento a direitos do titular
- **Finalidade:** viabilizar acesso, portabilidade e eliminação (art. 18).
- **Implementação:** `GET /api/account/export`, `deleteAccount()`, canal por e-mail.
- **Base legal:** cumprimento de obrigação legal (art. 7º, II).

## Medidas de segurança (art. 46)

- Comunicação criptografada (HTTPS) em toda a aplicação.
- Autenticação por OAuth (Google) — **não armazenamos senhas**.
- Acesso ao banco (Turso) protegido por token; tokens OAuth **nunca** são gravados em log.
- Autorização **server-side** em todas as mutações: o ator é derivado da sessão, nunca do cliente; guardas atômicas com filtro de `ownerId` (anti-TOCTOU).
- Consultas SQL parametrizadas (tagged templates) — sem superfície de injeção.
- Webhook de pagamento validado por token e protegido por lock atômico idempotente.
- Cron protegido por `CRON_SECRET` com comparação timing-safe.
