import axios from 'axios'
import https from 'https'
import { config } from '~/server/config'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const categoryId = query.categoryId
  const page = query.page || 1 // Default to 1 if no 'page' is provided
  const offset = query.offset || 10 // Default to 10 if no 'offset' is provided
  const magentoToken = `Bearer ${config.magentoApiToken}`

  if (!categoryId) {
    throw new Error('El parámetro "categoryId" es obligatorio.')
  }

  const magentoApiUrl = `https://magento.test/rest/V1/products?searchCriteria[filter_groups][0][filters][0][field]=category_id&searchCriteria[filter_groups][0][filters][0][value]=${categoryId}&searchCriteria[currentPage]=${page}&searchCriteria[pageSize]=${offset}`

  const headers = {
    'Authorization': magentoToken,
    'Content-Type': 'application/json',
  }

  const agent = new https.Agent({
    rejectUnauthorized: false,
  })

  try {
    const response = await axios.get(magentoApiUrl, {
      headers,
      httpsAgent: agent,
    })

    return response.data
  } catch (error) {
    console.error('Error al obtener productos desde Magento:', error)
    throw new Error('Error al obtener datos desde Magento')
  }
})
