import React, { useEffect } from "react";

function getCookie(name: string): string {
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'))
  return match ? match[2] : ''
}

export const awinGet = () => {
  useEffect(() => {
    const interval = setInterval(() => {
      const dataLayer = (window as any).dataLayer || []
      const orderEvent = dataLayer.find((item: any) => item.event === 'orderPlaced')

      if (!orderEvent) return

      clearInterval(interval)

      const awc = getCookie('_aw_sn_124520')
      const orderId = orderEvent.orderGroup
      const value = orderEvent.transactionTotal
      const currency = orderEvent.transactionCurrency

      if (!orderId || !value) {
        console.warn('Awin: dados insuficientes', { orderId, value })
        return
      }

      fetch('/_v/awin/conversion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, value, currency, awc }),
      })
        .then(res => res.json())
        .then(data => console.log('Awin: conversão enviada', data))
        .catch(err => console.error('Awin: erro ao enviar conversão', err))

    }, 500)

    setTimeout(() => clearInterval(interval), 15000)

  }, [])

  return <div />
}