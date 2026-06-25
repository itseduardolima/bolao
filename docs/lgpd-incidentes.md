# Plano de Resposta a Incidentes de Segurança

Procedimento para tratar incidentes de segurança envolvendo dados pessoais, conforme os arts. 48 e 50 da LGPD. Documento **interno** do controlador.

> Última revisão: 25 de junho de 2026.

## O que é um incidente

Qualquer evento que comprometa a confidencialidade, integridade ou disponibilidade de dados pessoais — por exemplo: acesso não autorizado ao banco, vazamento de tokens/credenciais, exposição indevida de dados de usuários, ou comprometimento de um operador (Google, Vercel, Turso, Asaas).

## Responsável

O **encarregado (DPO)** (ver [lgpd-encarregado.md](./lgpd-encarregado.md)) coordena a resposta. Contato: eduardolima2417@gmail.com.

## Fluxo de resposta

### 1. Detecção e registro
- Origem: monitoramento, logs, alerta de um operador, ou relato de usuário.
- Registrar imediatamente no histórico (§ "Registro de incidentes") com data/hora da ciência.

### 2. Contenção
- Revogar credenciais comprometidas (`AUTH_SECRET`, `DATABASE_AUTH_TOKEN`, `ASAAS_API_KEY`, `CRON_SECRET`, segredos OAuth).
- Encerrar sessões ativas se necessário (rotacionar `AUTH_SECRET` invalida os JWTs).
- Isolar/desativar o vetor (rota, integração ou deploy afetado).

### 3. Avaliação de risco
- Quais dados foram afetados e de quantos titulares.
- Probabilidade de dano relevante aos titulares.
- Causa raiz.

### 4. Notificação à ANPD e aos titulares
- Se houver **risco ou dano relevante** aos titulares, comunicar à **ANPD** e aos **titulares afetados** em prazo razoável — observar o prazo de **3 dias úteis** a partir da ciência, conforme regulamentação vigente da ANPD (confirmar o prazo na norma em vigor no momento do incidente).
- A comunicação deve conter, no mínimo (art. 48, §1º): a descrição dos dados afetados, os titulares envolvidos, as medidas técnicas de proteção, os riscos e as medidas tomadas para reverter/mitigar.
- Canal ANPD: formulário oficial em gov.br/anpd.

### 5. Remediação e lições aprendidas
- Corrigir a causa raiz; aplicar mitigação permanente.
- Revisar [ROPA](./lgpd-ropa.md) e medidas de segurança se necessário.

## Registro de incidentes

| Data ciência | Descrição | Dados/titulares afetados | Ações | ANPD/titulares notificados | Status |
|--------------|-----------|--------------------------|-------|----------------------------|--------|
| — | (nenhum incidente registrado) | — | — | — | — |

## Contatos dos operadores (suporte/segurança)

- **Google Cloud / OAuth:** console de suporte do Google Cloud.
- **Vercel:** suporte via dashboard Vercel.
- **Turso:** suporte via dashboard Turso.
- **Asaas:** suporte/segurança no painel Asaas.
