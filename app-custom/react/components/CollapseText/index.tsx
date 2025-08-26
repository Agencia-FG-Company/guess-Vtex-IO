/* eslint-disable import/order */
/* eslint-disable prettier/prettier */
import React, { useState, useRef, useEffect } from "react"
import styles from "./styles.css"

interface CollapseTextProps {
  text: string
  lines?: number
}

const CollapseText: StorefrontFunctionComponent<CollapseTextProps> = ({
  text = "",
  lines = 2,
}) => {
  const [expanded, setExpanded] = useState(false)
  const [showButton, setShowButton] = useState(false)
  const textRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (textRef.current) {
      const hasOverflow =
        textRef.current.scrollHeight > textRef.current.clientHeight
      setShowButton(hasOverflow)
    }
  }, [text])

  return (
    <div className={styles.container}>
      <div
        ref={textRef}
        className={`${styles.text} ${
          expanded ? styles.expanded : styles.collapsed
        }`}
        style={{
          WebkitLineClamp: expanded ? "unset" : lines,
        }}
      >
        {text}
      </div>

      {showButton && (
        <button
          className={styles.button}
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? "Mostrar menos" : "Mostrar mais"}
        </button>
      )}
    </div>
  )
}

CollapseText.schema = {
  title: "Collapse Text",
  description: "Exibe texto com colapso de linhas",
  type: "object",
  properties: {
    text: {
      title: "Texto",
      type: "string",
      widget: {
        "ui:widget": "textarea", // habilita edição de texto no Site Editor
      },
    },
    lines: {
      title: "Número de linhas",
      type: "number",
      default: 2,
    },
  },
}

export default CollapseText

