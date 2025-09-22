/* eslint-disable import/order */
/* eslint-disable prettier/prettier */
import React, { useState, useRef, useEffect } from 'react'
import styles from './styles.css'

interface CollapseTextProps {
  lines?: number
  children?: React.ReactNode
}

const CollapseText: StorefrontFunctionComponent<CollapseTextProps> = ({
  children,
  lines = 2,
}: CollapseTextProps) => {
  const [expanded, setExpanded] = useState(false)
  const [showButton, setShowButton] = useState(false)
  const textRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const node = textRef.current
    if (!node) return

    const lineHeight = parseFloat(getComputedStyle(node).lineHeight || '24') // pega o line-height real
    const maxHeight = lineHeight * lines

    const checkOverflow = () => {
      if (!node) return
      const isOverflowing = node.scrollHeight > maxHeight
      setShowButton(isOverflowing)
    }

    checkOverflow()

    const observer = new MutationObserver(checkOverflow)
    observer.observe(node, { childList: true, subtree: true })

    window.addEventListener('resize', checkOverflow)

    return () => {
      observer.disconnect()
      window.removeEventListener('resize', checkOverflow)
    }
  }, [children, lines])

  return (
    <div className={styles.container}>
      <div
        ref={textRef}
        className={styles.text}
        style={{
          maxHeight: !expanded ? `${lines * 2.6}em` : 'none', // line-height aproximado em em
          overflow: !expanded ? 'hidden' : 'visible',
        }}
      >
        {children}
      </div>

      {showButton && (
        <button
          className={styles.button}
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? 'Mostrar menos' : 'Mostrar mais'}
        </button>
      )}
    </div>
  )
}

CollapseText.schema = {
  title: 'Collapse Text',
  description:
    'Exibe texto com colapso de linhas (suporta rich-text como filho)',
  type: 'object',
  properties: {
    lines: {
      title: 'Número de linhas',
      type: 'number',
      default: 2,
    },
  },
  children: true,
}

export default CollapseText
