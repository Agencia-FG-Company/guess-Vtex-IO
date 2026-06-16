import React from "react";
import { Helmet } from "vtex.render-runtime";

const tableFeminineSchema = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "O que é a tabela de medidas femininas da Guess Brasil?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "A tabela de medidas femininas é um guia essencial para quem busca peças que valorizam a silhueta com precisão e estilo. Na Guess Brasil, cada criação carrega um olhar refinado para o caimento, e entender esse guia é o primeiro passo para garantir que cada peça traduza sua personalidade com segurança e sofisticação natural."
      }
    },
    {
      "@type": "Question",
      "name": "Quais medidas são necessárias para encontrar o tamanho certo nas roupas femininas Guess?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "O busto, o quadril e a circunferência da cintura formam o trio fundamental para garantir que o tamanho das roupas reflita exatamente o que você espera ao vestir uma peça Guess. Essas medidas servem como referência para interpretar o caimento e direcionar a seleção do seu próximo look."
      }
    },
    {
      "@type": "Question",
      "name": "Como tirar as medidas do busto, quadril e cintura corretamente?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Utilize uma fita métrica posicionada de maneira alinhada ao corpo, mantendo-se relaxada e em postura natural. No busto, envolva a região mais volumosa. No quadril, passe a fita pela área mais larga e, na cintura, marque o ponto mais estreito."
      }
    },
    {
      "@type": "Question",
      "name": "Como encontrar o tamanho ideal nas roupas femininas Guess?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Com todas as medidas anotadas, basta comparar seus números com a tabela Guess para identificar o tamanho ideal. Se estiver entre dois tamanhos, opte pelo que mais se aproxima da proposta da coleção que deseja comprar. Algumas linhas prezam pela estrutura marcada, enquanto outras valorizam maior fluidez visual."
      }
    },
    {
      "@type": "Question",
      "name": "Quais são as modelagens de jeans feminino disponíveis na Guess Brasil?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "A Guess Brasil oferece diversas modelagens de jeans feminino, incluindo 1981 Skinny, Curvy Skinny, Mid Rise Skinny, Straight Leg, High Flare, Marilyn Zip, Tomboy, Jegging e Mom. Cada modelagem tem um caimento diferente, por isso é importante consultar a tabela de medidas antes de escolher."
      }
    },
    {
      "@type": "Question",
      "name": "Posso trocar se a roupa feminina Guess não servir?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Sim. Você tem até 30 dias corridos após o recebimento para solicitar troca por outro tamanho, desde que o produto esteja sem uso e com todas as etiquetas originais. Acesse 'Meus Pedidos' na sua conta para iniciar a solicitação."
      }
    }
  ]
});

export const TableFeminineJsonLd = () => {
  return (
    <Helmet>
      <script type="application/ld+json">{tableFeminineSchema}</script>
    </Helmet>
  );
};