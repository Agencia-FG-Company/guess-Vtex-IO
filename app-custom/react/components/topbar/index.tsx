/* eslint-disable prettier/prettier */
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useCssHandles } from 'vtex.css-handles'
import './styles.css' // Certifique-se que esse arquivo exista

interface CustomTextSliderProps {
  texts?: Array<{ text: string }>
  speed?: number
  textColor?: string
  backgroundColor?: string
}

export const CSS_HANDLES = ['textSliderContainer', 'textSliderTrack'] as const

/**
 * Espaço não quebrável (U+00A0). Montado com `fromCharCode` de propósito:
 * NBSP literal no fonte fica invisível e some em qualquer reformatação.
 */
const NBSP = String.fromCharCode(0xa0)

/** Separador entre os textos da marquee. */
const SEPARATOR = ` ${NBSP.repeat(6)}•${NBSP.repeat(6)} `

const DEFAULT_TEXTS = [
  {
    text:
      'Promoção de Frete Grátis válido para as regiões Sul, Sudeste e Centro-oeste do país',
  },
  { text: 'Frete grátis nas compras acima de R$ 499,00' },
]

/**
 * Velocidade em pixels por segundo.
 *
 * Substitui o antigo `transitionTime` (duração total do loop em ms), que era um
 * parâmetro frágil por dois motivos:
 *
 * 1. A faixa percorre 50% da PRÓPRIA largura, que depende de quanto texto foi
 *    cadastrado. A mesma duração resultava em velocidades diferentes conforme o
 *    conteúdo — acrescentar um texto deixava a marquee mais rápida.
 * 2. O bloco `Topbar` é declarado sem `#id` em duas árvores (header mobile e
 *    sticky desktop), então o Site Editor guarda uma entrada de conteúdo para
 *    cada treePath. Duração e textos podiam divergir entre mobile e desktop, e
 *    era isso que fazia a velocidade diferir entre os dois.
 *
 * Com velocidade em px/s a duração é derivada da largura real medida, então o
 * movimento é idêntico em qualquer device e estável com qualquer quantidade de
 * texto.
 *
 * 35 px/s reproduz o padrão anterior: com os textos default a faixa mede
 * ~20000-21600px, e 300000ms para percorrer 50% dela equivale a 33-36 px/s.
 */
const DEFAULT_SPEED = 35

/** Fração da faixa percorrida pelo keyframe `marquee` (0% -> -50%). */
const TRAVEL_RATIO = 0.5

/**
 * `ResizeObserver` não existe na lib DOM do TypeScript 3.9.7 usado aqui, então
 * declaramos só o que consumimos em vez de recorrer a `any`.
 */
type ResizeObserverLike = {
  observe: (target: Element) => void
  disconnect: () => void
}

type ResizeObserverCtor = new (callback: () => void) => ResizeObserverLike

const getResizeObserver = (): ResizeObserverCtor | undefined => {
  if (typeof window === 'undefined') return undefined

  return ((window as unknown) as { ResizeObserver?: ResizeObserverCtor })
    .ResizeObserver
}

const resolveSpeed = (speed?: number): number => {
  const value = Number(speed)

  // undefined, null, '', 0, negativo, NaN e texto caem no padrão.
  if (!Number.isFinite(value) || value <= 0) return DEFAULT_SPEED

  return value
}

export const CustomTextSlider: React.FC<CustomTextSliderProps> & {
  schema?: object
} = ({ texts, speed, textColor = '#000000', backgroundColor = '#FFFFFF' }) => {
  const { handles } = useCssHandles(CSS_HANDLES)
  const trackRef = useRef<HTMLDivElement>(null)
  const [trackWidth, setTrackWidth] = useState(0)

  // `texts` chega vazio quando o bloco existe sem conteúdo no Site Editor, e
  // `texts.map` derrubava o header inteiro nesse caso.
  const items = Array.isArray(texts) && texts.length > 0 ? texts : DEFAULT_TEXTS
  const combinedText = items
    .map(t => t?.text ?? '')
    .filter(Boolean)
    .join(SEPARATOR)

  const repeatedText = Array(20).fill(combinedText).join(SEPARATOR)

  const measure = useCallback(() => {
    const node = trackRef.current

    if (!node) return

    // `scrollWidth` devolve a largura real do conteúdo mesmo com a faixa
    // maior que o container (que tem `overflow: hidden`).
    setTrackWidth(node.scrollWidth)
  }, [])

  useEffect(() => {
    measure()

    const ResizeObserverImpl = getResizeObserver()
    const node = trackRef.current

    if (!ResizeObserverImpl || !node) return undefined

    // A largura muda quando a fonte customizada (Century) termina de carregar,
    // e não só quando os textos são editados — daí o observer em vez de uma
    // medição única.
    const observer = new ResizeObserverImpl(measure)

    observer.observe(node)

    return () => observer.disconnect()
  }, [measure, repeatedText])

  const pxPerSecond = resolveSpeed(speed)
  const durationSeconds =
    trackWidth > 0 ? (trackWidth * TRAVEL_RATIO) / pxPerSecond : 0

  return (
    <div
      className={handles.textSliderContainer}
      style={{
        backgroundColor,
        overflow: 'hidden',
        whiteSpace: 'nowrap',
      }}
    >
      <div
        ref={trackRef}
        className={handles.textSliderTrack}
        style={{
          color: textColor,
          // Antes da medição (SSR e primeiro frame) vale o padrão do CSS, que é
          // longo o suficiente para a faixa ficar praticamente parada — assim
          // não há salto de velocidade quando a duração real entra.
          ...(durationSeconds > 0
            ? { animationDuration: `${durationSeconds}s` }
            : null),
        }}
      >
        {repeatedText}
      </div>
    </div>
  )
}

CustomTextSlider.schema = {
  title: 'TopBar Slider',
  description: 'A marquee with customizable texts, colors, and speed.',
  type: 'object',
  properties: {
    texts: {
      title: 'Texts for Marquee',
      type: 'array',
      items: {
        type: 'object',
        properties: {
          text: {
            title: 'Text',
            type: 'string',
            default: 'New text',
          },
        },
      },
    },
    speed: {
      title: 'Velocidade (pixels por segundo)',
      description:
        'Quanto o texto avança por segundo. Padrão 35 — valores maiores deixam mais rápido. A velocidade não muda com a quantidade de textos nem com o dispositivo.',
      type: 'number',
      default: 35,
    },
    textColor: {
      title: 'Text Color',
      type: 'string',
      widget: {
        'ui:widget': 'color',
      },
      default: '#000000',
    },
    backgroundColor: {
      title: 'Background Color',
      type: 'string',
      widget: {
        'ui:widget': 'color',
      },
      default: '#FFFFFF',
    },
  },
}
