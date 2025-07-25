/* eslint-disable prettier/prettier */
import React from 'react'
import { useCssHandles } from 'vtex.css-handles'
import './styles.css' // Certifique-se que esse arquivo exista

interface CustomTextSliderProps {
  texts: { text: string }[]
  transitionTime: number
  textColor: string
  backgroundColor: string
}

export const CSS_HANDLES = ['textSliderContainer', 'textSliderTrack'] as const

export const CustomTextSlider: React.FC<CustomTextSliderProps> & { schema?: object } = ({
  texts,
  transitionTime,
  textColor,
  backgroundColor
}) => {
  const { handles } = useCssHandles(CSS_HANDLES)

  const separator = ' \u00A0\u00A0\u00A0\u00A0\u00A0\u00A0•\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0 ' // usa espaços não quebráveis e o bullet (•)
  const combinedText = texts.map(t => t.text).join(separator)
  const repeatedText = Array(20).fill(combinedText).join(separator)

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
        className={handles.textSliderTrack}
        style={{
          color: textColor,
          animationDuration: `${transitionTime}ms`,
        }}
      >
        {repeatedText}
      </div>
    </div>
  )
}

CustomTextSlider.defaultProps = {
  texts: [
    { text: 'Promoção de Frete Grátis válido para as regiões Sul, Sudeste e Centro-oeste do país' },
    { text: 'Frete grátis nas compras acima de R$ 499,00' }
  ],
  transitionTime: 300000,
  textColor: '#000000',
  backgroundColor: '#FFFFFF'
}

CustomTextSlider.schema = {
  title: 'TopBar Slider',
  description: 'A marquee with customizable texts, colors, and transition time.',
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
            default: 'New text'
          }
        }
      }
    },
    transitionTime: {
      title: 'Loop Duration (ms)',
      type: 'number',
      default: 300000
    },
    textColor: {
      title: 'Text Color',
      type: 'string',
      widget: {
        'ui:widget': 'color'
      },
      default: '#000000'
    },
    backgroundColor: {
      title: 'Background Color',
      type: 'string',
      widget: {
        'ui:widget': 'color'
      },
      default: '#FFFFFF'
    }
  }
}
