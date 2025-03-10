import axios from 'axios'
import https from 'https'  
import { config } from '~/server/config'

export default defineEventHandler(async (event) => {
    const MAGENTO_API_URL = 'https://magento.test/rest/V1/categories'
    const magentoToken = `Bearer ${config.magentoApiToken}`

    try {
        const agent = new https.Agent({
            rejectUnauthorized: false
        })

        const response = await axios.get(MAGENTO_API_URL, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': magentoToken
            },
            httpsAgent: agent
        })

        return processCategories(response.data)
    } catch (error) {
        console.error('Error fetching categories:', error)
        return { error: 'Failed to fetch categories' }
    }
})

function processCategories(data: any) {
    if (!data || !data.children_data) {
        return []
    }

    return data.children_data.map((category: any) => ({
        id: category.id,
        name: category.name,
        description: category.description || '',
        slug: category.id.toString(),
        parent: category.parent_id || null,
        ancestors: []
    }))
}
