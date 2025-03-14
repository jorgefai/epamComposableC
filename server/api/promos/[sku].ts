import { defineEventHandler } from 'h3'
import axios from 'axios'

type Layout = {
  sku: string
  promos: {
    text: string
    order: number
  }[]
}

type Params = {
  sku: string
}

export default defineEventHandler(async (event) => {
  const { sku } = event.context.params as Params
  const deliveryToken = 'cs6907f4b790a4e442b64a2382'
  const apiKey = 'blt24cc51490c3aa1fa'

  const contentstackUrl = 'https://cdn.contentstack.io/v3/content_types/productepam/entries'

  try {
    const response = await axios.get(contentstackUrl, {
      headers: {
        'api_key': apiKey,
        'access_token': deliveryToken,
      },
      params: {
        'query[url]': `/${sku}`,
      },
    })

    const entry = response.data.entries?.[0]

    if (!entry) {
      return { error: 'Entry not found' }
    }

    const promos = entry.promo_section.map((promo: any, index: number) => ({
      order: index + 1,
      text: `
        <div class="p-4 my-2 flex h-[300px] shadow bg-lime-100 rounded-xl">
          <div class="flex-grow">
            <h2 class="text-2xl font-serif">${promo.promo_text?.title || 'Promo Title'}</h2>
            <p>${promo.promo_text?.promo_description || 'Promo Description'}</p>
          </div>
          <div>
            <img src="${promo.promo_images?.image[0]?.url}" alt="promo" class="h-[100%] rounded-xl" />
          </div>
        </div>
      `,
    }))

    const result: Layout = {
      sku,
      promos,
    }

    return result
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'message' in error) {
      const typedError = error as { message: string }
      console.error(typedError.message)
    } else {
      console.error('Unknown error')
    }
  }
})
