<template>
  <div class="p-4 xl:p-6 md:border md:border-neutral-100 md:shadow-lg md:rounded-md md:sticky md:top-20">
    <!--    <div-->
    <!--      class="inline-flex items-center justify-center text-sm font-medium text-white bg-secondary-600 py-1.5 px-3 mb-4"-->
    <!--    >-->
    <!--      <SfIconSell size="sm" class="mr-1.5" />-->
    <!--      Sale-->
    <!--    </div>-->
    <h1 class="mb-1 font-bold typography-headline-4">
      {{ product.name }}
    </h1>
    <strong class="block font-bold typography-headline-3">{{
      formatCurrency(
        product.masterVariant.price.centAmount,
        product.masterVariant.price.currencyCode
      )
    }}</strong>
    <div class="inline-flex items-center mt-4 mb-2">
      <SfRating size="xs" :value="3" :max="5" />
      <SfCounter class="ml-1" size="xs">
        123
      </SfCounter>
      <SfLink href="#" variant="secondary" class="ml-2 text-xs text-neutral-500">
        123 reviews
      </SfLink>
    </div>
    <div class="mb-4 font-normal typography-text-sm" v-html="product.description"></div>
    <div class="py-4 mb-4 border-gray-200 border-y">
      <!--      <div-->
      <!--        class="bg-primary-100 text-primary-700 flex justify-center gap-1.5 py-1.5 typography-text-sm items-center mb-4 rounded-md"-->
      <!--      >-->
      <!--        <SfIconShoppingCartCheckout />-->
      <!--        1 in cart-->
      <!--      </div>-->
      <div class="items-start xs:flex">
        <div class="flex flex-col items-stretch xs:items-center xs:inline-flex">
          <div class="flex border border-neutral-300 rounded-md">
            <SfButton variant="tertiary" :disabled="count <= min" square class="rounded-r-none p-3"
              :aria-controls="inputId" aria-label="Decrease value" @click="dec()">
              <SfIconRemove />
            </SfButton>
            <input :id="inputId" v-model="count" type="number"
              class="grow appearance-none mx-2 w-8 text-center bg-transparent font-medium [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-inner-spin-button]:display-none [&::-webkit-inner-spin-button]:m-0 [&::-webkit-outer-spin-button]:display-none [&::-webkit-outer-spin-button]:m-0 [-moz-appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none disabled:placeholder-disabled-900 focus-visible:outline focus-visible:outline-offset focus-visible:rounded-sm"
              :min="min" :max="max" @input="handleOnChange" />
            <SfButton variant="tertiary" :disabled="count >= max" square class="rounded-l-none p-3"
              :aria-controls="inputId" aria-label="Increase value" @click="inc()">
              <SfIconAdd />
            </SfButton>
          </div>
        </div>
        <SfButton size="lg" class="w-full xs:ml-4"
          @click="addToCart"
        >
          <template #prefix>
            <SfIconShoppingCart />
          </template>
          Add to cart
        </SfButton>
      </div>
    </div>
    <div class="flex first:mt-4">
      <SfIconPackage class="mr-1 text-neutral-500" />
      <p class="text-sm">
        Free shipping, arrives by Thu, Apr 7. Want it faster?
        <SfLink href="#" variant="secondary" class="mx-1">
          Add an address
        </SfLink>
        to see options
      </p>
    </div>
    <div class="flex mt-4">
      <SfIconWarehouse class="mr-1 text-neutral-500" />
      <p class="text-sm">
        Pickup not available at your shop.
        <SfLink href="#" variant="secondary" class="ml-1">
          Check availability nearby
        </SfLink>
      </p>
    </div>
    <div class="flex mt-4">
      <SfIconSafetyCheck class="mr-1 text-neutral-500" />
      <p class="text-sm">
        Free 30-days returns.
        <SfLink href="#" variant="secondary" class="ml-1">
          Details
        </SfLink>
      </p>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import {
  SfButton,
  SfCounter,
  SfLink,
  SfRating,
  SfIconSafetyCheck,
  SfIconWarehouse,
  SfIconPackage,
  SfIconShoppingCart,
  SfIconAdd,
  SfIconRemove,
  useId,
} from '@storefront-ui/vue'
import { clamp } from '@storefront-ui/shared'
import { useCounter } from '@vueuse/core'
import type ProductDTO from '~/DTO/Product'
import { formatCurrency } from '~/utils/helpers'
import { useCartStore, useAlertsStore } from '@/stores'
import { ALERT_TYPE } from '~/types/enums'

const props = defineProps<{
  product: ProductDTO
}>()

const cart = useCartStore()
const alerts = useAlertsStore()
const inputId = useId()
const min = ref(1)
const max = ref(999)
const { count, inc, dec, set } = useCounter(1, { min: min.value, max: max.value })
function handleOnChange(event: Event) {
  const currentValue = (event.target as HTMLInputElement)?.value
  const nextValue = parseFloat(currentValue)
  set(clamp(nextValue, min.value, max.value))
}

async function addToCart() {
  await cart.addProductToCart(props.product.masterVariant.sku, count.value)
  alerts.addAlert({ message: 'Product added to cart', type: ALERT_TYPE.SUCCESS })
}
</script>
