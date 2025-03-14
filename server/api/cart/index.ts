import axios from 'axios'
import https from 'https'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()

  const magentoApiUrl = 'https://magento.test/rest/V1/guest-carts'
  const magentoToken = `Bearer ${config.magentoApiToken}`

  try {
    const response = await axios.post(
      magentoApiUrl,
      {},
      {
        headers: {
          'Authorization': magentoToken,
          'Content-Type': 'application/json',
        },
        httpsAgent: new https.Agent({ rejectUnauthorized: false }),
      }
    )

    const cartId = response.data
    return {
      id: cartId,
      version: 0,
      customerId: null, 
      lineItems: [],
      totalPrice: {
        currencyCode: 'USD',
        centAmount: 0,
      },
      totalQuantity: 0,
    }
  } catch (error) {
    console.error('Error al crear el carrito:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Error al crear el carrito en Magento',
    })
  }
})
