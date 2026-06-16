import React from "react";
import { Helmet } from "vtex.render-runtime";

const faqSchema = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "Onde posso encontrar produtos da Guess no Brasil?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Você pode encontrar a loja mais próxima de você através deste link: https://www.guessbrasil.com.br/onde-encontrar"
      }
    },
    {
      "@type": "Question",
      "name": "Como posso entrar em contato com a Guess Brasil?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Envie um email para sac@guessbrasil.com.br que iremos te responder com prioridade."
      }
    }
  ]
});

export const FaqJsonLd = () => {
  return (
    <Helmet>
      <script type="application/ld+json">{faqSchema}</script>
    </Helmet>
  );
};