import React from "react";
import { Helmet } from "vtex.render-runtime";

const tableMasculineSchema = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "O que é a tabela de medidas masculina da Guess Brasil?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "A tabela de medidas masculinas é a ferramenta que transforma a experiência de compra em algo mais intuitivo e seguro. Como a Guess Brasil apresenta diferentes modelagens e propostas de estilo, entender como interpretar essas informações faz toda a diferença para garantir o tamanho certo e evitar trocas desnecessárias."
      }
    },
    {
      "@type": "Question",
      "name": "Como ler a tabela de medidas masculinas da Guess Brasil?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Cada marca utiliza um padrão próprio, indicando largura de tórax, ombros, cintura, comprimento e outros pontos essenciais. O segredo é comparar as medidas do corpo com as especificações apresentadas e verificar se há variações de modelagem, como jeans skinny, slim straight, slim tapered e jogger."
      }
    },
    {
      "@type": "Question",
      "name": "Como saber meu tamanho de roupa masculina na Guess Brasil?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "A recomendação é analisar a tabela considerando a estrutura física individual e a proposta do look. O ideal é escolher o tamanho das roupas considerando o uso que você pretende dar à peça: mais justa, mais ampla ou intermediária. A Guess Brasil oferece uma tabela específica para suas peças, permitindo uma avaliação precisa antes da compra."
      }
    },
    {
      "@type": "Question",
      "name": "Como tirar as medidas do corpo corretamente para roupas masculinas?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Utilize uma fita métrica e mantenha o corpo relaxado. Meça o tórax na parte mais alta do peito, a cintura na região mais estreita e o quadril no ponto mais largo. Caso esteja avaliando camisas, meça também a linha dos ombros e o comprimento da manga."
      }
    },
    {
      "@type": "Question",
      "name": "Quais são as modelagens de jeans masculino disponíveis na Guess Brasil?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "A Guess Brasil oferece quatro modelagens de jeans masculino: Skinny, Slim Straight, Slim Tapered e Jogger. Cada modelagem tem um caimento diferente — a skinny é mais ajustada ao corpo, enquanto a jogger tem proposta comfy e fica mais larga."
      }
    },
    {
      "@type": "Question",
      "name": "Posso trocar se a roupa masculina Guess não servir?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Sim. Você tem até 30 dias corridos após o recebimento para solicitar troca por outro tamanho. O produto deve estar sem uso, com etiquetas originais e na embalagem original. Inicie a solicitação diretamente em 'Meus Pedidos' na sua conta."
      }
    }
  ]
});

export const TableMasculineJsonLd = () => {
  return (
    <Helmet>
      <script type="application/ld+json">{tableMasculineSchema}</script>
    </Helmet>
  );
};