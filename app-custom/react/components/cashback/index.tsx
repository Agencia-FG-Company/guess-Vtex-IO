import React from "react";
import { useProduct } from "vtex.product-context";
/* importa o css do mesmo diretório */
import "./styles.css";

export const ProductCashbackDisplay: React.FC = () => {
  const product = useProduct();

  // Pega o preço de venda do produto
  const sellingPrice =
    product?.selectedItem?.sellers[0].commertialOffer.Price;

  // Calcula 30% do preço de venda
  const cashbackAmount = sellingPrice ? sellingPrice * 0.3 : 0;

  // Formata o valor de cashback em reais
  const cashbackFormatted = cashbackAmount.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });

  return (
    <div className="vtex-rich-text-0-x-container vtex-rich-text-0-x-container--cashback__pdp flex tl items-center justify-start t-body c-on-base">
      <div className="vtex-rich-text-0-x-wrapper vtex-rich-text-0-x-wrapper--cashback__pdp flex items-center">

        <p className="lh-copy vtex-rich-text-0-x-paragraph vtex-rich-text-0-x-paragraph--cashback__pdp flex items-center">
          Compre e acumule bônus de{" "}

          <span className="b vtex-rich-text-0-x-strong vtex-rich-text-0-x-strong--cashback__pdp">
            {cashbackFormatted}
          </span>

          {/* Ícone de informação */}
          <span className="cashback-info-wrapper">

            {/* círculo com "i" */}
            <span className="cashback-info-icon">i</span>

            {/* tooltip exibido no hover */}
            <span className="cashback-tooltip">
              Bônus disponibilizado em 5 dias úteis após a entrega
            </span>

          </span>
        </p>

      </div>
    </div>
  );
};
