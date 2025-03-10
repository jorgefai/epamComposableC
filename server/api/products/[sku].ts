import axios from 'axios'
import https from 'https'
import { config } from '~/server/config'

export default defineEventHandler(async (event) => {
  if (!event.context.params || !event.context.params.sku) {
    throw createError({
      statusCode: 400,
      statusMessage: 'SKU no proporcionado',
    })
  }
  const sku = event.context.params.sku

  if (!sku) {
    throw new Error('SKU no proporcionado')
  }

  const magentoApiUrl = `https://magento.test/rest/V1/products/${sku}`
  const magentoToken = `Bearer ${config.magentoApiToken}`

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

    // Transformar la respuesta para que tenga el formato deseado
    const transformedResponse = {
      id: response.data.id,
      sku: response.data.sku,
      name: response.data.name,
      attribute_set_id: response.data.attribute_set_id,
      price: response.data.price,
      status: response.data.status,
      visibility: response.data.visibility,
      type_id: response.data.type_id,
      created_at: response.data.created_at,
      updated_at: response.data.updated_at,
      extension_attributes: {
        website_ids: response.data.extension_attributes.website_ids,
        category_links: response.data.extension_attributes.category_links,
        stock_item: {
          item_id: response.data.extension_attributes.stock_item.item_id,
          product_id: response.data.extension_attributes.stock_item.product_id,
          stock_id: response.data.extension_attributes.stock_item.stock_id,
          qty: response.data.extension_attributes.stock_item.qty,
          is_in_stock: response.data.extension_attributes.stock_item.is_in_stock,
          is_qty_decimal: response.data.extension_attributes.stock_item.is_qty_decimal,
          show_default_notification_message: response.data.extension_attributes.stock_item.show_default_notification_message,
          use_config_min_qty: response.data.extension_attributes.stock_item.use_config_min_qty,
          min_qty: response.data.extension_attributes.stock_item.min_qty,
          use_config_min_sale_qty: response.data.extension_attributes.stock_item.use_config_min_sale_qty,
          min_sale_qty: response.data.extension_attributes.stock_item.min_sale_qty,
          use_config_max_sale_qty: response.data.extension_attributes.stock_item.use_config_max_sale_qty,
          max_sale_qty: response.data.extension_attributes.stock_item.max_sale_qty,
          use_config_backorders: response.data.extension_attributes.stock_item.use_config_backorders,
          backorders: response.data.extension_attributes.stock_item.backorders,
          use_config_notify_stock_qty: response.data.extension_attributes.stock_item.use_config_notify_stock_qty,
          notify_stock_qty: response.data.extension_attributes.stock_item.notify_stock_qty,
          use_config_qty_increments: response.data.extension_attributes.stock_item.use_config_qty_increments,
          qty_increments: response.data.extension_attributes.stock_item.qty_increments,
          use_config_enable_qty_inc: response.data.extension_attributes.stock_item.use_config_enable_qty_inc,
          enable_qty_increments: response.data.extension_attributes.stock_item.enable_qty_increments,
          use_config_manage_stock: response.data.extension_attributes.stock_item.use_config_manage_stock,
          manage_stock: response.data.extension_attributes.stock_item.manage_stock,
          low_stock_date: response.data.extension_attributes.stock_item.low_stock_date,
          is_decimal_divided: response.data.extension_attributes.stock_item.is_decimal_divided,
          stock_status_changed_auto: response.data.extension_attributes.stock_item.stock_status_changed_auto
        }
      },
      product_links: response.data.product_links,
      options: response.data.options,
      media_gallery_entries: response.data.media_gallery_entries,
      tier_prices: response.data.tier_prices,
      custom_attributes: response.data.custom_attributes
    }

    // Retornar la respuesta transformada al cliente
    return transformedResponse
  } catch (error) {
    console.error('Error al obtener el producto desde Magento:', error)
    throw new Error('Error al obtener datos desde Magento')
  }
})
