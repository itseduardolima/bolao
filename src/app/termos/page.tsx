import type { Metadata } from 'next'
import Link from 'next/link'
import LegalPage from '@/components/legal/LegalPage'

export const metadata: Metadata = {
  title: 'Termos de Uso · Bolão Copa 2026',
  description:
    'Termos e condições de uso do Bolão Copa do Mundo 2026: cadastro, palpites, pontuação, ligas e pagamento.',
}

const CONTATO = 'eduardolima2417@gmail.com'

export default function TermosPage() {
  return (
    <LegalPage
      eyebrow="Termos"
      title="Termos de Uso"
      updatedAt="25 de junho de 2026"
      intro="Ao acessar e usar o Bolão Copa do Mundo 2026, você concorda com estes Termos de Uso. Leia com atenção."
    >
      <section>
        <h2>1. Aceitação</h2>
        <p>
          Estes Termos regem o uso do Bolão Copa do Mundo 2026 (&quot;Bolão&quot;, &quot;plataforma&quot;).
          Ao criar uma conta ou utilizar a plataforma, você declara que leu, entendeu e concorda com estes
          Termos e com a{' '}
          <Link href="/privacidade">Política de Privacidade</Link>.
        </p>
      </section>

      <section>
        <h2>2. O que é o Bolão</h2>
        <p>
          O Bolão é uma competição de palpites entre amigos para a Copa do Mundo de 2026,
          <strong> sem apostas e sem prêmios em dinheiro</strong>. Os participantes enviam palpites de
          placar para cada jogo e disputam um ranking de pontuação por mérito esportivo.
        </p>
      </section>

      <section>
        <h2>3. Cadastro e conta</h2>
        <ul>
          <li>O acesso é feito por login com conta Google.</li>
          <li>
            No primeiro acesso você escolhe um <strong>apelido único</strong>, que será público no ranking
            e nas ligas e não pode ser alterado posteriormente.
          </li>
          <li>
            Você é responsável por escolher um apelido que não seja ofensivo, que não viole direitos de
            terceiros nem se passe por outra pessoa.
          </li>
          <li>Você é responsável pela atividade realizada na sua conta.</li>
        </ul>
      </section>

      <section>
        <h2>4. Palpites e pontuação</h2>
        <p>
          Cada jogo aceita um palpite de placar, que pode ser editado quantas vezes quiser até o início da
          partida; depois disso o palpite é travado automaticamente. A pontuação segue as regras descritas
          na página de <Link href="/pontuacao">pontuação</Link> e vale igualmente no ranking geral e em
          todas as suas ligas.
        </p>
      </section>

      <section>
        <h2>5. Ligas e pagamento</h2>
        <ul>
          <li>
            Qualquer participante pode entrar gratuitamente em ligas por meio de um link de convite.
          </li>
          <li>
            A <strong>criação</strong> de uma liga exige um pagamento único via PIX, processado pela Asaas.
            O valor é informado no momento da criação.
          </li>
          <li>
            A liga é criada automaticamente após a confirmação do pagamento. Caso o pagamento seja
            confirmado mas a liga não seja criada por falha técnica, entre em contato pelo e-mail abaixo
            para regularização.
          </li>
          <li>
            Conforme o art. 49 do Código de Defesa do Consumidor, você pode solicitar o cancelamento e o
            reembolso da criação da liga em até 7 (sete) dias a partir do pagamento.
          </li>
        </ul>
      </section>

      <section>
        <h2>6. Conduta do usuário</h2>
        <p>Ao usar a plataforma, você concorda em não:</p>
        <ul>
          <li>usar apelidos ou conteúdo ofensivo, discriminatório ou ilegal;</li>
          <li>tentar burlar regras, manipular pontuações ou explorar falhas;</li>
          <li>acessar áreas ou dados de outros usuários sem autorização;</li>
          <li>usar a plataforma para qualquer finalidade ilícita.</li>
        </ul>
      </section>

      <section>
        <h2>7. Dados dos jogos e propriedade intelectual</h2>
        <p>
          Os dados de jogos, horários e placares são fornecidos por terceiros (football-data.org) e podem
          conter atrasos ou imprecisões. A marca, o layout e o código da plataforma pertencem ao Bolão e
          não podem ser copiados sem autorização.
        </p>
      </section>

      <section>
        <h2>8. Isenção de responsabilidade</h2>
        <p>
          A plataforma é oferecida &quot;no estado em que se encontra&quot;, para fins recreativos. Não
          garantimos disponibilidade ininterrupta nem a exatidão dos dados de jogos em tempo real, e não
          nos responsabilizamos por eventuais indisponibilidades de serviços de terceiros (Google, Asaas,
          provedores de dados e hospedagem).
        </p>
      </section>

      <section>
        <h2>9. Encerramento de conta</h2>
        <p>
          Você pode encerrar sua conta a qualquer momento pela área de perfil. Podemos suspender ou
          encerrar contas que violem estes Termos. O encerramento implica a exclusão dos seus dados, nos
          termos da Política de Privacidade.
        </p>
      </section>

      <section>
        <h2>10. Alterações nos Termos</h2>
        <p>
          Podemos atualizar estes Termos periodicamente. A data de &quot;última atualização&quot; indica a
          versão vigente; o uso continuado após mudanças significa concordância com a nova versão.
        </p>
      </section>

      <section>
        <h2>11. Lei aplicável e contato</h2>
        <p>
          Estes Termos são regidos pelas leis da República Federativa do Brasil. Dúvidas e solicitações
          podem ser encaminhadas para <a href={`mailto:${CONTATO}`}>{CONTATO}</a>.
        </p>
      </section>
    </LegalPage>
  )
}
