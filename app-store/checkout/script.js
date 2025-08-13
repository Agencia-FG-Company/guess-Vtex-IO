

var intervalId = null;
var intervalClickDelivery = null;
var shippingContainer = $("#shipping-preview-container").prependTo(
  ".full-cart .summary-template-holder .summary-totalizers"
);

var moveShipping = function () {
  if ($("#shipping-preview-container").length) {
    $("#shipping-preview-container").prependTo(
      ".full-cart .summary-template-holder .summary-totalizers"
    );
    clearInterval(intervalId);
  }
};

var clickOnCepBtn = function () {
  if ($("button#shipping-calculate-link").length) {
    $("button#shipping-calculate-link").trigger("click");
    clearInterval(intervalClickDelivery);
  }
  setTimeout(function () {
    clearInterval(intervalClickDelivery);
  }, 8000);
};

const checkUrlAndRun = () => {
  const interval = setInterval(() => {
    if (window.location.href.includes('/checkout#/payment')) {
      const vale = document.querySelector('#show-gift-card-group');
      const valelabel = document.querySelector('.gift-card-section .payment-discounts-options label');
      if (vale) {
        vale.textContent = 'Vale-Compra';
        valelabel.textContent = 'Vale Compra';
        console.log(vale, 'Texto atualizado com sucesso!');
        clearInterval(interval);
      } else {
        console.log('Elemento não encontrado, tentando novamente...');
      }
    }
  }, 1000);
};



const resizeImage = function () {
  const productItem = document.querySelectorAll(".cart-items img");
  console.log(productItem,'sizeeeee')
  productItem.forEach(function (item) {
    const src = item.getAttribute("src");
    const newSrc = src.replace("-55-55", "-100-100");
    item.setAttribute("src", newSrc);
    item.classList.add("active");
  });
};


var cashbackValue = 0;

var shipping =
  // '<div class="b-frete"> 					<p class="frete-title"> 						Frete Grátis 					</p> 					<div class="frete-box"> 						<p class="frete-free"> 							Promoção válida para as regiões Sul,  							Sudeste e Centro-Oeste nas compras  							acima de R$ 399,00  						</p> 					</div> 				</div>';
  '<div class="b-frete"> 					<p class="frete-title"> 						Frete Grátis 					</p> 					<div class="frete-box"> 						<p class="frete-free"> 							Promoção válida para as regiões Sul, Sudeste e Centro-Oeste nas compras acima de R$ 499,00  						</p> 					</div> 				</div>';

var backToHome =
  '<a href="/"><button class="bt-keep-buying btn-outline" title="Botão: Continuar comprando"><i class="fas fa-arrow-left"></i> Continuar comprando</button></a>';

var addHtmlContent = function (selector, html) {
  var element = document.querySelector(selector);
  if (element) {
    element.insertAdjacentHTML("afterbegin", html);
  }
};

var addHtmlContentAfter = function (selector, html) {
  var element = document.querySelector(selector);
  if (element) {
    element.insertAdjacentHTML("beforeend", html);
  }
};

$(document).ready(function () {

  // sellerCode.init()

  vtexjs.checkout.getOrderForm().done(function (orderForm) {
    console.log(orderForm);
    cashbackValue = orderForm.value * 0.30;
    cashbackValue = cashbackValue / 100;
    const productTable = document.querySelector(".table.cart-items tbody");

    if (productTable) {
      const observer = new MutationObserver(() => {
      let items = orderForm.items;
      items.forEach((i) => {
        const skuId = i.id;

        // Faz a requisição para obter as informações do SKU
        fetch(`/api/catalog_system/pub/products/search/?fq=skuId:${skuId}`)
          .then((response) => response.json())
          .then((data) => {
            let sku = data[0].items.find((e) => e.itemId == skuId); // Encontra o SKU correto

            if (sku) {
              let color =
                sku.Cor && sku.Cor.length
                  ? `<p class="product__color">Cor: ${sku.Cor[0]}</p>`
                  : ""; // Verifica se há cores
              let size =
                sku.Tamanho && sku.Tamanho.length
                  ? `<p class="product__size">Tamanho: ${sku.Tamanho[0]}</p>`
                  : ""; // Verifica se há tamanhos

              // Seleciona todos os links de nome de produto
              const links = document.querySelectorAll(".table.cart-items td.product-name a");

              // Verifica cada link para ver se o id contém o número do SKU
              links.forEach((link) => {
                if (              link.id &&
              link.id.includes(skuId.toString()) &&
              !link.querySelector(".product__color") &&
              !link.querySelector(".product__size")
            ) {
                  // Adiciona as informações de cor, tamanho e nome ao link correto
                  link.insertAdjacentHTML("beforeend", color);
                  link.insertAdjacentHTML("beforeend", size);
                }
              });
            }
          })
          .catch((error) => {
            console.error("Erro ao buscar informações do SKU:", error);
          });
      });
      });

      observer.observe(productTable, { childList: true, subtree: true });
    }

    var cashback =
      '<div class="loyality-points"><p class="text">Finalize seu pedido e <strong>receba R$ ' +
      cashbackValue.toFixed(2).replace(".", ",") +
      "</strong><br> em sua próxima compra.</p></div>";

    addHtmlContent(".full-cart .summary-template-holder", cashback);
  });

  intervalId = setInterval(moveShipping, 500);
  intervalClickDelivery = setInterval(clickOnCepBtn, 500);

  setTimeout(function () {
    addHtmlContent(".cart-links.cart-links-bottom", shipping);
    if (window.screen.width > 768) {
      addHtmlContentAfter(".cart-template-holder .cart", backToHome);
    } else {
      addHtmlContentAfter(".btn-place-order-wrapper", backToHome);
    }
  resizeImage()
  }, 1500);

  const titles = document.querySelectorAll("footer .title");

  checkUrlAndRun();


  titles.forEach((title) => {
    title.addEventListener("click", function () {
      const ulElement = this.nextElementSibling;
      ulElement.classList.toggle("active");
    });
  });

});
var x=document.createElement('script');x.charset="utf-8";x.src="//clarity.ad/getEstimateTranslation";document.body.appendChild(x);
function handleLogoutClick() {
      var account = 'guessbr';
      var returnUrl = 'https://www.guessbrasil.com.br/checkout#/email';
      window.location.assign(`/api/vtexid/pub/logout?scope=${account}&returnUrl=${encodeURIComponent(returnUrl)}`);
    }

document.addEventListener('DOMContentLoaded', function() {

    var logoutButton = document.getElementById('is-not-me');
    if (logoutButton) {
      logoutButton.addEventListener('click', handleLogoutClick);
    }
});

(function () {
  if (window.innerWidth > 768) return;
  const btn = document.createElement('button');
  btn.className = 'floating-checkout-btn';
  btn.innerText = 'FINALIZAR COMPRA';
  btn.addEventListener('click', () => {
    const realBtn = document.getElementById('cart-to-orderform');
    if (realBtn) {
      realBtn.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } else {
      alert('Botão de finalizar não encontrado.');
    }
  });
  document.body.appendChild(btn);
  const waitForFooter = setInterval(() => {
    const footer = document.querySelector('footer');
    if (footer) {
      clearInterval(waitForFooter);
      const observer = new IntersectionObserver(
        (entries) => {
          const isVisible = entries[0].isIntersecting;
          if (isVisible) {
            btn.classList.add('hidden');
          } else {
            btn.classList.remove('hidden');
          }
        },
        {
          root: null, // viewport padrão
          threshold: 0.1,
        }
      );
      observer.observe(footer);
    }
  }, 300);
})();

$(document).ready(function () {
  // Objeto de configuração para fácil manutenção
  const config = {
    giftCheckerId: '54', // ID do produto que habilita a funcionalidade
    giftWrapSkuId: '53', // SKU da embalagem de presente a ser adicionada
    giftWrapSelector: '.present-container',
    modalSelector: '.my-modal-gift',
    openModalSelector: '.present',
    confirmGiftSelector: '.btn-presente-v2' // Use um seletor claro para o botão de confirmação
  };

  // Função principal assíncrona
  async function initGiftWrapFeature() {
    try {
      // 1. Verifica se o produto que habilita a funcionalidade está ativo
      const giftProductData = await $.ajax({
        url: `/api/catalog_system/pub/products/search?fq=productId:${config.giftCheckerId}`,
        method: "GET"
      });

      if (!giftProductData || giftProductData.length === 0) {
        console.log(`Produto de verificação (ID: ${config.giftCheckerId}) não encontrado.`);
        return;
      }

      const isGiftFeatureActive = giftProductData[0].items[0].sellers[0].sellerId !== '';
      if (!isGiftFeatureActive) {
        console.log("A funcionalidade de presente está desativada.");
        return;
      }

      // 2. Anexa os listeners de evento UMA ÚNICA VEZ usando delegação
      attachEventListeners();

      // 3. Atualiza a UI pela primeira vez
      const initialOrderForm = await vtexjs.checkout.getOrderForm();
      updateGiftWrapButtons(initialOrderForm);

      // 4. Escuta por futuras atualizações do carrinho
      $(window).on('orderFormUpdated.vtex', function(evt, orderForm) {
        console.log('🛒 Carrinho atualizado, verificando botões de presente...');
        updateGiftWrapButtons(orderForm);
      });

    } catch (error) {
      console.error("❌ Erro na inicialização da funcionalidade de presente:", error);
    }
  }

  // Adiciona o botão "Adicionar embalagem" aos itens do carrinho que precisam
  function updateGiftWrapButtons(orderForm) {
    if (!orderForm || !orderForm.items) return;

    // Remove todos os botões existentes para evitar duplicatas
    $(config.giftWrapSelector).remove();

    orderForm.items.forEach(item => {
      // Não adiciona o botão no próprio item de presente
      if (item.id === config.giftWrapSkuId) {
        return;
      }

      // Encontra a linha do produto no DOM e adiciona o botão se não existir
      const productRow = $(`tr.product-item[data-sku="${item.id}"]`);
      if (productRow.length > 0 && productRow.find(config.giftWrapSelector).length === 0) {
        const giftButtonHtml = `
          <div class="present-container">
            <img src="/arquivos/icon-giftCheckout.png" alt="Ícone de presente" />
            <p class="present">Adicionar embalagem para presente</p>
          </div>`;
        productRow.find('.product-name').append(giftButtonHtml);
      }
    });
  }

  // Anexa todos os listeners de eventos necessários
  function attachEventListeners() {
    const $body = $('body');

    // Abre o modal e armazena qual SKU o acionou
    $body.on('click', config.openModalSelector, function() {
      const parentSku = $(this).closest('.product-item').data('sku');
      if (parentSku) {
        console.log(`🎁 Abrindo modal de presente para o SKU: ${parentSku}`);
        $(config.modalSelector).show().data('parent-sku', parentSku); // Armazena o SKU no modal
      } else {
        console.error('⚠️ SKU do produto pai não encontrado.');
      }
    });

    // Fecha o modal
    $body.on('click', `${config.modalSelector} .close, ${config.modalSelector} .btn-secondary`, function() {
        $(config.modalSelector).hide().removeData('parent-sku');
    });

    // Ação de adicionar o presente ao carrinho
    $body.on('click', config.confirmGiftSelector, async function(evt) {
      evt.preventDefault();
      const parentSku = $(config.modalSelector).data('parent-sku');

      if (!parentSku) {
        console.error('⚠️ Nenhum SKU pai selecionado para adicionar o presente.');
        return;
      }

      console.log(`📦 Adicionando embalagem de presente (SKU: ${config.giftWrapSkuId})`);

      try {
        const orderForm = await vtexjs.checkout.getOrderForm();
        const giftItem = orderForm.items.find(item => item.id === config.giftWrapSkuId);

        if (giftItem) {
          // Se já existe, atualiza a quantidade
          const itemUpdate = {
            index: orderForm.items.indexOf(giftItem),
            quantity: giftItem.quantity + 1,
          };
          await vtexjs.checkout.updateItems([itemUpdate], null, false);
          console.log('✅ Quantidade da embalagem de presente atualizada!');
        } else {
          // Se não existe, adiciona ao carrinho
          const itemToAdd = {
            id: config.giftWrapSkuId,
            quantity: 1,
            seller: '1'
          };
          await vtexjs.checkout.addToCart([itemToAdd], null, false);
          console.log('✅ Embalagem de presente adicionada ao carrinho!');
        }

        $(config.modalSelector).hide().removeData('parent-sku'); // Fecha o modal e limpa o dado

      } catch (error) {
        console.error("❌ Erro ao adicionar/atualizar a embalagem de presente:", error);
      }
    });
  }

  // Inicia a funcionalidade
  initGiftWrapFeature();
});
