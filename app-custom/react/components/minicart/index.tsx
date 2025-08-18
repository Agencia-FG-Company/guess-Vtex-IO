import React, { FC, useState, useEffect, useContext, useRef } from "react"
import { useOrderForm } from "vtex.order-manager/OrderForm"
import { useOrderItems } from "vtex.order-items/OrderItems"
import { useCssHandles, CssHandlesTypes } from "vtex.css-handles"
import { ToastContext, ToastContextType } from "vtex.styleguide"

interface CustomMinicartProps {
  openOnHover?: boolean
  maxDrawerWidth?: number | string
  MinicartIcon?: React.ComponentType
  quantityDisplay?: "always" | "not-empty" | "never"
  itemCountMode?: "distinct" | "total"
  customPixelEventId?: string
  classes?: CssHandlesTypes.CustomClasses<typeof CSS_HANDLES>
}

const CSS_HANDLES = [
  "minicartWrapper","minicartButton","minicartLink","cartItems","cartItem","cartTitle",
  "cartSegure","itemDetails","minicartNumber","minicartTotalizer","minicartTotalizerPrice","minicartContainer",
  "cartHeader","cartFooter","checkoutButton","cartButton","minicartButtons",
  "emptyCartMessage","minicart__product-img","minicart__product-name","minicart__product-un",
  "minicart__product-price","cartSummaryContainer","cartSummaryHeader","cartIcon",
  "cartSummaryContent","productLoyaltyPoints","pointsLabel","pointsValue","cutoffPointMsg",
  "creditLimitExceededMsg","creditSummary","creditSubtitle","creditAvailableAmount",
  "creditUsedAmount","creditSubtotalAmount","cartSummaryFooter","cartFooterIcon","cartSubtotal",
  "subtotalLabel","subtotalValue","goToCart","goToCheckout","empty","minicartCloseMobile",
  "minicartRemoveButton","minicartQuantityInput","minicartShowMore","minicartShowLess", "minicartPrice_precoDe", "minicartPriceGroup", "minicartPrice_discount","minicartOverlay",
] as const

const formatBRL = (v: number) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
  }).format((v || 0) / 100)


// helpers Tamanho/Cor
const getSpecValue = (item: any, keys: string[]) => {
  const norm = (s?: string) => s?.toLowerCase().trim()
  const specs = item?.skuSpecifications as Array<{ fieldName: string; fieldValues: string[] }> | undefined
  if (Array.isArray(specs)) {
    for (const k of keys) {
      const hit = specs.find(s => norm(s.fieldName) === norm(k))
      if (hit?.fieldValues?.length) return hit.fieldValues[0]
    }
  }
  const variationStr: string | undefined = item?.variation
  if (variationStr) {
    for (const k of keys) {
      const m = variationStr.match(new RegExp(`${k}\\s*:\\s*([^,]+)`, "i"))
      if (m?.[1]) return m[1].trim()
    }
  }
  const skuName: string | undefined = item?.skuName
  if (skuName) {
    for (const k of keys) {
      const m = skuName.match(new RegExp(`${k}\\s*:?\\s*([^–|-]+)`, "i"))
      if (m?.[1]) return m[1].trim()
    }
  }
  return undefined
}
const getSizeAndColor = (item: any) => ({
  size: getSpecValue(item, ["Tamanho", "Size"]),
  color: getSpecValue(item, ["Cor", "Color"]),
})

export const CustomMinicart: FC<CustomMinicartProps> = ({ quantityDisplay = "not-empty", classes }) => {
  const { handles } = useCssHandles(CSS_HANDLES, { classes })
  const { orderForm } = useOrderForm()
  const { removeItem, updateQuantity } = useOrderItems()
  const { showToast } = useContext(ToastContext) as ToastContextType

  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [initialItemsCount, setInitialItemsCount] = useState<number | null>(null)

  // ======== SCROLL por passo fixo em pixels ========
  const listRef = useRef<HTMLDivElement | null>(null)

  // defina exatamente quanto quer mover por clique:
  //const STEP_PX = 326.031 / 3 // “um item”; mude para o valor exato que quiser
  const STEP_PX = 106

  const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(v, max))

  const scrollByStep = (dir: 1 | -1) => {
    const cont = listRef.current
    if (!cont) return
    const maxTop = Math.max(0, cont.scrollHeight - cont.clientHeight)
    const target = clamp(cont.scrollTop + dir * STEP_PX, 0, maxTop)
    cont.scrollTo({ top: target, behavior: "smooth" })
  }
  // ==================================================

  // ainda usamos bottomIndex só para controlar “mostrar mais/anteriores”
  const [bottomIndex, setBottomIndex] = useState<number>(2)

  const items = orderForm?.items ?? []
  const totalItems = items.reduce((acc: number, it: any) => acc + it.quantity, 0)
  const totalPrice = items.reduce((acc: number, it: any) => acc + (it.sellingPrice ?? it.price) * it.quantity, 0)

  const openDrawer = () => setIsDrawerOpen(true)
  const closeDrawer = () => setIsDrawerOpen(false)

  const handleRemoveItem = async (item: any) => {
    try {
      if (!item?.id || !item?.seller) {
        showToast({ message: "Erro ao identificar item.", duration: 3000 })
        return
      }
      await removeItem({ id: item.id, seller: item.seller })
      showToast({ message: "Item removido com sucesso!", duration: 3000 })
    } catch (err) {
      console.error("Erro ao remover item:", err)
      showToast({ message: "Erro ao remover o item.", duration: 3000 })
    }
  }

  const handleUpdateQuantity = async (item: any, newQtyRaw: number) => {
    try {
      if (!item?.id || !item?.seller) {
        showToast({ message: "Erro ao identificar item.", duration: 3000 })
        return
      }
      const parsed = Number.isFinite(newQtyRaw) ? Math.floor(newQtyRaw) : item.quantity
      const newQty = Math.max(0, parsed)
      if (newQty === 0) {
        await removeItem({ id: item.id, seller: item.seller })
        showToast({ message: "Item removido!", duration: 2000 })
        return
      }
      await updateQuantity({ id: item.id, seller: item.seller, quantity: newQty })
      showToast({ message: "Quantidade atualizada!", duration: 2000 })
    } catch (err) {
      console.error("Erro ao atualizar quantidade:", err)
      showToast({ message: "Erro ao atualizar quantidade.", duration: 3000 })
    }
  }

  useEffect(() => {
    const chat = document.querySelector(".octadesk-octachat-app") as HTMLElement | null
    if (isDrawerOpen && chat) {
      chat.style.setProperty("z-index", "9", "important")
    } else if (chat) {
      chat.style.removeProperty("z-index")
    }
  }, [isDrawerOpen])

  // toast ao adicionar
  useEffect(() => {
    if (orderForm && orderForm.id !== "default-order-form") {
      if (initialItemsCount === null) {
        setInitialItemsCount(totalItems)
      } else if (totalItems > initialItemsCount || (initialItemsCount === 0 && totalItems === 1)) {
        showToast({
          message: "Produto adicionado ao carrinho!",
          duration: 3000,
          action: { label: "Ver carrinho", href: "/checkout#/cart" },
        })
        setTimeout(() => openDrawer(), 300)
        setInitialItemsCount(totalItems)
      }
    }
  }, [totalItems, initialItemsCount, orderForm, showToast])

  // reset janela/scroll ao abrir/atualizar
  useEffect(() => {
    setBottomIndex(Math.min(2, items.length - 1))
    if (listRef.current) listRef.current.scrollTop = 0
    /*
      if (isDrawerOpen) {
        document.body.style.overflow = "hidden"
      } else {
        document.body.style.overflow = ""
      }
      return () => {
        document.body.style.overflow = ""
      }
  */
  }, [items.length, isDrawerOpen])

  // botões ↑/↓ com passo fixo
  const handleShowMore = () => {
    if (bottomIndex >= items.length - 1) return
    setBottomIndex(Math.min(bottomIndex + 1, items.length - 1))
    scrollByStep(1)   // desce exatamente STEP_PX
  }

  const handleShowLess = () => {
    if (bottomIndex <= 2) return
    setBottomIndex(Math.max(2, bottomIndex - 1))
    scrollByStep(-1)  // sobe exatamente STEP_PX
  }

  return (
    <div className={handles.minicartWrapper}>
      <button className={handles.minicartButton} onClick={openDrawer}>
        {quantityDisplay !== "never" && <span className={handles.minicartNumber}>{totalItems}</span>}
      </button>

      {isDrawerOpen && (
        <div className={handles.minicartContainer}>
          <div className={handles.cartHeader}>
            <p className={handles.cartTitle}>Meu Carrinho</p>
            <button className={handles.minicartCloseMobile} onClick={closeDrawer} aria-label="Fechar minicart">+</button>
          </div>

          {items.length > 3 && bottomIndex > 2 && (
            <button
              type="button"
              className={handles.minicartShowLess}
              onClick={handleShowLess}
            >
              <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M0.5 1L6 6.5L11.5 1" stroke="black"/>
              </svg>

            </button>
          )}

          {totalItems > 0 ? (
            <>
              <div
                className={handles.cartItems}
                ref={listRef}
                style={{
                  overflowY: "hidden",     // sem scroll nativo
                  maxHeight: "326.031px",  // janela fixa
                  scrollBehavior: "smooth",
                }}
              >
                {items.map((item: any, index: number) => {
                  const current = item.sellingPrice ?? item.price
                  const list = item.listPrice ?? current
                  const hasDiscount = list > current
                  const pct = hasDiscount ? Math.round(((list - current) / list) * 100) : 0
                  const { size, color } = getSizeAndColor(item)

                  return (
                    <div key={index} className={handles.cartItem} style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <img className={handles["minicart__product-img"]} src={item.imageUrls.at1x} alt={item.name} />

                      <div className={handles.itemDetails} style={{ display: "flex", flexDirection: "column", flex: 1 }}>
                        <div><p className={handles["minicart__product-name"]}>{item.name}</p></div>

                        {(size || color) && (
                          <div style={{ fontSize: 14, color: "#71767F", marginTop: -7, marginBottom: 7 }}>
                            {size && <span>Tamanho {size}</span>}
                            {color && <span style={{ marginLeft: size ? 30 : 0 }}>Cor {color}</span>}
                          </div>
                        )}

                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                          <div style={{ display: "flex", alignItems: "center", height: 25 }}>
                            <button onClick={() => handleUpdateQuantity(item, item.quantity - 1)} style={{ background: "transparent", cursor: "pointer", lineHeight: 1, fontSize: 18, width: 25, height: "100%", border: "1px solid #AAAAAA" }}>−</button>
                            <input
                              type="text"
                              min={1}
                              className={handles.minicartQuantityInput}
                              value={item.quantity}
                              onChange={(e) => {
                                const next = parseInt(e.target.value, 10)
                                if (Number.isFinite(next)) handleUpdateQuantity(item, next)
                              }}
                              onBlur={(e) => {
                                if (!e.target.value || parseInt(e.target.value, 10) < 1) handleUpdateQuantity(item, 1)
                              }}
                              style={{ width: 25, textAlign: "center", border: "none", outline: "none", fontSize: 14, height: "100%", borderTop: "1px solid #AAAAAA", borderBottom: "1px solid #AAAAAA" }}
                            />
                            <button onClick={() => handleUpdateQuantity(item, item.quantity + 1)} style={{ background: "transparent", cursor: "pointer", lineHeight: 1, fontSize: 18, width: 25, height: "100%", border: "1px solid #AAAAAA" }}>+</button>
                          </div>

                          <div style={{ display: "flex", alignItems: "center", gap: 8 }} className={handles.minicartPriceGroup}>
                            {hasDiscount && <span style={{ textDecoration: "line-through", color: "#888", fontSize: 14 }} className={handles.minicartPrice_precoDe}>{formatBRL(list)}</span>}
                            <span className={handles["minicart__product-price"]}>{formatBRL(current)}</span>
                            {hasDiscount && <span style={{ fontWeight: 500, color: "#4964B6", fontSize: 16 }}  className={handles.minicartPrice_discount}>({pct}% OFF)</span>}
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => handleRemoveItem(item)}
                        className={handles.minicartRemoveButton}
                        style={{ background: "transparent", border: "none", padding: 0, cursor: "pointer" }}
                        title="Remover produto"
                        aria-label="Remover produto"
                      >
                        <svg width="21" height="20" viewBox="0 0 21 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M16.944 4.375H3.19397" stroke="black" strokeLinecap="round" strokeLinejoin="round" />
                          <path d="M6.94434 1.875H13.1943" stroke="black" strokeLinecap="round" strokeLinejoin="round" />
                          <path d="M15.6943 4.375V16.25C15.6943 16.4158 15.6285 16.5747 15.5112 16.6919C15.394 16.8092 15.2351 16.875 15.0693 16.875H5.06934C4.90358 16.875 4.74461 16.8092 4.6274 16.6919C4.51019 16.5747 4.44434 16.4158 4.44434 16.25V4.375" stroke="black" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </button>
                    </div>
                  )
                })}
              </div>

              {items.length > 3 && bottomIndex < items.length - 1 && (
                <button
                  type="button"
                  className={handles.minicartShowMore}
                  onClick={handleShowMore}
                >
                  <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M0.5 1L6 6.5L11.5 1" stroke="black"/>
                  </svg>

                </button>
              )}

              <div className={handles.cartFooter}>
                <span className={handles.minicartTotalizer}>Total a pagar: <span className={handles.minicartTotalizerPrice}>{formatBRL(totalPrice)}</span></span>
                <div className={handles.minicartButtons}>
                  <a href="/checkout#/cart" className={handles.cartButton}>Carrinho</a>
                  <a href="/checkout#/email" className={handles.checkoutButton}>Finalizar compra</a>
                </div>
              </div>
            </>
          ) : (
            <div className={handles.cartFooter}>
              <div className={handles.emptyCartMessage}>Que pena! Seu carrinho está vazio</div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
