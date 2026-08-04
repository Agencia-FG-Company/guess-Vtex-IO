/**
 * blockSwitch
 *
 * Substitui o `ConditionBlock`, mantendo a mesma funcionalidade (mostrar um
 * bloco ou outro conforme um toggle) com uma abordagem diferente:
 *
 * - Slots nomeados (`whenActive` / `whenInactive`) em vez de `children[0]` e
 *   `children[1]`. Reordenar ou acrescentar um filho não troca mais o que é
 *   renderizado.
 * - Não força um `<section>` em volta. O antigo sempre emitia esse nó, o que
 *   atrapalha quando o bloco vive dentro de um flex/grid; aqui o padrão é não
 *   envolver, e o wrapper é opt-in.
 * - Aceita apenas um dos lados configurado, sem depender de ter dois filhos.
 * - `css-handles` no wrapper quando ele existe.
 *
 * `children` posicional continua funcionando como fallback, para o caso de o
 * bloco ser declarado sem slots.
 */
import React, { Fragment, createElement, isValidElement } from 'react'
import { useCssHandles } from 'vtex.css-handles'

type Slot = React.ReactNode | React.ComponentType

type Wrapper = 'none' | 'div' | 'section'

interface BlockSwitchProps {
  /** Quando verdadeiro renderiza `whenActive`; senão, `whenInactive`. */
  active?: boolean
  /** Alias de `active`, aceito para facilitar a migração do ConditionBlock. */
  toggleActive?: boolean
  whenActive?: Slot
  whenInactive?: Slot
  wrapper?: Wrapper
  children?: React.ReactNode
}

const CSS_HANDLES = ['blockSwitch'] as const

const renderSlot = (slot: Slot): React.ReactNode => {
  if (slot === null || slot === undefined || slot === false) return null
  if (isValidElement(slot)) return slot
  if (typeof slot === 'function') {
    return createElement(slot as React.ComponentType)
  }

  // Uma string aqui significa que o render-runtime não resolveu o slot e o valor
  // segue sendo o id do bloco. Renderizar imprimiria esse id na tela, então
  // tratamos como ausente e caímos no fallback de `children`.
  if (typeof slot === 'string') return null

  return slot as React.ReactNode
}

const BlockSwitch: React.FC<BlockSwitchProps> & {
  getSchema?: () => object
} = ({
  active,
  toggleActive,
  whenActive,
  whenInactive,
  wrapper = 'none',
  children,
}) => {
  const { handles } = useCssHandles(CSS_HANDLES)

  const isActive = active ?? toggleActive ?? false
  const slot = renderSlot(isActive ? whenActive : whenInactive)

  const content =
    slot ?? React.Children.toArray(children)[isActive ? 0 : 1] ?? null

  if (content === null) return null
  if (wrapper === 'none') return <Fragment>{content}</Fragment>

  return createElement(wrapper, { className: handles.blockSwitch }, content)
}

BlockSwitch.getSchema = () => ({
  title: 'Alternador de Blocos',
  description:
    'Renderiza um bloco quando ativo e outro quando inativo, sem precisar publicar o tema.',
  type: 'object',
  properties: {
    active: {
      title: 'Ativar bloco principal',
      description:
        'Ligado renderiza o bloco de "whenActive"; desligado renderiza o de "whenInactive".',
      type: 'boolean',
      default: false,
    },
    wrapper: {
      title: 'Elemento em volta',
      description:
        'Mantenha em "none" para não inserir nenhum nó extra no layout.',
      type: 'string',
      enum: ['none', 'div', 'section'],
      enumNames: ['Nenhum', 'div', 'section'],
      default: 'none',
    },
  },
})

export default BlockSwitch
