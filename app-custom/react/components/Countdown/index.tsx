/* eslint-disable no-void */
/* eslint-disable react/react-in-jsx-scope */
/* eslint-disable @typescript-eslint/ban-ts-ignore */
/* eslint-disable spaced-comment */
/* eslint-disable vtex/prefer-early-return */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable import/order */
/* eslint-disable prettier/prettier */

import React, { useEffect, useState, useRef } from 'react'
import styles from './styles.css'

interface CountdownProps {
  targetDate: string
  countdownTitle?: string
}

// 🔥 Aqui estendemos React.FC para aceitar schema
type CountdownComponent = React.FC<CountdownProps> & {
  schema?: Record<string, unknown>
}

const DigitFlip = ({ value }: { value: number }) => {
  const [prevValue, setPrevValue] = useState(value)
  const [animating, setAnimating] = useState(false)
  const flipRef = useRef<HTMLDivElement>(null)

  //@ts-ignore
  useEffect(() => {
    if (value !== prevValue) {
      if (flipRef.current) {
        flipRef.current.classList.remove(styles.play)
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
        className={`${styles.flipCard} ${animating ? styles.play : ''}`}
      >
        <div className={styles.top}>
          <span>{prevValue}</span>
        </div>
        <div className={styles.bottom}>
          <span>{value}</span>
        </div>
        <div className={styles.flipFront}>
          <span>{prevValue}</span>
        </div>
        <div className={styles.flipBack}>
          <span>{value}</span>
        </div>
      </div>
    </div>
  )
}

const FlipUnit = ({ value, label }: { value: number; label: string }) => {
  const digits = value.toString().padStart(2, '0').split('').map(Number)

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

const CountdownFlip: CountdownComponent = ({ targetDate, countdownTitle }) => {
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
        <span className={styles.countdownTitle}>
          {countdownTitle ??
            'A Black Friday de 2025 acontecerá no dia 28 de Novembro:'}
        </span>
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

// 🔥 Definição do schema para o Site Editor
CountdownFlip.schema = {
  title: 'Countdown Flip',
  description:
    'Contador regressivo animado para datas especiais (ex: Black Friday)',
  type: 'object',
  properties: {
    targetDate: {
      title: 'Data alvo',
      description: 'Data final do contador (ex: 2025-11-28T00:00:00)',
      type: 'string',
      default: '2025-11-28T00:00:00',
    },
    countdownTitle: {
      title: 'Título do contador',
      description: 'Texto exibido acima do contador',
      type: 'string',
      default: 'A Black Friday de 2025 acontecerá no dia 28 de Novembro:',
    },
  },
}

export default CountdownFlip
