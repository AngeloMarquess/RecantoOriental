export const STORE_WHATSAPP_NUMBER = '5581971027939' // Format: Country Code + Area Code + Number

export function generateWhatsAppMessage(order: any): string {
  if (!order) return ''

  const orderId = order.id.split('-')[0].toUpperCase()
  const customerName = order.profiles?.full_name || 'Cliente'
  const deliveryAddress = order.delivery_address || 'Endereço não informado'
  const paymentMethod = order.payment_method === 'cash' ? 'Dinheiro' :
    order.payment_method === 'card_machine' ? 'Maquininha' :
      order.payment_method === 'online_stripe' ? 'Online' : order.payment_method

  let message = `*NOVO PEDIDO: #${orderId}*\n`
  message += `Olá! Gostaria de confirmar o meu pedido.\n\n`

  message += `*Cliente:* ${customerName}\n`
  if (order.profiles?.phone_number) {
    message += `*Telefone:* ${order.profiles.phone_number}\n`
  }
  message += `*Endereço:* ${deliveryAddress}\n\n`

  message += `*ITENS DO PEDIDO:*\n`
  if (order.order_items && Array.isArray(order.order_items)) {
    order.order_items.forEach((item: any) => {
      const itemName = item.products?.name || 'Item desconhecido'
      const price = `R$ ${Number(item.total_price).toFixed(2).replace('.', ',')}`
      message += `▪ ${item.quantity}x ${itemName} - ${price}\n`
    })
  }

  message += `\n*Forma de Pagamento:* ${paymentMethod}`

  if (order.delivery_fee > 0) {
    const feeInfo = `R$ ${Number(order.delivery_fee).toFixed(2).replace('.', ',')}`
    message += `\n*Taxa de Entrega:* ${feeInfo}`
  }

  const totalFormat = `R$ ${Number(order.total_amount).toFixed(2).replace('.', ',')}`
  message += `\n*TOTAL:* ${totalFormat}\n`

  return message
}

export function getWhatsAppUrl(order: any): string {
  const message = generateWhatsAppMessage(order)
  const encodedMessage = encodeURIComponent(message)
  return `https://wa.me/${STORE_WHATSAPP_NUMBER}?text=${encodedMessage}`
}
