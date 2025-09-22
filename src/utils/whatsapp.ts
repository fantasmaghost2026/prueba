import { OrderData, CustomerInfo } from '../components/CheckoutModal';
import { universalWhatsAppService } from './universalWhatsApp';

export function sendOrderToWhatsApp(orderData: OrderData): void {
  const { 
    orderId, 
    customerInfo, 
    deliveryZone, 
    deliveryCost, 
    items, 
    subtotal, 
    transferFee, 
    total,
    cashTotal = 0,
    transferTotal = 0,
    pickupLocation = false,
    showLocationMap = false
  } = orderData;

  // Obtener el porcentaje de transferencia actual del contexto admin
  const getTransferFeePercentage = () => {
    try {
      const adminState = localStorage.getItem('admin_system_state');
      if (adminState) {
        const state = JSON.parse(adminState);
        return state.prices?.transferFeePercentage || 10;
      }
    } catch (error) {
      console.warn('No se pudo obtener el porcentaje de transferencia del admin:', error);
    }
    return 10; // Valor por defecto
  };

  // Obtener precios actuales del contexto admin
  const getCurrentPrices = () => {
    try {
      const adminState = localStorage.getItem('admin_system_state');
      if (adminState) {
        const state = JSON.parse(adminState);
        return {
          moviePrice: state.prices?.moviePrice || 80,
          seriesPrice: state.prices?.seriesPrice || 300,
          novelPricePerChapter: state.prices?.novelPricePerChapter || 5,
          transferFeePercentage: state.prices?.transferFeePercentage || 10
        };
      }
    } catch (error) {
      console.warn('No se pudieron obtener los precios del admin:', error);
    }
    return {
      moviePrice: 80,
      seriesPrice: 300,
      novelPricePerChapter: 5,
      transferFeePercentage: 10
    };
  };

  const currentPrices = getCurrentPrices();
  const transferFeePercentage = currentPrices.transferFeePercentage;
  
  // Formatear lista de productos con desglose detallado de métodos de pago
  const itemsList = items
    .map(item => {
      const seasonInfo = item.type === 'tv' && item.selectedSeasons && item.selectedSeasons.length > 0 
        ? `\n  📺 Temporadas: ${item.selectedSeasons.sort((a, b) => a - b).join(', ')}` 
        : '';
      
      const extendedSeriesInfo = item.type === 'tv' && item.episodeCount && item.episodeCount > 50
        ? `\n  📊 Serie extensa: ${item.episodeCount} episodios totales`
        : '';
      
      const novelInfo = item.type === 'novel' 
        ? `\n  📚 Capítulos: ${item.chapters}\n  📖 Género: ${item.genre}` 
        : '';
      
      const itemType = item.type === 'movie' ? 'Película' : item.type === 'tv' ? 'Serie' : 'Novela';
      
      let basePrice: number;
      if (item.type === 'novel') {
        basePrice = item.chapters * currentPrices.novelPricePerChapter;
      } else if (item.type === 'movie') {
        basePrice = currentPrices.moviePrice;
      } else {
        basePrice = (item.selectedSeasons?.length || 1) * currentPrices.seriesPrice;
      }
      
      const finalPrice = item.paymentType === 'transfer' ? Math.round(basePrice * (1 + transferFeePercentage / 100)) : basePrice;
      const paymentTypeText = item.paymentType === 'transfer' ? `Transferencia (+${transferFeePercentage}%)` : 'Efectivo';
      const emoji = item.type === 'movie' ? '🎬' : item.type === 'tv' ? '📺' : '📚';
      
      let itemText = `${emoji} *${item.title}*${seasonInfo}${extendedSeriesInfo}${novelInfo}\n`;
      itemText += `  📋 Tipo: ${itemType}\n`;
      
      // Add extended series pricing explanation
      if (item.type === 'tv' && item.episodeCount && item.episodeCount > 50) {
        itemText += `  📊 Serie extensa: ${item.episodeCount} episodios (precio estándar $${currentPrices.seriesPrice} CUP/temporada)\n`;
      }
      
      itemText += `  💳 Método de pago: ${paymentTypeText}\n`;
      
      if (item.paymentType === 'transfer') {
        const recargo = finalPrice - basePrice;
        itemText += `  💰 Precio base: $${basePrice.toLocaleString()} CUP\n`;
        itemText += `  💳 Recargo transferencia (${transferFeePercentage}%): +$${recargo.toLocaleString()} CUP\n`;
        itemText += `  💰 Precio final: $${finalPrice.toLocaleString()} CUP`;
      } else {
        itemText += `  💰 Precio: $${finalPrice.toLocaleString()} CUP`;
      }
      
      return itemText;
    })
    .join('\n\n');

  // Construir mensaje completo
  let message = `🎬 *NUEVO PEDIDO - TV A LA CARTA*\n\n`;
  message += `📋 *ID de Orden:* ${orderId}\n\n`;
  
  message += `👤 *DATOS DEL CLIENTE:*\n`;
  message += `• Nombre: ${customerInfo.fullName}\n`;
  message += `• Teléfono: ${customerInfo.phone}\n`;
  if (!pickupLocation && customerInfo.address) {
    message += `• Dirección: ${customerInfo.address}\n`;
  }
  message += `\n`;
  
  message += `🎯 *PRODUCTOS SOLICITADOS:*\n${itemsList}\n\n`;
  
  // Desglosar por tipo de pago
  const cashItems = items.filter(item => item.paymentType === 'cash');
  const transferItems = items.filter(item => item.paymentType === 'transfer');
  
  // Mostrar desglose detallado por tipo de pago
  message += `📊 *DESGLOSE DETALLADO POR MÉTODO DE PAGO:*\n`;
  
  if (cashItems.length > 0) {
    message += `💵 *PAGO EN EFECTIVO:*\n`;
    cashItems.forEach(item => {
      let basePrice: number;
      if (item.type === 'novel') {
        basePrice = item.chapters * currentPrices.novelPricePerChapter;
      } else if (item.type === 'movie') {
        basePrice = currentPrices.moviePrice;
      } else {
        basePrice = (item.selectedSeasons?.length || 1) * currentPrices.seriesPrice;
      }
      const emoji = item.type === 'movie' ? '🎬' : item.type === 'tv' ? '📺' : '📚';
      message += `  ${emoji} ${item.title}: $${basePrice.toLocaleString()} CUP\n`;
    });
    message += `  💰 *Subtotal Efectivo: $${cashTotal.toLocaleString()} CUP*\n\n`;
  }
  
  if (transferItems.length > 0) {
    message += `🏦 *PAGO POR TRANSFERENCIA BANCARIA (+${transferFeePercentage}%):*\n`;
    transferItems.forEach(item => {
      let basePrice: number;
      if (item.type === 'novel') {
        basePrice = item.chapters * currentPrices.novelPricePerChapter;
      } else if (item.type === 'movie') {
        basePrice = currentPrices.moviePrice;
      } else {
        basePrice = (item.selectedSeasons?.length || 1) * currentPrices.seriesPrice;
      }
      const finalPrice = Math.round(basePrice * (1 + transferFeePercentage / 100));
      const recargo = finalPrice - basePrice;
      const emoji = item.type === 'movie' ? '🎬' : item.type === 'tv' ? '📺' : '📚';
      message += `  ${emoji} ${item.title}:\n`;
      message += `    💰 Base: $${basePrice.toLocaleString()} CUP\n`;
      message += `    💳 Recargo (${transferFeePercentage}%): +$${recargo.toLocaleString()} CUP\n`;
      message += `    💰 Total: $${finalPrice.toLocaleString()} CUP\n`;
    });
    message += `  💰 *Subtotal Transferencia: $${transferTotal.toLocaleString()} CUP*\n\n`;
  }
  
  message += `📋 *RESUMEN FINAL DE PAGOS:*\n`;
  if (cashTotal > 0) {
    message += `• Efectivo: $${cashTotal.toLocaleString()} CUP (${cashItems.length} elementos)\n`;
  }
  if (transferTotal > 0) {
    message += `• Transferencia: $${transferTotal.toLocaleString()} CUP (${transferItems.length} elementos)\n`;
  }
  message += `• *Subtotal Contenido: $${subtotal.toLocaleString()} CUP*\n`;
  
  if (transferFee > 0) {
    message += `• Recargo transferencia (${transferFeePercentage}%): +$${transferFee.toLocaleString()} CUP\n`;
  }
  
  // Información de entrega
  message += `\n📍 *INFORMACIÓN DE ENTREGA:*\n`;
  if (pickupLocation) {
    message += `🏪 *RECOGIDA EN EL LOCAL:*\n`;
    message += `• Ubicación: TV a la Carta\n`;
    message += `• Dirección: Reparto Nuevo Vista Alegre, Santiago de Cuba\n`;
    message += `• Costo: GRATIS\n`;
    
    if (showLocationMap) {
      message += `• 📍 Coordenadas GPS: 20.039585, -75.849663\n`;
      message += `• 🗺️ Google Maps: https://www.google.com/maps/place/20%C2%B002'22.5%22N+75%C2%B050'58.8%22W/@20.0394604,-75.8495414,180m/data=!3m1!1e3!4m4!3m3!8m2!3d20.039585!4d-75.849663?entry=ttu&g_ep=EgoyMDI1MDczMC4wIKXMDSoASAFQAw%3D%3D\n`;
    }
  } else {
    message += `🚚 *ENTREGA A DOMICILIO:*\n`;
    message += `• Zona: ${deliveryZone.replace(' > ', ' → ')}\n`;
    if (customerInfo.address) {
      message += `• Dirección: ${customerInfo.address}\n`;
    }
    message += `• Costo de entrega: $${deliveryCost.toLocaleString()} CUP\n`;
  }
  
  message += `\n🎯 *TOTAL FINAL: $${total.toLocaleString()} CUP*\n\n`;
  
  message += `📊 *ESTADÍSTICAS DEL PEDIDO:*\n`;
  message += `• Total de elementos: ${items.length}\n`;
  message += `• Películas: ${items.filter(item => item.type === 'movie').length}\n`;
  message += `• Series: ${items.filter(item => item.type === 'tv').length}\n`;
  message += `• Novelas: ${items.filter(item => item.type === 'novel').length}\n`;
  if (cashItems.length > 0) {
    message += `• Pago en efectivo: ${cashItems.length} elementos\n`;
  }
  if (transferItems.length > 0) {
    message += `• Pago por transferencia: ${transferItems.length} elementos\n`;
  }
  message += `• Tipo de entrega: ${pickupLocation ? 'Recogida en local' : 'Entrega a domicilio'}\n\n`;
  
  message += `💼 *CONFIGURACIÓN DE PRECIOS APLICADA:*\n`;
  message += `• Películas: $${currentPrices.moviePrice.toLocaleString()} CUP\n`;
  message += `• Series: $${currentPrices.seriesPrice.toLocaleString()} CUP por temporada\n`;
  message += `• Novelas: $${currentPrices.novelPricePerChapter.toLocaleString()} CUP por capítulo\n`;
  message += `• Recargo transferencia: ${transferFeePercentage}%\n\n`;
  
  message += `📱 *Enviado desde:* TV a la Carta App\n`;
  message += `⏰ *Fecha y hora:* ${new Date().toLocaleString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })}\n`;
  message += `🌟 *¡Gracias por elegir TV a la Carta!*`;
  
  const phoneNumber = '5354690878'; // Número de WhatsApp
  
  // Usar el servicio universal mejorado para abrir WhatsApp
  universalWhatsAppService.sendMessage(phoneNumber, message).then(success => {
    if (!success) {
      console.warn('WhatsApp could not be opened automatically');
    }
  }).catch(error => {
    console.error('Error sending WhatsApp message:', error);
  });
}