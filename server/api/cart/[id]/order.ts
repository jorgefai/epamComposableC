import https from 'https'
import axios from 'axios'
import { defineEventHandler, H3Event } from 'h3'
import { config } from '~/server/config'

export default defineEventHandler(async (event: H3Event) => {
  const { id } = event.context.params as { id?: string }
  console.error('Cart ID:', id)

  if (!id) {
    return {
      statusCode: 400,
      body: { message: 'Cart ID is required.' },
    }
  }

  const magentoToken = `Bearer ${config.magentoApiToken}`

  try {
    const magentoUrl = `https://magento.test/rest/V1/guest-carts/${id}/order`
    console.error('Magento URL:', magentoUrl)

    const agent = new https.Agent({
      rejectUnauthorized: false,
    })

    const payload = {
      paymentMethod: {
        method: 'checkmo',
      },
    }

    const response = await axios.put(
      magentoUrl,
      payload,
      {
        headers: {
          Authorization: magentoToken,
          'Content-Type': 'application/json',
        },
        httpsAgent: agent,
      }
    )

    console.log('Order created successfully:', response.data)

    return {
      statusCode: 200,
      body: {
        message: 'Order created successfully.',
        orderData: response.data,
      },
    }
  } catch (error: any) {
    console.error('Error creating order:', error.response?.data || error.message)

    if (error.response?.status === 500 && error.response?.data?.message === 'Request does not match any route.') {
      return {
        statusCode: 500,
        body: { message: 'The cart does not exist or the route is incorrect.' },
      }
    }

    return {
      statusCode: 500,
      body: {
        message: 'An error occurred while creating the order.',
        error: error.response?.data || error.message,
      },
    }
  }
})
