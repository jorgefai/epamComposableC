import axios from 'axios'
import https from 'https'

interface CartItem {
  qty: number;
}

interface CartData {
  items: CartItem[];
  base_grand_total: number;
}

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const cartId = event.context.params?.id

  if (!cartId) {
    throw createError({ statusCode: 400, statusMessage: 'Cart ID is required' })
  }

  const magentoApiUrl = `https://magento.test/rest/V1/guest-carts/${cartId}`
  const magentoToken = `Bearer ${config.magentoApiToken}`

  const headers = {
    'Authorization': magentoToken,
    'Content-Type': 'application/json',
  }

  const httpsAgent = new https.Agent({ rejectUnauthorized: false })

  if (event.node.req.method === 'GET') {
    try {
      const response = await axios.get(magentoApiUrl, { headers, httpsAgent })
      const cartData: CartData = response.data

      return {
        id: cartId,
        version: 0,
        customerId: null,
        lineItems: cartData.items || [],
        totalPrice: {
          currencyCode: 'USD',
          centAmount: cartData.base_grand_total * 100 || 0,
        },
        totalQuantity: cartData.items?.reduce((acc: number, item: CartItem) => acc + item.qty, 0) || 0,
      }
    } catch (error) {
      console.error('Error al obtener el carrito:', error)
      throw createError({ statusCode: 500, statusMessage: 'Error al obtener el carrito desde Magento' })
    }
  } else if (event.node.req.method === 'PUT') {
    try {
      const body = await readBody(event)

      if (body.action === 'AddLineItem' && body.AddLineItem) {
        const { variantId, quantity } = body.AddLineItem
        if (!variantId || !quantity) {
          throw createError({ statusCode: 400, statusMessage: 'variantId and quantity are required' })
        }

        const payload = {
          cartItem: {
            sku: variantId,
            qty: quantity,
            quote_id: cartId,
          },
        }

        const response = await axios.post(`${magentoApiUrl}/items`, payload, { headers, httpsAgent })
        return response.data
      }

      if (body.action === 'ChangeLineItemQuantity' && body.ChangeLineItemQuantity) {
        const { lineItemId, quantity } = body.ChangeLineItemQuantity
        if (!lineItemId || !quantity) {
          throw createError({ statusCode: 400, statusMessage: 'lineItemId and quantity are required' })
        }

        const payload = {
          cartItem: {
            item_id: lineItemId,
            qty: quantity,
            quote_id: cartId,
          },
        }

        const response = await axios.put(`${magentoApiUrl}/items/${lineItemId}`, payload, { headers, httpsAgent })
        return response.data
      }
      if (body.action === 'RemoveLineItem' && body.RemoveLineItem) {
        const { lineItemId } = body.RemoveLineItem
        if (!lineItemId) {
          throw createError({ statusCode: 400, statusMessage: 'lineItemId is required' })
        }

        const response = await axios.delete(`${magentoApiUrl}/items/${lineItemId}`, { headers, httpsAgent })
        if (response.status === 200) {
          const updatedCartResponse = await axios.get(magentoApiUrl, { headers, httpsAgent })
          const updatedCartData: CartData = updatedCartResponse.data

          return {
            id: cartId,
            version: 0,
            customerId: null,
            lineItems: updatedCartData.items || [],
            totalPrice: {
              currencyCode: 'USD',
              centAmount: updatedCartData.base_grand_total * 100 || 0,
            },
            totalQuantity: updatedCartData.items?.reduce((acc: number, item: CartItem) => acc + item.qty, 0) || 0,
          }
        } else {
          throw createError({ statusCode: 500, statusMessage: 'Error al eliminar el artículo del carrito' })
        }
      }

      if (body.action === 'SetShippingAddress' && body.SetShippingAddress) {
        const { SetShippingAddress } = body
        const telephone = SetShippingAddress.telephone || '5555555555'
        const payload = {
            addressInformation: {
              shipping_address: {
                country_id: SetShippingAddress.country,
                firstname: SetShippingAddress.firstName,
                lastname: SetShippingAddress.lastName,
                street: [`${SetShippingAddress.streetName} ${SetShippingAddress.streetNumber}`],
                postcode: SetShippingAddress.postalCode,
                city: SetShippingAddress.city,
                region: SetShippingAddress.region,
                email: SetShippingAddress.email,
                telephone,
              },
              billing_address: {
                country_id: SetShippingAddress.country,
                firstname: SetShippingAddress.firstName,
                lastname: SetShippingAddress.lastName,
                street: [`${SetShippingAddress.streetName} ${SetShippingAddress.streetNumber}`],
                postcode: SetShippingAddress.postalCode,
                city: SetShippingAddress.city,
                region: SetShippingAddress.region,
                email: SetShippingAddress.email,
                telephone,
              },
              shipping_method_code: 'flatrate',
              shipping_carrier_code: 'flatrate',
            },
          }

        const response = await axios.post(`${magentoApiUrl}/shipping-information`, payload, { headers, httpsAgent })
        return response.data
      }

      throw createError({ statusCode: 400, statusMessage: 'Invalid action' })
    } catch (error) {
      console.error('Error al actualizar el carrito:', error)
      throw createError({ statusCode: 500, statusMessage: 'Error al actualizar el carrito en Magento' })
    }
  } else {
    throw createError({ statusCode: 405, statusMessage: 'Method Not Allowed' })
  }
})
