import type { Metadata } from 'next'
import LegalPage from '@/components/legal/LegalPage'

export const metadata: Metadata = {
  title: 'Política de Privacidade · Bolão Copa 2026',
  description:
    'Como o Bolão Copa 2026 coleta, usa, compartilha e protege seus dados pessoais, em conformidade com a LGPD.',
}

const CONTATO = 'eduardolima2417@gmail.com'

export default function PrivacidadePage() {
  return (
    <LegalPage
      eyebrow="Privacidade"
      title="Política de Privacidade"
      updatedAt="25 de junho de 2026"
      intro="Esta política explica como tratamos seus dados pessoais no Bolão Copa do Mundo 2026, em conformidade com a Lei Geral de Proteção de Dados (Lei nº 13.709/2018 — LGPD)."
    >
      <section>
        <h2>1. Quem somos</h2>
        <p>
          O Bolão Copa do Mundo 2026 (&quot;Bolão&quot;, &quot;nós&quot;) é um site de bolão entre amigos,
          sem apostas e sem prêmios em dinheiro, onde cada participante envia palpites de placar e disputa
          um ranking de pontuação. Para fins da LGPD, atuamos como <strong>controlador</strong> dos dados
          pessoais tratados na plataforma.
        </p>
        <p>
          Dúvidas, solicitações ou exercício de direitos podem ser encaminhados ao nosso encarregado pelo
          tratamento de dados (DPO) pelo e-mail{' '}
          <a href={`mailto:${CONTATO}`}>{CONTATO}</a>.
        </p>
      </section>

      <section>
        <h2>2. Dados que coletamos</h2>
        <p>Coletamos apenas os dados necessários para o funcionamento do bolão:</p>
        <ul>
          <li>
            <strong>Dados de conta (via login Google):</strong> nome, endereço de e-mail e foto de perfil
            fornecidos pela sua conta Google ao autenticar.
          </li>
          <li>
            <strong>Apelido:</strong> o nome de exibição único que você escolhe no primeiro acesso. Ele é{' '}
            <strong>público</strong> — aparece no ranking geral e nas ligas.
          </li>
          <li>
            <strong>Palpites e pontuação:</strong> os placares que você envia para cada jogo e os pontos
            calculados a partir deles.
          </li>
          <li>
            <strong>Ligas (grupos):</strong> ligas que você cria ou das quais participa, e sua função em
            cada uma.
          </li>
          <li>
            <strong>Dados de autenticação:</strong> tokens de acesso da sua conta Google, usados apenas
            para manter sua sessão. Não temos acesso à sua senha do Google.
          </li>
          <li>
            <strong>Dados de pagamento (somente ao criar uma liga):</strong> o pagamento PIX é processado
            pela Asaas. Recebemos da Asaas apenas o identificador e o status da cobrança — não armazenamos
            dados do seu cartão ou conta bancária.
          </li>
          <li>
            <strong>Dados técnicos e de uso:</strong> dados anônimos ou pseudonimizados de acesso (páginas
            visitadas, dispositivo aproximado), coletados via Vercel Analytics para fins estatísticos.
          </li>
        </ul>
      </section>

      <section>
        <h2>3. Bases legais e finalidades</h2>
        <p>
          Tratamos seus dados com base nas seguintes hipóteses legais previstas no art. 7º da LGPD:
        </p>
        <ul>
          <li>
            <strong>Execução de serviço (art. 7º, V):</strong> autenticar você, registrar e exibir
            palpites, calcular pontuação, montar rankings e administrar ligas.
          </li>
          <li>
            <strong>Obrigação legal/regulatória (art. 7º, II):</strong> manter registros de transações de
            pagamento das ligas pelo prazo exigido por lei.
          </li>
          <li>
            <strong>Legítimo interesse (art. 7º, IX):</strong> prevenir abuso e fraude (limites de
            criação/entrada em ligas) e medir o uso da plataforma de forma agregada para melhorá-la.
          </li>
        </ul>
      </section>

      <section>
        <h2>4. Compartilhamento e operadores</h2>
        <p>
          Não vendemos seus dados. Compartilhamos dados apenas com prestadores que atuam como
          <strong> operadores</strong>, na medida necessária para operar o serviço:
        </p>
        <ul>
          <li>
            <strong>Google (Google Ireland/LLC):</strong> autenticação via login Google.
          </li>
          <li>
            <strong>Vercel Inc.:</strong> hospedagem da aplicação e analytics de uso.
          </li>
          <li>
            <strong>Turso (libSQL):</strong> banco de dados onde seus dados ficam armazenados.
          </li>
          <li>
            <strong>Asaas:</strong> processamento das cobranças PIX para criação de ligas.
          </li>
        </ul>
        <p>
          Seu apelido, palpites e posição no ranking são visíveis a outros participantes do bolão e das
          ligas das quais você faz parte — essa é a natureza pública da competição.
        </p>
      </section>

      <section>
        <h2>5. Transferência internacional de dados</h2>
        <p>
          Alguns de nossos operadores (Google, Vercel, Turso) podem armazenar ou processar dados em
          servidores fora do Brasil. Nesses casos, a transferência ocorre nos termos do art. 33 da LGPD,
          com prestadores que adotam padrões de proteção adequados.
        </p>
      </section>

      <section>
        <h2>6. Cookies e tecnologias semelhantes</h2>
        <p>
          Utilizamos cookies estritamente necessários para manter você autenticado (sessão de login).
          Utilizamos também o Vercel Analytics para estatísticas de uso de forma agregada, sem criar
          perfis individuais de identificação. Você pode bloquear cookies nas configurações do seu
          navegador, mas isso pode impedir o login.
        </p>
      </section>

      <section>
        <h2>7. Retenção dos dados</h2>
        <p>
          Mantemos seus dados enquanto sua conta existir. Ao excluir sua conta, seus dados pessoais,
          palpites e participações em ligas são removidos. Registros de pagamento das ligas podem ser
          mantidos por prazo adicional para cumprimento de obrigações legais e fiscais.
        </p>
      </section>

      <section>
        <h2>8. Seus direitos</h2>
        <p>Nos termos do art. 18 da LGPD, você pode, a qualquer momento:</p>
        <ul>
          <li>confirmar a existência de tratamento e acessar seus dados;</li>
          <li>corrigir dados incompletos, inexatos ou desatualizados;</li>
          <li>solicitar a eliminação dos seus dados e a exclusão da conta;</li>
          <li>solicitar a portabilidade dos seus dados;</li>
          <li>obter informações sobre com quem compartilhamos seus dados;</li>
          <li>revogar consentimento, quando aplicável.</li>
        </ul>
        <p>
          Para exercer esses direitos, escreva para{' '}
          <a href={`mailto:${CONTATO}`}>{CONTATO}</a>. A exclusão da conta também poderá ser feita
          diretamente pela área de perfil.
        </p>
      </section>

      <section>
        <h2>9. Segurança</h2>
        <p>
          Adotamos medidas técnicas e administrativas para proteger seus dados, como acesso restrito ao
          banco de dados, comunicação criptografada (HTTPS) e validação de autorização em todas as
          operações sensíveis. Nenhum sistema é totalmente imune a incidentes; caso ocorra um incidente de
          segurança relevante, comunicaremos os titulares e a ANPD conforme a legislação.
        </p>
      </section>

      <section>
        <h2>10. Crianças e adolescentes</h2>
        <p>
          O Bolão não é direcionado a menores de 18 anos. Não coletamos intencionalmente dados de menores
          sem o consentimento dos responsáveis legais.
        </p>
      </section>

      <section>
        <h2>11. Alterações nesta política</h2>
        <p>
          Podemos atualizar esta Política de Privacidade periodicamente. A data de &quot;última
          atualização&quot; no topo indica a versão vigente. Mudanças relevantes serão comunicadas na
          plataforma.
        </p>
      </section>

      <section>
        <h2>12. Encarregado e contato</h2>
        <p>
          Para qualquer questão relacionada a privacidade e proteção de dados, entre em contato com nosso
          encarregado (DPO) pelo e-mail <a href={`mailto:${CONTATO}`}>{CONTATO}</a>.
        </p>
      </section>
    </LegalPage>
  )
}
