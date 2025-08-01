import React, { useState, useEffect } from "react";
import type { ProductTypes } from "vtex.product-context";
import { useProduct } from "vtex.product-context";
import { useQuery } from "react-apollo";
import { useCssHandles } from "vtex.css-handles";
import { useOrderItems } from "vtex.order-items/OrderItems";
import productRecommendationsQuery from "../../queries/productRecommendations.gql";

export const HANDLES_VARIANTS = [
  "similar__products-variants--fastBuy",
  "similar__products-variants--title",
  "similar__products-variants-wrapper",
  "variant-type",
  "similar__products-variants--wrap",
  "similar__products-variants--sku",
  "similar__products-variants--error",
  "similar__products-variants--sku-selected",
  "similar__products-variants--sku-unavailable",
  "similar__products-variants--sku-title",
  "similar__products-variants--img-current",
  "similar__products-addtocart",
  "similar__products-variants--circle",
  "similar__products-variants--circle-unavailable",
  "similar__products-variants--link",
  "similar__image-container",
  "similar__image-container-active",
  "similar__image-container-unavailable",
  "similar__modal-addToCart",
  "similar__modal-addToCart-fadeIn",
  "similar__modal-addToCart-fadeOut",
  "similar__modal-addToCart--content",
  "similar__modal-addToCart--label",
] as const;

interface SkuSpecification {
  field: {
    id: number;
    isActive: boolean;
    name: string;
    position: number;
    type: string;
  };
  values: {
    id: string;
    name: string;
    position: number;
  }[];
}

interface SKUVariation {
  variations: Variation[];
}

interface Variation {
  name: string;
  values: string[];
  __typename: string;
}

interface Item {
  itemId: string;
  name: string;
  skus: any[];
  variations?: Variation[];
  __typename: string;
}

interface SimilarProductsVariantsProps {
  productQuery: {
    product: {
      productId: string;
      skuSpecifications?: SkuSpecification[];
      sku?: SKUVariation;
      items?: Item[];
    };
  };
  imageLabel?: string;
}

export function SkuFromShelf({ productQuery }: SimilarProductsVariantsProps) {
  const { handles } = useCssHandles(HANDLES_VARIANTS);
  const product = useProduct();
  const { addItem } = useOrderItems();
  const [isModalVisible, setIsModalVisible] = useState(false);

  const productId =
    productQuery?.product?.productId ?? product?.product?.productId;

  // const currentSize =
  //   productQuery.product.skuSpecifications?.[0]?.values[0].name;

  const currentColorCode = productQuery.product?.items?.[0]?.variations?.[2]?.values?.[0];

  const currentColor = productQuery.product?.items?.[0]?.variations?.[1]?.values[0];

  // const currentColorCode =
  //   productQuery.product.skuSpecifications?.[2]?.values[0].name;

  const [selectedSize, setSelectedSize] = useState();
  const [selectedColor, setSelectedColor] = useState(currentColor);
  const [addToCartSku, setAddToCartSku] = useState("");
  const [infoerror, setInfoerror] = useState(false);

  const fetchSkusByColor = async (colorProductId: string) => {
    try {
      const response = await fetch(
        `/api/catalog_system/pub/products/variations/${colorProductId}`
      );
      const data = await response.json();
      if (Array.isArray(data.skus)) {
        return data.skus;
      }
    } catch (error) {
      console.error("Erro ao buscar SKUs:", error);
      return [];
    }
  };

  const [skusTamanho, setSkusTamanho] = useState<ProductTypes.Item[]>([]);

  useEffect(() => {
    const loadInitialSkus = async () => {
      const initialSkus = await fetchSkusByColor(
        productQuery.product.productId
      );
      setSkusTamanho(initialSkus);
    };
    loadInitialSkus();
  }, [productQuery.product.productId]);

  const { data, loading, error } = useQuery(productRecommendationsQuery, {
    variables: {
      identifier: { field: "id", value: productId },
      type: "similars",
    },
    skip: !productId,
  });

  if (loading || error) return null;

  const { productRecommendations } = data;
  const products = productRecommendations || [];
  const unique = [
    ...new Set<string>(
      products.map((item: ProductTypes.Product) => item.productId)
    ),
  ];

  const items: ProductTypes.Product[] = unique
    .map((id) =>
      products.find((element: ProductTypes.Product) => element.productId === id)
    )
    .filter(Boolean) as ProductTypes.Product[];

  const handleColorClick = async (colorProductId: string) => {
    const newSkus = await fetchSkusByColor(colorProductId);
    setSkusTamanho(newSkus);
    const allUnavailable = newSkus.every((sku: any) => !sku.available);
    if (allUnavailable) {
      document
        .querySelectorAll(`[data-color-id="${colorProductId}"]`)
        .forEach((element) => {
          element.classList.add(
            handles["similar__products-variants--circle-unavailable"]
          );
        });
    } else {
      document
        .querySelectorAll(`[data-color-id="${colorProductId}"]`)
        .forEach((element) => {
          element.classList.remove(
            handles["similar__products-variants--circle-unavailable"]
          );
        });
    }
    setSkusTamanho(newSkus);
    return newSkus;
  };

  const handleAddToCart = (skuId: string) => {
    const itemToAdd = {
      id: skuId,
      quantity: 1,
      seller: "1",
    };
    addItem([itemToAdd]);
    setIsModalVisible(true);
    setTimeout(() => {
      setIsModalVisible(false);
    }, 1000);
  };

  return (
    <>
      <div className={handles["similar__products-variants--fastBuy"]}>
        <p className={handles["similar__products-variants--title"]}>
          Selecione uma cor:{" "}
          <span className={handles["variant-type"]}>{selectedColor}</span>
        </p>
        <div
          style={{ display: "flex" }}
          className={handles["similar__products-variants--wrap"]}
        >
          <div
            className={`${handles["similar__image-container"]} ${handles["similar__image-container-active"]}`}
          >
            <span
              className={handles["similar__products-variants--circle"]}
              style={{
                height: "25px",
                width: "25px",
                backgroundColor: currentColorCode,
                display: "block",
              }}
              onClick={(e) => {
                // Remove 'active' class from all parents
                document
                  .querySelectorAll(`.${handles["similar__image-container"]}`)
                  .forEach((container) => {
                    container.classList.remove(
                      `${handles["similar__image-container-active"]}`
                    );
                  });
                // Add 'active' class to the parent of the clicked circle
                const parentContainer = e.currentTarget
                  .parentNode as HTMLElement; // Cast to HTMLElement
                parentContainer.classList.add(
                  `${handles["similar__image-container-active"]}`
                );

                handleColorClick(productQuery.product.productId);
                setSelectedColor(
                  productQuery.product.skuSpecifications?.[1]?.values[0].name
                );
              }}
            ></span>
          </div>
          {items.map((element: ProductTypes.Product, index: number) => {
            const bgColor =
              element?.items?.[0].variations?.[2]?.values?.[0] || "N/A";
            // const available =
            //   element?.items?.[0]?.sellers?.[0]?.commertialOffer
            //     ?.AvailableQuantity > 0;

            return (
              <div
                key={index}
                className={`${handles["similar__image-container"]}`}
              >
                <span
                  className={`${handles["similar__products-variants--circle"]}`}
                  style={{
                    height: "25px",
                    width: "25px",
                    backgroundColor: bgColor,
                    display: "block",
                  }}
                  data-color-id={element.productId}
                  onClick={(e) => {
                    // Remove 'active' class from all parents
                    document
                      .querySelectorAll(
                        `.${handles["similar__image-container"]}`
                      )
                      .forEach((container) => {
                        container.classList.remove(
                          `${handles["similar__image-container-active"]}`
                        );
                      });
                    // Add 'active' class to the parent of the clicked circle
                    const parentContainer = e.currentTarget
                      .parentNode as HTMLElement; // Cast to HTMLElement
                    parentContainer.classList.add(
                      `${handles["similar__image-container-active"]}`
                    );

                    handleColorClick(element.productId);
                    setSelectedColor(
                      element?.items?.[0].variations?.[1]?.values?.[0]
                    );
                  }}
                ></span>
              </div>
            );
          })}
        </div>
      </div>

      <div>
        {skusTamanho.length > 0 ? (
          <div>
            <p className={handles["similar__products-variants--sku-title"]}>
              Selecione um tamanho:{" "}
              {infoerror ? (
                <span className={handles["similar__products-variants--error"]}>
                  Selecione um tamanho
                </span>
              ) : (
                <span>{selectedSize}</span>
              )}
              <ul className={handles["similar__products-variants-wrapper"]}>
                {skusTamanho.map((sku: any, index: number) => (
                  <span
                    key={index}
                    className={`${
                      sku.available
                        ? handles["similar__products-variants--sku"]
                        : handles["similar__products-variants--sku-unavailable"]
                    } ${
                      selectedSize === sku.dimensions.Tamanho
                        ? handles["similar__products-variants--sku-selected"]
                        : ""
                    }`}
                    onClick={() => {
                      setAddToCartSku(sku.sku);
                      setSelectedSize(sku.dimensions.Tamanho);
                    }}
                  >
                    {sku.dimensions.Tamanho || `SKU ${index + 1}`}
                  </span>
                ))}
              </ul>
            </p>
            <button
              onClick={() => {
                if (!selectedSize) {
                  setInfoerror(true);
                } else {
                  setInfoerror(false);
                  handleAddToCart(addToCartSku);
                  //window.location.href = "/checkout#/cart";
                }
              }}
              className={handles["similar__products-addtocart"]}
            >
              Adicionar ao carrinho
            </button>
          </div>
        ) : (
          <span>Sem SKUs disponíveis</span>
        )}
      </div>
      {isModalVisible && (
        <div
          className={`${handles["similar__modal-addToCart"]} ${
            isModalVisible
              ? handles["similar__modal-addToCart-fadeIn"]
              : handles["similar__modal-addToCart-fadeOut"]
          }`}
        >
          <div className={handles["similar__modal-addToCart--content"]}>
            <p className={handles["similar__modal-addToCart--label"]}>
              Produto adicionado ao <u>carrinho!</u>
            </p>
          </div>
        </div>
      )}
    </>
  );
}

SkuFromShelf.schema = {
  title: "SimilarProducts Variants",
  description: "SimilarProducts Variants",
  type: "object",
  properties: {},
};
