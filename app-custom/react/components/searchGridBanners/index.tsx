/**
 * searchGridBanners
 *
 * Substitui o `galleryWithBanners`, mantendo a mesma funcionalidade (inserir
 * banners entre os produtos da vitrine de busca) com uma abordagem diferente:
 *
 * - O gatilho principal é o dado (`useSearchPage`), não o DOM. O antigo dependia
 *   de um `MutationObserver` com `subtree: true` que reexecutava a injeção
 *   inteira a cada mutação da galeria.
 * - O conteúdo do banner é React de verdade (`createPortal`). O antigo montava
 *   os nós com `document.createElement` + `insertBefore`, então nunca atualizava
 *   quando as props mudavam e não tinha limpeza real no unmount.
 * - A colocação é idempotente e reversível: o slot é criado, movido ou removido
 *   conforme a posição configurada. O antigo só sabia inserir.
 * - Viewport reativo via `matchMedia` em vez de uma leitura única de
 *   `window.innerWidth` dentro do `useEffect`.
 * - Posições configuráveis por dispositivo em vez dos índices fixos
 *   `[0, 4, 6, 10]` / `[0, 3, 6, 9]`.
 * - Seletores da vitrine configuráveis, para não quebrar quando o
 *   `vtex.search-result` mudar de major.
 * - Estilo por `css-handles`, e não por style inline + CSS hospedado no
 *   namespace errado (`vtex.my-account`).
 */
import React, {
  Fragment,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { createPortal } from 'react-dom'
import { useCssHandles } from 'vtex.css-handles'
import { useDevice } from 'vtex.device-detector'
import { useSearchPage } from 'vtex.search-page-context/SearchPageContext'

type Viewport = 'phone' | 'tablet' | 'desktop'

interface BannerConfig {
  imageUrl?: string
  link?: string
  alt?: string
  enabled?: boolean
  openInNewTab?: boolean
  loading?: 'lazy' | 'eager'
  desktopPosition?: number
  tabletPosition?: number
  phonePosition?: number
}

interface SearchGridBannersProps {
  banners?: BannerConfig[]
  galleryLayoutName?: string
  gallerySelector?: string
  galleryItemSelector?: string
}

interface ResolvedSlot {
  key: string
  index: number
  banner: BannerConfig
  position: number
}

/** Mesmos breakpoints dos mixins em `styles/sass/reset/vars.scss`. */
const BREAKPOINTS = {
  phone: 768,
  tablet: 1025,
}

const DEFAULT_LAYOUT_NAME = 'grid-banners-laterais'
const SLOT_ATTRIBUTE = 'data-fg-grid-banner'

/**
 * Posições (1-based, "antes do enésimo produto") equivalentes aos índices fixos
 * do componente antigo, usadas quando o banner não traz posição própria.
 */
const FALLBACK_POSITIONS: Record<Viewport, number[]> = {
  desktop: [1, 4, 7, 10],
  tablet: [1, 4, 7, 10],
  phone: [1, 5, 7, 11],
}

const CSS_HANDLES = ['gridBanner', 'gridBannerLink', 'gridBannerImage'] as const

const viewportFromDevice = (device?: string): Viewport => {
  if (device === 'phone') return 'phone'
  if (device === 'tablet') return 'tablet'

  return 'desktop'
}

/**
 * Viewport reativo: parte do device resolvido no servidor (evita salto na
 * hidratação) e depois acompanha o cruzamento dos breakpoints.
 */
const useViewport = (initial: Viewport): Viewport => {
  const [viewport, setViewport] = useState<Viewport>(initial)

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return undefined

    const phone = window.matchMedia(`(max-width: ${BREAKPOINTS.phone}px)`)
    const tablet = window.matchMedia(`(max-width: ${BREAKPOINTS.tablet}px)`)

    const sync = () => {
      if (phone.matches) {
        setViewport('phone')
      } else if (tablet.matches) {
        setViewport('tablet')
      } else {
        setViewport('desktop')
      }
    }

    sync()

    // `addListener` em vez de `addEventListener` por compatibilidade com
    // Safari < 14, que não implementa a segunda forma em MediaQueryList.
    phone.addListener(sync)
    tablet.addListener(sync)

    return () => {
      phone.removeListener(sync)
      tablet.removeListener(sync)
    }
  }, [])

  return viewport
}

const positionFor = (
  banner: BannerConfig,
  index: number,
  viewport: Viewport
): number | null => {
  let configured: number | undefined

  if (viewport === 'phone') {
    configured = banner.phonePosition
  } else if (viewport === 'tablet') {
    // Tablet herda a posição de desktop quando não é configurado.
    configured = banner.tabletPosition ?? banner.desktopPosition
  } else {
    configured = banner.desktopPosition
  }

  const position = configured ?? FALLBACK_POSITIONS[viewport][index]

  return typeof position === 'number' && position > 0 ? position : null
}

const BannerContent: React.FC<{
  banner: BannerConfig
  index: number
  handles: Record<string, string>
}> = ({ banner, index, handles }) => {
  const newTab = banner.openInNewTab === true

  const image = (
    <img
      className={handles.gridBannerImage}
      src={banner.imageUrl}
      alt={banner.alt ? banner.alt : `Banner ${index + 1}`}
      loading={banner.loading === 'eager' ? 'eager' : 'lazy'}
    />
  )

  if (!banner.link) return image

  return (
    <a
      className={handles.gridBannerLink}
      href={banner.link}
      target={newTab ? '_blank' : undefined}
      rel={newTab ? 'noopener noreferrer' : undefined}
    >
      {image}
    </a>
  )
}

const SearchGridBanners: React.FC<SearchGridBannersProps> & {
  getSchema?: () => object
} = ({
  banners = [],
  galleryLayoutName = DEFAULT_LAYOUT_NAME,
  gallerySelector,
  galleryItemSelector,
}) => {
  const { handles } = useCssHandles(CSS_HANDLES)
  const { device } = useDevice()
  const viewport = useViewport(viewportFromDevice(device))
  const searchPage = useSearchPage()

  const [containers, setContainers] = useState<Record<string, HTMLElement>>({})

  const products = searchPage?.searchQuery?.data?.productSearch?.products
  const productCount = Array.isArray(products) ? products.length : 0

  // O render-runtime pode entregar um novo array a cada render. Memoizar pelo
  // conteúdo mantém `slots`, `syncSlots` e o efeito estáveis.
  const bannersKey = JSON.stringify(banners)

  const selectors = useMemo(() => {
    const gallery =
      gallerySelector ??
      `.vtex-search-result-3-x-gallery--${galleryLayoutName}, .vtex-search-result-3-x-gallery`

    const item =
      galleryItemSelector ??
      `.vtex-search-result-3-x-galleryItem--${galleryLayoutName}`

    return { gallery, item }
  }, [gallerySelector, galleryItemSelector, galleryLayoutName])

  /** Slots válidos, na ordem em que aparecem na grade. */
  const slots = useMemo<ResolvedSlot[]>(() => {
    const resolved: ResolvedSlot[] = []

    banners.forEach((banner, index) => {
      if (!banner || !banner.imageUrl || banner.enabled === false) return

      const position = positionFor(banner, index, viewport)

      if (position === null) return

      resolved.push({ key: `slot-${index}`, index, banner, position })
    })

    return resolved.sort((a, b) => a.position - b.position)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bannersKey, viewport])

  const placeholderClass = handles.gridBanner

  const syncSlots = useCallback(
    (gallery: HTMLElement) => {
      const items = gallery.querySelectorAll<HTMLElement>(selectors.item)
      const attached: Record<string, HTMLElement> = {}

      slots.forEach(slot => {
        const existing = gallery.querySelector<HTMLElement>(
          `[${SLOT_ATTRIBUTE}="${slot.key}"]`
        )

        // `items` é um snapshot só de produtos — os placeholders não casam com o
        // seletor de item, então a posição de cada banner é independente das
        // inserções anteriores.
        const target = items[slot.position - 1]

        if (!target) {
          existing?.parentNode?.removeChild(existing)

          return
        }

        let node = existing

        if (!node) {
          node = document.createElement('div')
          node.setAttribute(SLOT_ATTRIBUTE, slot.key)
        }

        node.className = placeholderClass

        if (node.parentNode !== gallery || node.nextElementSibling !== target) {
          gallery.insertBefore(node, target)
        }

        attached[slot.key] = node
      })

      // Remove placeholders órfãos (banner desativado, posição inexistente ou
      // troca de viewport).
      const existingNodes = gallery.querySelectorAll<HTMLElement>(
        `[${SLOT_ATTRIBUTE}]`
      )

      for (let i = 0; i < existingNodes.length; i++) {
        const node = existingNodes[i]
        const key = node.getAttribute(SLOT_ATTRIBUTE)

        if (key && !attached[key] && node.parentNode) {
          node.parentNode.removeChild(node)
        }
      }

      setContainers(current => {
        const currentKeys = Object.keys(current)
        const nextKeys = Object.keys(attached)

        const unchanged =
          currentKeys.length === nextKeys.length &&
          nextKeys.every(key => current[key] === attached[key])

        return unchanged ? current : attached
      })
    },
    [placeholderClass, selectors.item, slots]
  )

  useEffect(() => {
    if (typeof document === 'undefined') return undefined

    let frame = 0
    let attempts = 0
    let disposed = false
    let galleryObserver: MutationObserver | null = null
    let parentObserver: MutationObserver | null = null
    let observed: HTMLElement | null = null

    const disconnect = () => {
      if (galleryObserver) galleryObserver.disconnect()
      if (parentObserver) parentObserver.disconnect()
      galleryObserver = null
      parentObserver = null
      observed = null
    }

    const schedule = () => {
      if (frame || disposed) return
      frame = window.requestAnimationFrame(run)
    }

    function run() {
      frame = 0
      if (disposed) return

      const gallery = document.querySelector<HTMLElement>(selectors.gallery)

      if (!gallery) {
        // A vitrine ainda não montou. Este efeito já roda a cada mudança na
        // contagem de produtos, então basta uma janela curta de tentativas.
        attempts += 1
        if (attempts < 120) schedule()

        return
      }

      attempts = 0
      syncSlots(gallery)

      if (observed === gallery) return

      // Rede de segurança estreita: só `childList`, sem `subtree`. Os filhos
      // diretos da galeria são os produtos, então isso cobre o "ver mais" e a
      // troca de filtros; observar o pai cobre a galeria sendo substituída.
      disconnect()
      observed = gallery

      galleryObserver = new MutationObserver(schedule)
      galleryObserver.observe(gallery, { childList: true })

      if (gallery.parentElement) {
        parentObserver = new MutationObserver(schedule)
        parentObserver.observe(gallery.parentElement, { childList: true })
      }
    }

    run()

    return () => {
      disposed = true
      if (frame) window.cancelAnimationFrame(frame)
      disconnect()
    }
  }, [productCount, selectors.gallery, syncSlots])

  return (
    <Fragment>
      {slots.map(slot => {
        const container = containers[slot.key]

        if (!container) return null

        return createPortal(
          <BannerContent
            banner={slot.banner}
            handles={handles}
            index={slot.index}
          />,
          container,
          slot.key
        )
      })}
    </Fragment>
  )
}

SearchGridBanners.getSchema = () => ({
  title: 'Banners na Vitrine',
  description:
    'Insere banners entre os produtos da vitrine, na posição escolhida para cada dispositivo.',
  type: 'object',
  properties: {
    banners: {
      title: 'Banners',
      type: 'array',
      items: {
        title: 'Banner',
        type: 'object',
        properties: {
          imageUrl: {
            title: 'Imagem',
            type: 'string',
            widget: {
              'ui:widget': 'image-uploader',
            },
          },
          link: {
            title: 'Link',
            type: 'string',
          },
          alt: {
            title: 'Texto alternativo',
            type: 'string',
          },
          enabled: {
            title: 'Ativar este banner',
            type: 'boolean',
            default: true,
          },
          openInNewTab: {
            title: 'Abrir em nova aba',
            type: 'boolean',
            default: false,
          },
          desktopPosition: {
            title: 'Posição no desktop',
            description: 'Ocupa a vaga do enésimo produto. Ex.: 4.',
            type: 'number',
          },
          tabletPosition: {
            title: 'Posição no tablet',
            description: 'Se vazio, usa a posição do desktop.',
            type: 'number',
          },
          phonePosition: {
            title: 'Posição no mobile',
            description: 'Ocupa a vaga do enésimo produto. Ex.: 5.',
            type: 'number',
          },
        },
      },
    },
  },
})

export default SearchGridBanners
