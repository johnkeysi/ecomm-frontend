<!-- app/pages/products.vue — Product Management (Dark & Modern design, matches the Homepage) -->
<template>
  <!-- Same custom dark theme as the Homepage (defined in nuxt.config.ts) -->
  <v-theme-provider theme="shopkartDark" with-background>
    <v-layout class="product-layout">
      <!-- ========================================
           APP BAR (glass effect, same as Homepage)
      ========================================= -->
      <v-app-bar flat height="72" class="glass-bar">
        <v-container class="d-flex align-center">
          <NuxtLink to="/" class="logo-link d-flex align-center ga-2">
            <div class="logo-mark">
              <v-icon icon="mdi-cart" size="22" color="black" />
            </div>
            <span class="text-h6 font-weight-black text-white logo-text">
              SHOP<span class="text-gradient">KART</span>
            </span>
          </NuxtLink>

          <v-spacer />

          <v-btn to="/" variant="text" class="nav-btn" prepend-icon="mdi-home-outline">
            <span class="d-none d-sm-inline">Home</span>
          </v-btn>

          <v-btn
            color="primary"
            variant="tonal"
            rounded="pill"
            class="ml-2 nav-active"
            prepend-icon="mdi-view-dashboard-outline"
          >
            <span class="d-none d-sm-inline">Manage Products</span>
          </v-btn>
        </v-container>
      </v-app-bar>

      <v-main class="product-page">
        <div class="page-glow" />

        <v-container class="py-10 position-relative">
          <!-- ========================================
               PAGE HEADER + ADD BUTTON
          ========================================= -->
          <div class="d-flex flex-wrap align-end justify-space-between ga-4 mb-8">
            <div>
              <div class="section-label">Admin</div>
              <h1 class="page-title">Product Management</h1>
              <p class="text-medium-emphasis mt-1 mb-0">
                Manage your e-commerce products
              </p>
            </div>

            <v-btn
              color="primary"
              prepend-icon="mdi-plus"
              size="large"
              rounded="pill"
              class="glow-btn px-6"
              @click="openCreateDialog"
            >
              Add Product
            </v-btn>
          </div>

          <!-- ========================================
               SEARCH
          ========================================= -->
          <div class="panel pa-4 mb-6">
            <v-text-field
              v-model="search"
              placeholder="Search product"
              prepend-inner-icon="mdi-magnify"
              variant="solo-filled"
              flat
              rounded="pill"
              density="comfortable"
              clearable
              hide-details
              class="search-field"
            />
          </div>

          <!-- ========================================
               LOADING + EMPTY STATES
          ========================================= -->
          <div v-if="loading" class="text-center py-16">
            <v-progress-circular indeterminate color="primary" size="50" width="3" />
            <div class="mt-4 text-medium-emphasis">Loading products...</div>
          </div>

          <div
            v-else-if="filteredProducts.length === 0"
            class="panel text-center py-16"
          >
            <div class="empty-icon mx-auto">
              <v-icon icon="mdi-package-variant" size="48" color="primary" />
            </div>
            <h3 class="mt-5">No Products Found</h3>
            <p class="text-medium-emphasis mt-2">
              Add your first product or try another search.
            </p>
          </div>

          <!-- ========================================
               PRODUCT TABLE
          ========================================= -->
          <div v-else class="panel product-table-card">
            <v-table class="dark-table">
              <thead>
                <tr>
                  <th>Image</th>
                  <th>Name</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Status</th>
                  <th class="text-center">Actions</th>
                </tr>
              </thead>

              <tbody>
                <tr v-for="product in filteredProducts" :key="product.documentId">
                  <td>
                    <v-avatar rounded="lg" size="64" class="my-2 img-frame">
                      <v-img
                        v-if="product.image"
                        :src="getImageUrl(product.image)"
                        :alt="product.name"
                        cover
                      />
                      <v-icon v-else icon="mdi-image-off" color="grey" />
                    </v-avatar>
                  </td>

                  <td>
                    <div class="font-weight-bold text-white">{{ product.name }}</div>
                    <div class="description-text text-medium-emphasis">
                      {{ product.description || 'No description' }}
                    </div>
                  </td>

                  <td>
                    <span class="category-tag">{{ product.category || 'Uncategorized' }}</span>
                  </td>

                  <td class="price">{{ formatPrice(product.price) }}</td>

                  <td>
                    <v-chip :color="getStockColor(product.stock)" variant="tonal" size="small">
                      <v-icon icon="mdi-circle" size="8" start />
                      {{ product.stock }}
                    </v-chip>
                  </td>

                  <td>
                    <v-chip :color="product.is_active ? 'success' : 'error'" variant="tonal" size="small">
                      {{ product.is_active ? 'Active' : 'Inactive' }}
                    </v-chip>
                  </td>

                  <td>
                    <div class="d-flex justify-center ga-1">
                      <v-btn icon="mdi-eye-outline" variant="text" color="info" size="small" @click="viewProduct(product)" />
                      <v-btn icon="mdi-pencil-outline" variant="text" color="primary" size="small" @click="openEditDialog(product)" />
                      <v-btn icon="mdi-trash-can-outline" variant="text" color="error" size="small" @click="openDeleteDialog(product)" />
                    </div>
                  </td>
                </tr>
              </tbody>
            </v-table>
          </div>

          <!-- ========================================
               CREATE / EDIT DIALOG
          ========================================= -->
          <v-dialog v-model="productDialog" max-width="700" persistent scrollable>
            <v-card rounded="xl" class="dialog-card">
              <v-card-title class="d-flex align-center justify-space-between pa-6">
                <span class="text-h5 font-weight-black">
                  <v-icon :icon="isEditing ? 'mdi-pencil-outline' : 'mdi-plus-circle-outline'" color="primary" class="mr-1" />
                  {{ isEditing ? 'Edit Product' : 'Add Product' }}
                </span>
                <v-btn icon="mdi-close" variant="text" @click="closeProductDialog" />
              </v-card-title>

              <v-divider />

              <v-card-text class="pa-6">
                <v-form ref="productForm" @submit.prevent="saveProduct">
                  <div v-if="imagePreview || currentImage" class="image-preview mb-4">
                    <v-img :src="imagePreview || getImageUrl(currentImage)" height="220" contain />
                  </div>

                  <v-file-input
                    v-model="selectedFile"
                    label="Select Product Image"
                    variant="outlined"
                    accept="image/*"
                    prepend-icon=""
                    prepend-inner-icon="mdi-image-outline"
                    @update:model-value="handleImageChange"
                  />

                  <v-text-field
                    v-model="form.name"
                    label="Product Name"
                    variant="outlined"
                    :rules="[(value) => !!value || 'Product name is required']"
                  />

                  <v-textarea v-model="form.description" label="Description" variant="outlined" rows="3" />

                  <v-row>
                    <v-col cols="12" md="6">
                      <v-text-field
                        v-model.number="form.price"
                        label="Price"
                        type="number"
                        variant="outlined"
                        prefix="₱"
                        :rules="priceRules"
                      />
                    </v-col>
                    <v-col cols="12" md="6">
                      <v-text-field
                        v-model.number="form.stock"
                        label="Stock"
                        type="number"
                        variant="outlined"
                        :rules="stockRules"
                      />
                    </v-col>
                  </v-row>

                  <v-select v-model="form.category" :items="categories" label="Category" variant="outlined" />
                  <v-switch v-model="form.is_active" label="Active Product" color="primary" inset />
                </v-form>
              </v-card-text>

              <v-divider />

              <v-card-actions class="pa-6">
                <v-spacer />
                <v-btn variant="text" rounded="pill" @click="closeProductDialog">Cancel</v-btn>
                <v-btn color="primary" variant="flat" rounded="pill" class="glow-btn px-6" :loading="saving" @click="saveProduct">
                  {{ isEditing ? 'Update Product' : 'Save Product' }}
                </v-btn>
              </v-card-actions>
            </v-card>
          </v-dialog>

          <!-- ========================================
               VIEW PRODUCT DIALOG
          ========================================= -->
          <v-dialog v-model="viewDialog" max-width="600">
            <v-card v-if="selectedProduct" rounded="xl" class="dialog-card">
              <!-- PRODUCT IMAGE -->
              <v-img
                v-if="selectedProduct.image"
                :src="getImageUrl(selectedProduct.image)"
                height="320"
                contain
                class="product-view-image"
              />

              <!-- NO IMAGE PLACEHOLDER -->
              <div
                v-else
                class="d-flex align-center justify-center product-view-image"
                style="height: 250px"
              >
                <v-icon icon="mdi-image-off" size="80" color="grey-darken-1" />
              </div>

              <!-- PRODUCT INFORMATION -->
              <v-card-text class="pa-6">
                <div class="d-flex align-start justify-space-between ga-4">
                  <div>
                    <h2 class="text-h5 font-weight-black text-white">
                      {{ selectedProduct.name }}
                    </h2>

                    <span class="category-tag d-inline-block mt-2">
                      {{ selectedProduct.category || 'Uncategorized' }}
                    </span>
                  </div>

                  <v-chip
                    :color="selectedProduct.is_active ? 'success' : 'error'"
                    variant="tonal"
                  >
                    {{ selectedProduct.is_active ? 'Active' : 'Inactive' }}
                  </v-chip>
                </div>

                <p class="mt-5 text-medium-emphasis">
                  {{ selectedProduct.description || 'No product description.' }}
                </p>

                <v-divider class="my-5" />

                <v-row>
                  <v-col cols="6">
                    <div class="text-caption text-medium-emphasis">Price</div>
                    <div class="text-h5 font-weight-black text-gradient">
                      {{ formatPrice(selectedProduct.price) }}
                    </div>
                  </v-col>

                  <v-col cols="6">
                    <div class="text-caption text-medium-emphasis">Stock</div>
                    <div class="text-h6 font-weight-bold text-white">
                      {{ selectedProduct.stock }} units
                    </div>
                  </v-col>
                </v-row>
              </v-card-text>

              <v-card-actions class="pa-6 pt-0">
                <v-spacer />
                <v-btn color="primary" variant="tonal" rounded="pill" @click="viewDialog = false">
                  Close
                </v-btn>
              </v-card-actions>
            </v-card>
          </v-dialog>

          <!-- ========================================
               DELETE CONFIRMATION DIALOG
          ========================================= -->
          <v-dialog v-model="deleteDialog" max-width="450">
            <v-card rounded="xl" class="dialog-card dialog-danger">
              <v-card-text class="text-center pa-8">
                <div class="delete-icon mx-auto">
                  <v-icon icon="mdi-delete-alert-outline" size="44" color="error" />
                </div>
                <h2 class="text-h5 font-weight-black mt-4 text-white">Delete Product?</h2>
                <p class="text-medium-emphasis mt-3">
                  Are you sure you want to delete
                  <strong class="text-white">{{ selectedProduct?.name }}</strong>?
                </p>
              </v-card-text>

              <v-card-actions class="pa-6 pt-0 ga-2">
                <v-btn variant="tonal" rounded="pill" class="flex-grow-1" @click="deleteDialog = false">Cancel</v-btn>
                <v-btn color="error" variant="flat" rounded="pill" class="flex-grow-1" :loading="deleting" @click="deleteProduct">
                  Delete
                </v-btn>
              </v-card-actions>
            </v-card>
          </v-dialog>

          <!-- ========================================
               SNACKBAR
          ========================================= -->
          <v-snackbar
            v-model="snackbar.show"
            :color="snackbar.color"
            timeout="3000"
            location="top right"
            rounded="pill"
          >
            {{ snackbar.message }}
            <template #actions>
              <v-btn variant="text" icon="mdi-close" @click="snackbar.show = false" />
            </template>
          </v-snackbar>
        </v-container>
      </v-main>
    </v-layout>
  </v-theme-provider>
</template>

<script setup lang="ts">
// @ts-nocheck

/* ========================================
   PAGE SETTINGS + STRAPI URL (Step 6)
========================================= */
definePageMeta({
  layout: false,
  alias: ['/product'],
})

useHead({
  title: 'Product Management | ShopKart',
})

const config = useRuntimeConfig()
const STRAPI_URL = config.public.strapiUrl

/* ========================================
   STATE VARIABLES (Step 9)
========================================= */
const products = ref([])
const loading = ref(false)
const search = ref('')

const productDialog = ref(false)
const viewDialog = ref(false)
const deleteDialog = ref(false)

const selectedProduct = ref(null)
const isEditing = ref(false)
const saving = ref(false)
const deleting = ref(false)

const productForm = ref(null)

const form = reactive({
  name: '',
  description: '',
  price: 0,
  stock: 0,
  category: '',
  is_active: true,
})

const selectedFile = ref(null)
const imagePreview = ref(null)
const currentImage = ref(null)

/* ========================================
   CATEGORIES, VALIDATION, SNACKBAR (Step 10)
========================================= */
const categories = [
  'Electronics',
  'Fashion',
  'Sports',
  'Bags',
  'Beauty',
  'Home & Living',
  'Toys',
]

const priceRules = [
  (value) => value >= 0 || 'Price cannot be negative',
]

const stockRules = [
  (value) => value >= 0 || 'Stock cannot be negative',
]

const snackbar = reactive({
  show: false,
  message: '',
  color: 'success',
})

/* ========================================
   SEARCH FILTER (Step 12)
========================================= */
const filteredProducts = computed(() => {
  if (!search.value) {
    return products.value
  }

  const keyword = search.value.toLowerCase().trim()

  return products.value.filter((product) => {
    const name = product.name?.toLowerCase() || ''
    const description = product.description?.toLowerCase() || ''
    const category = product.category?.toLowerCase() || ''

    return (
      name.includes(keyword) ||
      description.includes(keyword) ||
      category.includes(keyword)
    )
  })
})

/* ========================================
   READ (Step 13)
========================================= */
async function getProducts() {
  loading.value = true

  try {
    const response = await $fetch(`${STRAPI_URL}/api/products`, {
      query: {
        populate: 'image',
        sort: 'createdAt:desc',
        'pagination[pageSize]': 100,
      },
    })

    products.value = response.data || []
  } catch (error) {
    console.error('Error fetching products:', error)
    showSnackbar('Unable to load products.', 'error')
  } finally {
    loading.value = false
  }
}

/* ========================================
   DIALOG OPENERS (Steps 18, 22, 25, 27.2)
========================================= */
function openCreateDialog() {
  resetForm()
  isEditing.value = false
  selectedProduct.value = null
  productDialog.value = true
}

function openEditDialog(product) {
  selectedProduct.value = product
  isEditing.value = true

  form.name = product.name || ''
  form.description = product.description || ''
  form.price = Number(product.price) || 0
  form.stock = Number(product.stock) || 0
  form.category = product.category || ''
  form.is_active = product.is_active ?? true

  currentImage.value = product.image || null
  selectedFile.value = null
  imagePreview.value = null
  productDialog.value = true
}

function openDeleteDialog(product) {
  selectedProduct.value = product
  deleteDialog.value = true
}

function viewProduct(product) {
  selectedProduct.value = product
  viewDialog.value = true
}

/* ========================================
   SAVE: CREATE OR UPDATE (Step 24)
========================================= */
async function saveProduct() {
  const validation = await productForm.value?.validate()
  if (validation && !validation.valid) return

  saving.value = true

  try {
    if (isEditing.value) {
      await updateProduct()
    } else {
      await createProduct()
    }

    closeProductDialog()
    await getProducts()
  } catch (error) {
    console.error('Error saving product:', error)
    showSnackbar(getErrorMessage(error), 'error')
  } finally {
    saving.value = false
  }
}

/* ========================================
   CREATE (Step 19)
========================================= */
async function createProduct() {
  const response = await $fetch(`${STRAPI_URL}/api/products`, {
    method: 'POST',
    body: {
      data: {
        name: form.name,
        description: form.description,
        price: Number(form.price),
        stock: Number(form.stock),
        category: form.category,
        is_active: form.is_active,
      },
    },
  })

  if (selectedFile.value && response.data) {
    await uploadProductImage(response.data.id)
  }

  showSnackbar('Product created successfully.', 'success')
}

/* ========================================
   IMAGE UPLOAD (Step 20)
========================================= */
async function uploadProductImage(productId) {
  const file = getSelectedFile()
  if (!file) return

  const formData = new FormData()
  formData.append('files', file)
  formData.append('ref', 'api::product.product')
  formData.append('refId', String(productId))
  formData.append('field', 'image')

  // Do NOT set a Content-Type header here; the browser adds the
  // multipart/form-data boundary automatically.
  await $fetch(`${STRAPI_URL}/api/upload`, {
    method: 'POST',
    body: formData,
  })
}

/* ========================================
   UPDATE (Step 23)
========================================= */
async function updateProduct() {
  if (!selectedProduct.value) return

  const response = await $fetch(
    `${STRAPI_URL}/api/products/${selectedProduct.value.documentId}`,
    {
      method: 'PUT',
      body: {
        data: {
          name: form.name,
          description: form.description,
          price: Number(form.price),
          stock: Number(form.stock),
          category: form.category,
          is_active: form.is_active,
        },
      },
    }
  )

  if (selectedFile.value && response.data) {
    await uploadProductImage(response.data.id)
  }

  showSnackbar('Product updated successfully.', 'success')
}

/* ========================================
   DELETE (Step 25)
========================================= */
async function deleteProduct() {
  if (!selectedProduct.value) return

  deleting.value = true

  try {
    await $fetch(
      `${STRAPI_URL}/api/products/${selectedProduct.value.documentId}`,
      { method: 'DELETE' }
    )

    deleteDialog.value = false
    showSnackbar('Product deleted successfully.', 'success')
    await getProducts()
  } catch (error) {
    showSnackbar(getErrorMessage(error), 'error')
  } finally {
    deleting.value = false
  }
}

/* ========================================
   IMAGE HELPERS (Steps 16, 21)
========================================= */
function getImageUrl(image) {
  if (!image?.url) return ''

  if (image.url.startsWith('http://') || image.url.startsWith('https://')) {
    return image.url
  }

  return `${STRAPI_URL}${image.url}`
}

function handleImageChange(value) {
  const file = getFileFromValue(value)

  if (!file) {
    imagePreview.value = null
    return
  }

  if (imagePreview.value) {
    URL.revokeObjectURL(imagePreview.value)
  }

  imagePreview.value = URL.createObjectURL(file)
}

function getSelectedFile() {
  return getFileFromValue(selectedFile.value)
}

function getFileFromValue(value) {
  if (!value) return null
  if (value instanceof File) return value
  if (Array.isArray(value) && value.length > 0) return value[0]
  return null
}

/* ========================================
   FORMAT HELPERS (Step 16)
========================================= */
function formatPrice(price) {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
  }).format(Number(price || 0))
}

function getStockColor(stock) {
  if (Number(stock) === 0) return 'error'
  if (Number(stock) <= 5) return 'warning'
  return 'success'
}

/* ========================================
   FEEDBACK HELPERS (Step 27.2)
========================================= */
function showSnackbar(message, color = 'success') {
  snackbar.message = message
  snackbar.color = color
  snackbar.show = true
}

function getErrorMessage(error) {
  return (
    error?.data?.error?.message ||
    error?.data?.message ||
    error?.message ||
    'Something went wrong.'
  )
}

/* ========================================
   RESET + CLOSE FORM (Step 28)
========================================= */
function resetForm() {
  form.name = ''
  form.description = ''
  form.price = 0
  form.stock = 0
  form.category = ''
  form.is_active = true

  selectedFile.value = null
  currentImage.value = null

  if (imagePreview.value) {
    URL.revokeObjectURL(imagePreview.value)
  }

  imagePreview.value = null
}

function closeProductDialog() {
  productDialog.value = false
  resetForm()
}

/* ========================================
   LOAD PRODUCTS ON PAGE OPEN (Step 13)
========================================= */
onMounted(() => {
  getProducts()
})
</script>

<style scoped>
/* ========================================
   DARK & MODERN THEME — same tokens as the Homepage
========================================= */
.product-layout {
  --sk-bg: #07090d;
  --sk-surface: #0f141b;
  --sk-surface-2: #151c25;
  --sk-border: rgba(255, 255, 255, 0.08);
  --sk-teal: #14e0b4;
  --sk-cyan: #22d3ee;
  --sk-glow: rgba(20, 224, 180, 0.35);
  min-height: 100vh;
  font-family: 'Inter', 'Segoe UI', Roboto, sans-serif;
}

.product-page {
  position: relative;
  min-height: 100vh;
  background: var(--sk-bg);
  color: #e8edf2;
  overflow: hidden;
}

.page-glow {
  position: absolute;
  width: 520px;
  height: 520px;
  top: -220px;
  right: -160px;
  border-radius: 50%;
  background: rgba(20, 224, 180, 0.18);
  filter: blur(110px);
  pointer-events: none;
}

.text-gradient {
  background: linear-gradient(90deg, var(--sk-teal), var(--sk-cyan));
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

/* ========================================
   APP BAR + LOGO
========================================= */
.glass-bar {
  background: rgba(7, 9, 13, 0.72) !important;
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  border-bottom: 1px solid var(--sk-border);
}

.logo-link {
  text-decoration: none;
  white-space: nowrap;
}

.logo-mark {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: linear-gradient(135deg, var(--sk-teal), var(--sk-cyan));
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 0 18px var(--sk-glow);
}

.logo-text {
  letter-spacing: 2px;
}

.nav-btn {
  text-transform: none;
  letter-spacing: 0;
  color: #aab4bf;
}

.nav-btn:hover {
  color: #ffffff;
}

.nav-active {
  text-transform: none;
  letter-spacing: 0;
  font-weight: 700;
}

/* ========================================
   HEADINGS + BUTTONS
========================================= */
.section-label {
  color: var(--sk-teal);
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 2px;
  text-transform: uppercase;
  margin-bottom: 6px;
}

.page-title {
  font-size: clamp(1.8rem, 3.5vw, 2.5rem);
  font-weight: 800;
  letter-spacing: -0.5px;
  color: #ffffff;
}

.glow-btn {
  text-transform: none;
  letter-spacing: 0;
  font-weight: 700;
  box-shadow: 0 6px 24px var(--sk-glow);
  transition: box-shadow 0.2s ease, transform 0.2s ease;
}

.glow-btn:hover {
  box-shadow: 0 8px 34px rgba(20, 224, 180, 0.55);
  transform: translateY(-1px);
}

/* ========================================
   PANELS, SEARCH, EMPTY STATE
========================================= */
.panel {
  border-radius: 20px;
  background: var(--sk-surface);
  border: 1px solid var(--sk-border);
}

.search-field :deep(.v-field) {
  background: var(--sk-surface-2) !important;
  border: 1px solid var(--sk-border);
}

.empty-icon {
  width: 88px;
  height: 88px;
  border-radius: 50%;
  background: rgba(20, 224, 180, 0.08);
  border: 1px solid rgba(20, 224, 180, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
}

/* ========================================
   PRODUCT TABLE
========================================= */
.product-table-card {
  overflow-x: auto;
}

.dark-table {
  background: transparent !important;
}

.dark-table :deep(thead th) {
  background: var(--sk-surface-2) !important;
  color: #7d8894 !important;
  font-size: 12px !important;
  font-weight: 700 !important;
  letter-spacing: 1px;
  text-transform: uppercase;
  border-bottom: 1px solid var(--sk-border) !important;
}

.dark-table :deep(tbody td) {
  border-bottom: 1px solid var(--sk-border) !important;
}

.dark-table :deep(tbody tr) {
  transition: background 0.15s ease;
}

.dark-table :deep(tbody tr:hover) {
  background: rgba(20, 224, 180, 0.04) !important;
}

.img-frame {
  background: #1a222d;
  border: 1px solid var(--sk-border);
}

.description-text {
  max-width: 320px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 13px;
}

.category-tag {
  padding: 3px 10px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  white-space: nowrap;
  color: var(--sk-teal);
  background: rgba(20, 224, 180, 0.08);
  border: 1px solid rgba(20, 224, 180, 0.35);
}

.price {
  font-weight: 800;
  color: var(--sk-teal);
  white-space: nowrap;
}

/* ========================================
   DIALOGS (teleported, so plain colors are used here)
========================================= */
.dialog-card {
  background: #0f141b !important;
  border: 1px solid rgba(20, 224, 180, 0.2);
}

.dialog-danger {
  border-color: rgba(244, 63, 94, 0.35);
}

.image-preview {
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 14px;
  background: #0b0f14;
}

.product-view-image {
  background: #0b0f14;
}

.category-tag.d-inline-block {
  color: #14e0b4;
  background: rgba(20, 224, 180, 0.08);
  border-color: rgba(20, 224, 180, 0.35);
}

.text-gradient.text-h5 {
  background: linear-gradient(90deg, #14e0b4, #22d3ee);
  -webkit-background-clip: text;
  background-clip: text;
}

.delete-icon {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: rgba(244, 63, 94, 0.1);
  border: 1px solid rgba(244, 63, 94, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>