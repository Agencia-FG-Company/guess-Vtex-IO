import React, { useEffect } from "react";

function getCookie(name: string): string {
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'))
  return match ? match[2] : ''
}

export const awinGet = () => {
   console.log('Awin: componente carregado')
   useEffect(() => {
       // Aguarda o evento orderPlaced aparecer no dataLayer
       const interval = setInterval(() => {
      console.log('Awin: componente carregado222')
    const dataLayer = (window as any).dataLayer || []
    const orderEvent = dataLayer.find((item: any) => item.event === 'orderPlaced')

    if (!orderEvent) return // ainda não chegou, tenta de novo

    clearInterval(interval) // achou, para de verificar

    const awc = getCookie('AwinChannelCookie')
    const orderId = orderEvent.orderGroup
    const value = orderEvent.transactionTotal
    const currency = orderEvent.transactionCurrency

    if (!orderId || !value || !awc) {
      console.warn('Awin: dados insuficientes', { orderId, value, awc })
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

  }, 500) // verifica a cada 500ms

  // Para de verificar depois de 10 segundos para não ficar rodando forever
  setTimeout(() => clearInterval(interval), 15000)

}, [])

  return <div />
}