/* eslint-disable no-void */
/* eslint-disable react/react-in-jsx-scope */
/* eslint-disable @typescript-eslint/ban-ts-ignore */
/* eslint-disable spaced-comment */
/* eslint-disable vtex/prefer-early-return */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable import/order */
/* eslint-disable prettier/prettier */

import React, { useEffect, useState, useRef } from "react"
import styles from "./styles.css"

interface CountdownProps {
  targetDate: string // ex: "2025-11-28T00:00:00"
}

const DigitFlip = ({ value }: { value: number }) => {
  const [prevValue, setPrevValue] = useState(value)
  const [animating, setAnimating] = useState(false)
  const flipRef = useRef<HTMLDivElement>(null)

  //@ts-ignore
  useEffect(() => {
    if (value !== prevValue) {
      // Reinicia a animação removendo e readicionando a classe
      if (flipRef.current) {
        flipRef.current.classList.remove(styles.play)
        // Força um reflow
        void flipRef.current.offsetWidth
        flipRef.current.classList.add(styles.play)
      }

      setAnimating(true)
      setPrevValue(value)

      const timer = setTimeout(() => {
        setAnimating(false)
      }, 600)

      return () => clearTimeout(timer)
    }
  }, [value, prevValue])

  return (
    <div className={styles.flipContainer}>
      <div
        ref={flipRef}
        className={`${styles.flipCard} ${animating ? styles.play : ""}`}
      >
        {/* Parte superior - mostra o valor atual */}
        <div className={styles.top}><span>{prevValue}</span></div>

        {/* Parte inferior - mostra o próximo valor */}
        <div className={styles.bottom}><span>{value}</span></div>

        {/* Lâmina superior - animação */}
        <div className={styles.flipFront}><span>{prevValue}</span></div>

        {/* Lâmina inferior - animação */}
        <div className={styles.flipBack}><span>{value}</span></div>
      </div>
    </div>
  )
}

// Componente que renderiza um grupo (dias, horas, etc.)
const FlipUnit = ({ value, label }: { value: number; label: string }) => {
  // transforma em string com pelo menos 2 dígitos
  const digits = value.toString().padStart(2, "0").split("").map(Number)

  return (
    <div className={styles.flipGroup}>
      <div className={styles.flipGroupNumbers}>
        {digits.map((d, i) => (
          <DigitFlip key={i} value={d} />
        ))}
      </div>
      <span className={styles.label}>{label}</span>
    </div>
  )
}

const CountdownFlip: React.FC<CountdownProps> = ({ targetDate }) => {
  const calculateTimeLeft = () => {
    const difference = +new Date(targetDate) - +new Date()
    let timeLeft = { days: 0, hours: 0, minutes: 0, seconds: 0 }

    if (difference > 0) {
      timeLeft = {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / (1000 * 60)) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      }
    }
    return timeLeft
  }

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft())

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className={styles.countdown}>
      <div className={styles.containerTitle}>
        <span className={styles.countdownTitle}>A Black Friday de 2025 acontecerá no dia 28 de Novembro:</span>
      </div>
      <div className={styles.containerNumbers}>
        <FlipUnit value={timeLeft.days} label="Dias" />
        <FlipUnit value={timeLeft.hours} label="Horas" />
        <FlipUnit value={timeLeft.minutes} label="Minutos" />
        <FlipUnit value={timeLeft.seconds} label="Segundos" />
      </div>
    </div>
  )
}

export default CountdownFlip
