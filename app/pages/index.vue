<!-- app/pages/index.vue — ShopKart E-Commerce Homepage (Final Exam / Guide 2) — Dark & Modern design -->
<template>
  <!-- v-theme-provider applies the custom "shopkartDark" theme to this page only.
       The Product Management page keeps the default light theme. -->
  <v-theme-provider theme="shopkartDark" with-background>
    <v-layout class="home-layout">
      <!-- ========================================
           APP BAR (glass effect)
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

          <div class="d-none d-md-flex ga-1 mr-2">
            <v-btn variant="text" class="nav-btn" @click="scrollTo('products')">Shop</v-btn>
            <v-btn variant="text" class="nav-btn" @click="scrollTo('categories')">Categories</v-btn>
          </div>

          <!-- Wishlist button with count -->
          <v-btn icon variant="text" @click="wishlistDrawer = true">
            <v-badge :content="wishlist.length" :model-value="wishlist.length > 0" color="error">
              <v-icon icon="mdi-heart-outline" />
            </v-badge>
          </v-btn>

          <!-- Cart button with count -->
          <v-btn icon variant="text" @click="cartDrawer = true">
            <v-badge :content="totalItems" :model-value="totalItems > 0" color="primary">
              <v-icon icon="mdi-shopping-outline" />
            </v-badge>
          </v-btn>

          <!-- Manage Products link (required) -->
          <v-btn
            to="/products"
            variant="outlined"
            color="primary"
            prepend-icon="mdi-view-dashboard-outline"
            class="ml-2 d-none d-sm-flex outline-glow"
            rounded="pill"
          >
            Manage Products
          </v-btn>
          <v-btn
            to="/products"
            icon="mdi-view-dashboard-outline"
            color="primary"
            variant="outlined"
            class="ml-1 d-flex d-sm-none"
          />
        </v-container>
      </v-app-bar>

      <!-- ========================================
           CART DRAWER
      ========================================= -->
      <v-navigation-drawer
        v-model="cartDrawer"
        location="right"
        temporary
        :width="$vuetify.display.xs ? 320 : 400"
        class="dark-drawer"
      >
        <div class="d-flex flex-column fill-height">
          <div class="d-flex align-center justify-space-between pa-5">
            <div class="text-h6 font-weight-bold">
              <v-icon icon="mdi-shopping-outline" color="primary" class="mr-2" />My Cart
              <span class="count-pill ml-1">{{ totalItems }}</span>
            </div>
            <v-btn icon="mdi-close" variant="text" @click="cartDrawer = false" />
          </div>
          <v-divider />

          <!-- Cart totals + Checkout All (shown at the TOP so it's visible right away) -->
          <div v-if="cart.length > 0" class="pa-5 cart-summary-top">
            <div class="d-flex justify-space-between mb-1">
              <span class="text-medium-emphasis">Total Items</span>
              <span class="font-weight-bold">{{ totalItems }}</span>
            </div>
            <div class="d-flex justify-space-between align-center mb-4">
              <span class="text-medium-emphasis">Total Amount</span>
              <span class="text-h5 font-weight-black text-gradient">{{ formatPrice(totalAmount) }}</span>
            </div>
            <v-btn
              color="primary"
              size="large"
              block
              rounded="pill"
              class="glow-btn"
              prepend-icon="mdi-lightning-bolt"
              @click="openCheckout"
            >
              Checkout All
            </v-btn>
          </div>

          <!-- Empty cart -->
          <div v-if="cart.length === 0" class="text-center pa-10 flex-grow-1">
            <div class="empty-icon mx-auto">
              <v-icon icon="mdi-cart-off" size="48" color="primary" />
            </div>
            <p class="mt-5 text-medium-emphasis">Your cart is empty.</p>
            <v-btn class="mt-4" color="primary" variant="tonal" rounded="pill" @click="cartDrawer = false">
              Continue Shopping
            </v-btn>
          </div>

          <!-- Cart items -->
          <div v-else class="flex-grow-1 overflow-y-auto pa-3">
            <div
              v-for="item in cart"
              :key="item.documentId"
              class="cart-item mb-3"
            >
              <div class="d-flex pa-3 ga-3">
                <v-avatar rounded="lg" size="64" class="img-frame">
                  <v-img v-if="item.image" :src="getImageUrl(item.image)" cover />
                  <v-icon v-else icon="mdi-image-off" color="grey" />
                </v-avatar>

                <div class="flex-grow-1" style="min-width: 0">
                  <div class="font-weight-bold text-truncate">{{ item.name }}</div>
                  <div class="text-caption text-medium-emphasis">
                    {{ formatPrice(item.price) }} each · {{ item.stock }} in stock
                  </div>

                  <div class="d-flex align-center justify-space-between mt-2">
                    <!-- Quantity controls -->
                    <div class="qty-box d-flex align-center">
                      <v-btn
                        icon="mdi-minus"
                        size="x-small"
                        variant="text"
                        @click="decreaseQuantity(item)"
                      />
                      <span class="mx-2 font-weight-bold">{{ item.quantity }}</span>
                      <v-btn
                        icon="mdi-plus"
                        size="x-small"
                        variant="text"
                        color="primary"
                        :disabled="item.quantity >= item.stock"
                        @click="increaseQuantity(item)"
                      />
                    </div>

                    <!-- Item subtotal -->
                    <div class="font-weight-bold text-primary">
                      {{ formatPrice(itemSubtotal(item)) }}
                    </div>
                  </div>

                  <div v-if="item.quantity >= item.stock" class="text-caption text-warning mt-1">
                    Maximum available stock reached
                  </div>
                </div>

                <v-btn
                  icon="mdi-trash-can-outline"
                  size="small"
                  variant="text"
                  color="error"
                  @click="removeFromCart(item)"
                />
              </div>
            </div>
          </div>

          <!-- Clear Cart stays at the bottom -->
          <div v-if="cart.length > 0" class="pa-3 cart-footer">
            <v-btn variant="text" color="error" block rounded="pill" prepend-icon="mdi-trash-can-outline" @click="clearCart">
              Clear Cart
            </v-btn>
          </div>
        </div>
      </v-navigation-drawer>

      <!-- ========================================
           WISHLIST DRAWER
      ========================================= -->
      <v-navigation-drawer
        v-model="wishlistDrawer"
        location="right"
        temporary
        :width="$vuetify.display.xs ? 320 : 380"
        class="dark-drawer"
      >
        <div class="d-flex align-center justify-space-between pa-5">
          <div class="text-h6 font-weight-bold">
            <v-icon icon="mdi-heart" color="error" class="mr-2" />Wishlist
            <span class="count-pill ml-1">{{ wishlist.length }}</span>
          </div>
          <v-btn icon="mdi-close" variant="text" @click="wishlistDrawer = false" />
        </div>
        <v-divider />

        <div v-if="wishlistProducts.length === 0" class="text-center pa-10">
          <div class="empty-icon mx-auto">
            <v-icon icon="mdi-heart-off-outline" size="48" color="error" />
          </div>
          <p class="mt-5 text-medium-emphasis">No items in your wishlist yet.</p>
        </div>

        <v-list v-else lines="two" bg-color="transparent" class="pa-2">
          <v-list-item
            v-for="product in wishlistProducts"
            :key="product.documentId"
            rounded="lg"
            class="cart-item mb-2"
          >
            <template #prepend>
              <v-avatar rounded="lg" size="56" class="img-frame">
                <v-img v-if="product.image" :src="getImageUrl(product.image)" cover />
                <v-icon v-else icon="mdi-image-off" color="grey" />
              </v-avatar>
            </template>

            <v-list-item-title class="font-weight-bold">{{ product.name }}</v-list-item-title>
            <v-list-item-subtitle class="text-primary">{{ formatPrice(product.price) }}</v-list-item-subtitle>

            <template #append>
              <v-btn
                icon="mdi-cart-plus"
                size="small"
                variant="text"
                color="primary"
                :disabled="!canAddToCart(product)"
                @click="addToCart(product)"
              />
              <v-btn
                icon="mdi-close"
                size="small"
                variant="text"
                color="error"
                @click="toggleWishlist(product)"
              />
            </template>
          </v-list-item>
        </v-list>
      </v-navigation-drawer>

      <v-main class="home-page">
        <!-- ========================================
             HERO SECTION
        ========================================= -->
        <section class="hero">
          <div class="hero-grid" />
          <div class="glow glow-1" />
          <div class="glow glow-2" />

          <v-container class="hero-content py-14 py-md-16">
            <v-row align="center">
              <v-col cols="12" md="7">
                <div class="eyebrow mb-5">
                  <span class="pulse-dot" /> New drops every week
                </div>
                <h1 class="hero-title font-weight-black">
                  Gear up.<br />
                  <span class="text-gradient">Level up.</span>
                </h1>
                <p class="hero-subtitle mt-5 mb-8">
                  Electronics, fashion, sports gear, and more. Curated picks,
                  real-time stock, and a checkout that takes seconds.
                </p>
                <div class="d-flex flex-wrap ga-3">
                  <v-btn
                    size="x-large"
                    color="primary"
                    rounded="pill"
                    class="glow-btn px-8"
                    append-icon="mdi-arrow-right"
                    @click="scrollTo('products')"
                  >
                    Shop Now
                  </v-btn>
                  <v-btn
                    size="x-large"
                    variant="outlined"
                    rounded="pill"
                    class="px-8 ghost-btn"
                    @click="scrollTo('categories')"
                  >
                    Browse Categories
                  </v-btn>
                </div>

                <!-- Quick stats (uses existing data) -->
                <div class="d-flex flex-wrap ga-8 mt-10">
                  <div>
                    <div class="stat-number">{{ activeProducts.length }}+</div>
                    <div class="stat-label">Products</div>
                  </div>
                  <div>
                    <div class="stat-number">{{ categories.length }}</div>
                    <div class="stat-label">Categories</div>
                  </div>
                  <div>
                    <div class="stat-number">24/7</div>
                    <div class="stat-label">Online Store</div>
                  </div>
                </div>
              </v-col>

              <v-col cols="12" md="5" class="d-none d-md-flex justify-center">
                <div class="hero-visual">
                  <div class="ring ring-1" />
                  <div class="ring ring-2" />
                  <div class="hero-core">
                    <v-icon icon="mdi-shopping" size="110" color="primary" />
                  </div>
                  <div class="float-chip chip-a">
                    <v-icon icon="mdi-truck-fast-outline" size="18" color="primary" class="mr-1" /> Fast Delivery
                  </div>
                  <div class="float-chip chip-b">
                    <v-icon icon="mdi-shield-check-outline" size="18" color="primary" class="mr-1" /> Secure Pay
                  </div>
                  <div class="float-chip chip-c">
                    <v-icon icon="mdi-tag-outline" size="18" color="primary" class="mr-1" /> Best Prices
                  </div>
                </div>
              </v-col>
            </v-row>
          </v-container>
        </section>

        <!-- ========================================
             PRODUCT CATEGORIES
        ========================================= -->
        <section id="categories" class="section">
          <v-container class="py-14">
            <div class="section-label">Browse</div>
            <h2 class="section-title mb-2">Shop by Category</h2>
            <p class="text-medium-emphasis mb-8">Pick a category to filter the products below.</p>

            <v-row>
              <v-col
                v-for="cat in categoryCards"
                :key="cat.name"
                cols="6"
                sm="4"
                md
              >
                <div
                  class="category-card text-center pa-5"
                  :class="{ 'category-active': selectedCategory === cat.name }"
                  @click="selectCategory(cat.name)"
                >
                  <div class="category-icon mx-auto">
                    <v-icon :icon="cat.icon" size="28" />
                  </div>
                  <div class="font-weight-bold mt-3">{{ cat.name }}</div>
                  <div class="text-caption text-medium-emphasis">
                    {{ countByCategory(cat.name) }} items
                  </div>
                </div>
              </v-col>
            </v-row>
          </v-container>
        </section>

        <!-- ========================================
             PROMOTIONAL CONTENT
        ========================================= -->
        <section>
          <v-container class="pb-4">
            <v-row>
              <v-col v-for="promo in promos" :key="promo.title" cols="12" md="4">
                <div class="promo-card pa-6 h-100">
                  <div class="d-flex align-center ga-4">
                    <div class="promo-icon">
                      <v-icon :icon="promo.icon" size="28" color="primary" />
                    </div>
                    <div>
                      <div class="text-h6 font-weight-bold">{{ promo.title }}</div>
                      <div class="text-body-2 text-medium-emphasis">{{ promo.text }}</div>
                    </div>
                  </div>
                </div>
              </v-col>
            </v-row>
          </v-container>
        </section>

        <!-- ========================================
             PRODUCTS: SEARCH + CATEGORY FILTER + GRID
        ========================================= -->
        <section id="products" class="section">
          <v-container class="py-14">
            <div class="d-flex flex-wrap align-end justify-space-between ga-4 mb-6">
              <div>
                <div class="section-label">Catalog</div>
                <h2 class="section-title">Featured Products</h2>
                <p class="text-medium-emphasis mb-0">
                  Showing {{ filteredProducts.length }} of {{ activeProducts.length }} active products
                </p>
              </div>

              <v-text-field
                v-model="search"
                placeholder="Search by name, description, or category"
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

            <!-- Category filter chips -->
            <v-chip-group
              v-model="selectedCategory"
              mandatory
              selected-class="chip-selected"
              class="mb-8"
            >
              <v-chip value="All Categories" variant="outlined" class="filter-chip">All Categories</v-chip>
              <v-chip
                v-for="cat in categories"
                :key="cat"
                :value="cat"
                variant="outlined"
                class="filter-chip"
              >
                {{ cat }}
              </v-chip>
            </v-chip-group>

            <!-- Loading -->
            <div v-if="loading" class="text-center py-16">
              <v-progress-circular indeterminate color="primary" size="50" width="3" />
              <div class="mt-4 text-medium-emphasis">Loading products...</div>
            </div>

            <!-- Error -->
            <v-alert
              v-else-if="loadError"
              type="error"
              variant="tonal"
              rounded="lg"
              title="Unable to load products"
            >
              {{ loadError }}
              <template #append>
                <v-btn variant="text" @click="getProducts">Retry</v-btn>
              </template>
            </v-alert>

            <!-- Empty -->
            <div v-else-if="filteredProducts.length === 0" class="empty-panel text-center py-16">
              <div class="empty-icon mx-auto">
                <v-icon icon="mdi-package-variant-remove" size="48" color="primary" />
              </div>
              <h3 class="mt-5">No Products Found</h3>
              <p class="text-medium-emphasis mt-2">Try another keyword or choose All Categories.</p>
              <v-btn class="mt-3" variant="tonal" color="primary" rounded="pill" @click="resetFilters">
                Reset Filters
              </v-btn>
            </div>

            <!-- Product grid -->
            <v-row v-else>
              <v-col
                v-for="product in filteredProducts"
                :key="product.documentId"
                cols="12"
                sm="6"
                md="4"
                lg="3"
              >
                <div class="product-card h-100 d-flex flex-column">
                  <div class="product-media">
                    <v-img
                      v-if="product.image"
                      :src="getImageUrl(product.image)"
                      :alt="product.name"
                      height="210"
                      cover
                      class="product-img"
                    />
                    <div v-else class="d-flex align-center justify-center no-image" style="height: 210px">
                      <v-icon icon="mdi-image-off" size="56" color="grey-darken-1" />
                    </div>

                    <!-- Wishlist toggle -->
                    <v-btn
                      :icon="isInWishlist(product) ? 'mdi-heart' : 'mdi-heart-outline'"
                      :color="isInWishlist(product) ? 'error' : 'white'"
                      size="small"
                      variant="flat"
                      class="wishlist-btn"
                      @click="toggleWishlist(product)"
                    />

                    <v-chip
                      v-if="Number(product.stock) === 0"
                      color="error"
                      variant="flat"
                      size="small"
                      class="stock-badge"
                    >
                      Sold Out
                    </v-chip>

                    <span class="category-tag">{{ product.category || 'Uncategorized' }}</span>
                  </div>

                  <div class="pa-4 flex-grow-1 d-flex flex-column">
                    <div class="text-subtitle-1 font-weight-bold">{{ product.name }}</div>
                    <div class="product-description text-medium-emphasis text-body-2 mt-1">
                      {{ product.description || 'No description' }}
                    </div>

                    <v-spacer />

                    <div class="d-flex align-center justify-space-between mt-4">
                      <div class="price">{{ formatPrice(product.price) }}</div>
                      <v-chip :color="getStockColor(product.stock)" variant="tonal" size="small">
                        <v-icon icon="mdi-circle" size="8" start />
                        {{ product.stock }} left
                      </v-chip>
                    </div>

                    <v-btn
                      color="primary"
                      variant="flat"
                      block
                      rounded="pill"
                      class="mt-4 add-btn"
                      prepend-icon="mdi-cart-plus"
                      :disabled="!canAddToCart(product)"
                      @click="addToCart(product)"
                    >
                      {{ addToCartLabel(product) }}
                    </v-btn>
                  </div>
                </div>
              </v-col>
            </v-row>
          </v-container>
        </section>

        <!-- ========================================
             NEWSLETTER
        ========================================= -->
        <section class="pb-14">
          <v-container>
            <div class="newsletter-panel pa-8 pa-md-12">
              <div class="glow glow-3" />
              <v-row align="center" class="position-relative">
                <v-col cols="12" md="6">
                  <div class="section-label">Stay in the loop</div>
                  <h2 class="section-title">Join our newsletter</h2>
                  <p class="text-medium-emphasis mt-2 mb-0">
                    Get exclusive deals and new product alerts straight to your inbox.
                  </p>
                </v-col>
                <v-col cols="12" md="6">
                  <v-form ref="newsletterForm" class="d-flex flex-column flex-sm-row ga-3" @submit.prevent="subscribe">
                    <v-text-field
                      v-model="newsletterEmail"
                      placeholder="you@example.com"
                      prepend-inner-icon="mdi-email-outline"
                      variant="solo-filled"
                      flat
                      rounded="pill"
                      density="comfortable"
                      :rules="emailRules"
                      class="flex-grow-1"
                    />
                    <v-btn type="submit" size="x-large" color="primary" rounded="pill" class="glow-btn">
                      Subscribe
                    </v-btn>
                  </v-form>
                </v-col>
              </v-row>
            </div>
          </v-container>
        </section>

        <!-- ========================================
             FOOTER
        ========================================= -->
        <footer class="site-footer">
          <v-container class="py-12">
            <v-row>
              <v-col cols="12" md="5">
                <div class="d-flex align-center ga-2 mb-4">
                  <div class="logo-mark">
                    <v-icon icon="mdi-cart" size="22" color="black" />
                  </div>
                  <span class="text-h6 font-weight-black text-white logo-text">
                    SHOP<span class="text-gradient">KART</span>
                  </span>
                </div>
                <p class="text-medium-emphasis text-body-2" style="max-width: 320px">
                  Your one-stop online shop for everyday essentials and great finds.
                </p>
              </v-col>
              <v-col cols="6" md="4">
                <div class="footer-heading mb-4">Shop</div>
                <div class="footer-link" @click="scrollTo('products')">All Products</div>
                <div class="footer-link" @click="scrollTo('categories')">Categories</div>
                <div class="footer-link" @click="wishlistDrawer = true">Wishlist</div>
                <div class="footer-link" @click="cartDrawer = true">Cart</div>
              </v-col>
              <v-col cols="6" md="3">
                <div class="footer-heading mb-4">Admin</div>
                <NuxtLink to="/products" class="footer-link d-block">Manage Products</NuxtLink>
              </v-col>
            </v-row>
            <v-divider class="my-8" />
            <div class="text-center text-medium-emphasis text-caption">
              © {{ new Date().getFullYear() }} ShopKart · Web Systems and Technologies Final Project
            </div>
          </v-container>
        </footer>
      </v-main>

      <!-- ========================================
           CHECKOUT DIALOG
      ========================================= -->
      <v-dialog
        v-model="checkoutDialog"
        max-width="920"
        persistent
        scrollable
        :fullscreen="$vuetify.display.xs"
      >
        <v-card rounded="xl" class="dialog-card">
          <v-card-title class="d-flex align-center justify-space-between pa-6">
            <span class="text-h5 font-weight-black">
              <v-icon icon="mdi-lightning-bolt" color="primary" class="mr-1" />Checkout
            </span>
            <v-btn icon="mdi-close" variant="text" :disabled="checkingOut" @click="checkoutDialog = false" />
          </v-card-title>
          <v-divider />

          <v-card-text class="pa-6">
            <v-row>
              <!-- Order summary -->
              <v-col cols="12" md="6">
                <div class="summary-panel pa-4">
                  <div class="section-label mb-3">Order Summary</div>
                  <v-table density="compact" class="summary-table">
                    <thead>
                      <tr>
                        <th>Product</th>
                        <th class="text-center">Qty</th>
                        <th class="text-right">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="item in cart" :key="item.documentId">
                        <td>
                          <div class="font-weight-medium">{{ item.name }}</div>
                          <div class="text-caption text-medium-emphasis">{{ formatPrice(item.price) }}</div>
                        </td>
                        <td class="text-center">{{ item.quantity }}</td>
                        <td class="text-right">{{ formatPrice(itemSubtotal(item)) }}</td>
                      </tr>
                    </tbody>
                  </v-table>

                  <v-divider class="my-3" />
                  <div class="d-flex justify-space-between">
                    <span class="text-medium-emphasis">Total Items</span>
                    <strong>{{ totalItems }}</strong>
                  </div>
                  <div class="d-flex justify-space-between align-center mt-1">
                    <span class="text-medium-emphasis">Total Amount</span>
                    <strong class="text-h5 font-weight-black text-gradient">{{ formatPrice(totalAmount) }}</strong>
                  </div>
                </div>
              </v-col>

              <!-- Customer form -->
              <v-col cols="12" md="6">
                <div class="section-label mb-3">Customer Information</div>
                <v-form ref="checkoutForm" @submit.prevent="confirmCheckout">
                  <v-text-field
                    v-model="customer.fullName"
                    label="Full Name"
                    variant="outlined"
                    prepend-inner-icon="mdi-account-outline"
                    :rules="[required('Full name')]"
                  />
                  <v-text-field
                    v-model="customer.contactNumber"
                    label="Contact Number"
                    placeholder="09XXXXXXXXX"
                    variant="outlined"
                    prepend-inner-icon="mdi-phone-outline"
                    :rules="contactRules"
                  />
                  <v-textarea
                    v-model="customer.address"
                    label="Delivery Address"
                    variant="outlined"
                    rows="2"
                    prepend-inner-icon="mdi-map-marker-outline"
                    :rules="[required('Delivery address')]"
                  />
                  <v-select
                    v-model="customer.paymentMethod"
                    :items="paymentMethods"
                    label="Payment Method"
                    variant="outlined"
                    prepend-inner-icon="mdi-credit-card-outline"
                    :rules="[required('Payment method')]"
                  />
                </v-form>

                <v-alert
                  v-if="checkoutError"
                  type="error"
                  variant="tonal"
                  density="compact"
                  class="mt-2"
                >
                  {{ checkoutError }}
                </v-alert>
              </v-col>
            </v-row>
          </v-card-text>

          <v-divider />
          <v-card-actions class="pa-6">
            <v-spacer />
            <v-btn variant="text" rounded="pill" :disabled="checkingOut" @click="checkoutDialog = false">Cancel</v-btn>
            <v-btn
              color="primary"
              variant="flat"
              size="large"
              rounded="pill"
              class="glow-btn px-6"
              prepend-icon="mdi-check"
              :loading="checkingOut"
              @click="confirmCheckout"
            >
              Confirm Checkout
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <!-- ========================================
           ORDER SUCCESS DIALOG
      ========================================= -->
      <v-dialog v-model="successDialog" max-width="460">
        <v-card rounded="xl" class="dialog-card text-center pa-8">
          <div class="success-icon mx-auto">
            <v-icon icon="mdi-check-bold" color="black" size="44" />
          </div>
          <h2 class="text-h5 font-weight-black mt-5">Order Placed!</h2>
          <p class="text-medium-emphasis mt-2">
            Thank you, <strong class="text-white">{{ lastOrder?.fullName }}</strong>.
            Order <strong class="text-primary">{{ lastOrder?.orderNumber }}</strong> has been confirmed.
          </p>
          <div class="summary-panel pa-4 mt-5 text-left">
            <div class="d-flex justify-space-between">
              <span class="text-medium-emphasis">Total Items</span><strong>{{ lastOrder?.totalItems }}</strong>
            </div>
            <div class="d-flex justify-space-between mt-1">
              <span class="text-medium-emphasis">Total Paid</span><strong class="text-primary">{{ formatPrice(lastOrder?.totalAmount) }}</strong>
            </div>
            <div class="d-flex justify-space-between mt-1">
              <span class="text-medium-emphasis">Payment</span><strong>{{ lastOrder?.paymentMethod }}</strong>
            </div>
          </div>
          <v-btn class="mt-6 glow-btn" color="primary" rounded="pill" size="large" block @click="successDialog = false">
            Continue Shopping
          </v-btn>
        </v-card>
      </v-dialog>

      <!-- ========================================
           SNACKBAR
      ========================================= -->
      <v-snackbar v-model="snackbar.show" :color="snackbar.color" timeout="3000" location="top right" rounded="pill">
        {{ snackbar.message }}
        <template #actions>
          <v-btn variant="text" icon="mdi-close" @click="snackbar.show = false" />
        </template>
      </v-snackbar>
    </v-layout>
  </v-theme-provider>
</template>

<script setup lang="ts">
// @ts-nocheck

/* ========================================
   PAGE SETTINGS + STRAPI URL
========================================= */
definePageMeta({
  layout: false,
})

useHead({
  title: 'ShopKart | Online Store',
})

const config = useRuntimeConfig()
const STRAPI_URL = config.public.strapiUrl

/* ========================================
   STATE
========================================= */
const products = ref([])          // all products from Strapi
const loading = ref(false)
const loadError = ref('')

const search = ref('')
const selectedCategory = ref('All Categories')

const cart = ref([])              // [{ documentId, id, name, price, stock, image, quantity }]
const wishlist = ref([])          // [documentId, documentId, ...]

const cartDrawer = ref(false)
const wishlistDrawer = ref(false)
const checkoutDialog = ref(false)
const successDialog = ref(false)

const checkoutForm = ref(null)
const checkingOut = ref(false)
const checkoutError = ref('')
const lastOrder = ref(null)

const customer = reactive({
  fullName: '',
  contactNumber: '',
  address: '',
  paymentMethod: null,
})

const newsletterForm = ref(null)
const newsletterEmail = ref('')

const snackbar = reactive({
  show: false,
  message: '',
  color: 'success',
})

/* ========================================
   STATIC CONTENT
========================================= */
// Same categories used in the Product Management page
const categories = [
  'Electronics',
  'Fashion',
  'Sports',
  'Bags',
  'Beauty',
  'Home & Living',
  'Toys',
]

const categoryCards = [
  { name: 'Electronics', icon: 'mdi-headphones', color: 'blue' },
  { name: 'Fashion', icon: 'mdi-tshirt-crew', color: 'pink' },
  { name: 'Sports', icon: 'mdi-basketball', color: 'orange' },
  { name: 'Bags', icon: 'mdi-bag-personal', color: 'brown' },
  { name: 'Beauty', icon: 'mdi-lipstick', color: 'purple' },
  { name: 'Home & Living', icon: 'mdi-sofa', color: 'teal' },
  { name: 'Toys', icon: 'mdi-teddy-bear', color: 'amber' },
]

const promos = [
  { title: 'Free Shipping', text: 'On orders over ₱1,500 nationwide.', icon: 'mdi-truck-fast', color: 'primary' },
  { title: 'Weekend Sale', text: 'Up to 30% off selected items.', icon: 'mdi-sale', color: 'error' },
  { title: 'Secure Payment', text: 'COD, GCash, Maya, and cards accepted.', icon: 'mdi-shield-check', color: 'success' },
]

const paymentMethods = [
  'Cash on Delivery',
  'GCash',
  'Maya',
  'Credit / Debit Card',
]

/* ========================================
   VALIDATION RULES
========================================= */
function required(label) {
  return (value) => (!!value && String(value).trim() !== '') || `${label} is required`
}

const contactRules = [
  required('Contact number'),
  (value) =>
    /^(09\d{9}|\+639\d{9})$/.test(String(value || '').replace(/[\s-]/g, '')) ||
    'Enter a valid PH mobile number (e.g. 09171234567)',
]

const emailRules = [
  required('Email'),
  (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value || '') || 'Enter a valid email address',
]

/* ========================================
   READ: GET ACTIVE PRODUCTS FROM STRAPI
========================================= */
async function getProducts() {
  loading.value = true
  loadError.value = ''

  try {
    const response = await $fetch(`${STRAPI_URL}/api/products`, {
      query: {
        populate: 'image',                    // include the image media field
        'filters[is_active][$eq]': true,      // only active products on the storefront
        sort: 'createdAt:desc',
        'pagination[pageSize]': 100,
      },
    })

    products.value = response.data || []
    syncCartWithProducts()
  } catch (error) {
    console.error('Error fetching products:', error)
    loadError.value = getErrorMessage(error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  getProducts()
})

/* ========================================
   SEARCH + CATEGORY FILTER
========================================= */
// Extra safety: even if Strapi returns an inactive product, never show it
const activeProducts = computed(() =>
  products.value.filter((product) => product.is_active !== false)
)

const filteredProducts = computed(() => {
  const keyword = (search.value || '').toLowerCase().trim()

  return activeProducts.value.filter((product) => {
    const matchesCategory =
      selectedCategory.value === 'All Categories' ||
      product.category === selectedCategory.value

    if (!matchesCategory) return false
    if (!keyword) return true

    const name = product.name?.toLowerCase() || ''
    const description = product.description?.toLowerCase() || ''
    const category = product.category?.toLowerCase() || ''

    return name.includes(keyword) || description.includes(keyword) || category.includes(keyword)
  })
})

function countByCategory(category) {
  return activeProducts.value.filter((product) => product.category === category).length
}

function selectCategory(category) {
  // Clicking the active category again restores All Categories
  selectedCategory.value = selectedCategory.value === category ? 'All Categories' : category
  scrollTo('products')
}

function resetFilters() {
  search.value = ''
  selectedCategory.value = 'All Categories'
}

/* ========================================
   WISHLIST
========================================= */
function isInWishlist(product) {
  return wishlist.value.includes(product.documentId)
}

function toggleWishlist(product) {
  if (isInWishlist(product)) {
    wishlist.value = wishlist.value.filter((id) => id !== product.documentId)
    showSnackbar(`${product.name} removed from wishlist.`, 'info')
  } else {
    wishlist.value.push(product.documentId)
    showSnackbar(`${product.name} added to wishlist.`, 'success')
  }
}

const wishlistProducts = computed(() =>
  activeProducts.value.filter((product) => wishlist.value.includes(product.documentId))
)

/* ========================================
   CART MANAGEMENT
========================================= */
function findCartItem(product) {
  return cart.value.find((item) => item.documentId === product.documentId)
}

function canAddToCart(product) {
  const stock = Number(product.stock) || 0
  const inCart = findCartItem(product)?.quantity || 0
  return product.is_active !== false && stock > 0 && inCart < stock
}

function addToCartLabel(product) {
  if (Number(product.stock) <= 0) return 'Out of Stock'
  if (!canAddToCart(product)) return 'Max in Cart'
  return 'Add to Cart'
}

function addToCart(product) {
  if (!canAddToCart(product)) {
    showSnackbar('No more stock available for this product.', 'warning')
    return
  }

  const existing = findCartItem(product)

  if (existing) {
    existing.quantity++
  } else {
    cart.value.push({
      documentId: product.documentId,
      id: product.id,
      name: product.name,
      price: Number(product.price) || 0,
      stock: Number(product.stock) || 0,
      image: product.image || null,
      quantity: 1,
    })
  }

  showSnackbar(`${product.name} added to cart.`, 'success')
}

function increaseQuantity(item) {
  if (item.quantity >= item.stock) {
    showSnackbar(`Only ${item.stock} available for ${item.name}.`, 'warning')
    return
  }
  item.quantity++
}

function decreaseQuantity(item) {
  if (item.quantity > 1) {
    item.quantity--
  } else {
    removeFromCart(item)
  }
}

function removeFromCart(item) {
  cart.value = cart.value.filter((cartItem) => cartItem.documentId !== item.documentId)
  showSnackbar(`${item.name} removed from cart.`, 'info')
}

function clearCart() {
  cart.value = []
}

// After products are reloaded, update cart stock/price and drop unavailable items
function syncCartWithProducts() {
  cart.value = cart.value
    .map((item) => {
      const product = products.value.find((p) => p.documentId === item.documentId)
      if (!product || product.is_active === false || Number(product.stock) <= 0) return null

      const stock = Number(product.stock)
      return {
        ...item,
        name: product.name,
        price: Number(product.price) || 0,
        stock,
        image: product.image || null,
        quantity: Math.min(item.quantity, stock),
      }
    })
    .filter(Boolean)
}

/* ========================================
   TOTALS
========================================= */
function itemSubtotal(item) {
  return Number(item.price) * item.quantity
}

const totalItems = computed(() =>
  cart.value.reduce((sum, item) => sum + item.quantity, 0)
)

const totalAmount = computed(() =>
  cart.value.reduce((sum, item) => sum + itemSubtotal(item), 0)
)

/* ========================================
   CHECKOUT
========================================= */
function openCheckout() {
  if (cart.value.length === 0) {
    showSnackbar('Your cart is empty.', 'warning')
    return
  }
  checkoutError.value = ''
  cartDrawer.value = false
  checkoutDialog.value = true
}

async function confirmCheckout() {
  checkoutError.value = ''

  // 1. Validate required customer fields
  const validation = await checkoutForm.value?.validate()
  if (validation && !validation.valid) {
    checkoutError.value = 'Please complete all required fields.'
    return
  }

  if (cart.value.length === 0) {
    checkoutError.value = 'Your cart is empty.'
    return
  }

  checkingOut.value = true
  const updatedItems = [] // used to roll back stock if something fails midway

  try {
    // 2. Re-check every cart item against the LATEST data in Strapi
    const latestProducts = await Promise.all(
      cart.value.map((item) =>
        $fetch(`${STRAPI_URL}/api/products/${item.documentId}`).then((res) => res.data)
      )
    )

    const problems = []
    cart.value.forEach((item, index) => {
      const latest = latestProducts[index]
      if (!latest) {
        problems.push(`${item.name} is no longer available.`)
      } else if (latest.is_active === false) {
        problems.push(`${item.name} is currently inactive.`)
      } else if (Number(latest.stock) < item.quantity) {
        problems.push(`${item.name}: only ${latest.stock} left (you have ${item.quantity}).`)
      }
    })

    if (problems.length > 0) {
      checkoutError.value = problems.join(' ')
      await getProducts() // refresh so the cart shows the correct stock
      return
    }

    // 3. Deduct the purchased quantity from each product's stock in Strapi
    for (let i = 0; i < cart.value.length; i++) {
      const item = cart.value[i]
      const oldStock = Number(latestProducts[i].stock)
      const newStock = oldStock - item.quantity

      await $fetch(`${STRAPI_URL}/api/products/${item.documentId}`, {
        method: 'PUT',
        body: { data: { stock: newStock } },
      })

      updatedItems.push({ documentId: item.documentId, oldStock })
    }

    // 4. Success: save order details, clear cart, refresh products
    lastOrder.value = {
      orderNumber: `SK-${Date.now().toString().slice(-8)}`,
      fullName: customer.fullName,
      paymentMethod: customer.paymentMethod,
      totalItems: totalItems.value,
      totalAmount: totalAmount.value,
    }

    clearCart()
    resetCustomerForm()
    checkoutDialog.value = false
    successDialog.value = true
    showSnackbar('Checkout successful! Stock has been updated.', 'success')
    await getProducts()
  } catch (error) {
    console.error('Checkout error:', error)

    // Roll back any stock that was already deducted, so data stays correct
    for (const updated of updatedItems) {
      try {
        await $fetch(`${STRAPI_URL}/api/products/${updated.documentId}`, {
          method: 'PUT',
          body: { data: { stock: updated.oldStock } },
        })
      } catch (rollbackError) {
        console.error('Rollback failed:', rollbackError)
      }
    }

    // Cart is NOT cleared on failure
    checkoutError.value = `Checkout failed: ${getErrorMessage(error)}`
    showSnackbar('Checkout failed. Your cart was kept.', 'error')
  } finally {
    checkingOut.value = false
  }
}

function resetCustomerForm() {
  customer.fullName = ''
  customer.contactNumber = ''
  customer.address = ''
  customer.paymentMethod = null
  checkoutForm.value?.resetValidation()
}

/* ========================================
   NEWSLETTER (front-end only)
========================================= */
async function subscribe() {
  const validation = await newsletterForm.value?.validate()
  if (validation && !validation.valid) return

  showSnackbar(`Subscribed with ${newsletterEmail.value}. Thank you!`, 'success')
  newsletterEmail.value = ''
  newsletterForm.value?.resetValidation()
}

/* ========================================
   HELPERS
========================================= */
function getImageUrl(image) {
  if (!image?.url) return ''
  if (image.url.startsWith('http://') || image.url.startsWith('https://')) {
    return image.url
  }
  return `${STRAPI_URL}${image.url}`
}

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

function scrollTo(id) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
}

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
</script>

<style scoped>
/* ========================================
   DARK & MODERN THEME — design tokens
========================================= */
.home-layout {
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

.home-page {
  background: var(--sk-bg);
  color: #e8edf2;
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

.outline-glow {
  text-transform: none;
  letter-spacing: 0;
  box-shadow: 0 0 14px rgba(20, 224, 180, 0.15);
}

/* ========================================
   BUTTONS
========================================= */
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

.ghost-btn {
  text-transform: none;
  letter-spacing: 0;
  border-color: rgba(255, 255, 255, 0.25);
  color: #ffffff;
}

/* ========================================
   HERO
========================================= */
.hero {
  position: relative;
  overflow: hidden;
  border-bottom: 1px solid var(--sk-border);
}

.hero-grid {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(255, 255, 255, 0.04) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.04) 1px, transparent 1px);
  background-size: 48px 48px;
  mask-image: radial-gradient(ellipse at center, black 30%, transparent 75%);
  -webkit-mask-image: radial-gradient(ellipse at center, black 30%, transparent 75%);
}

.glow {
  position: absolute;
  border-radius: 50%;
  filter: blur(90px);
  pointer-events: none;
}

.glow-1 {
  width: 420px;
  height: 420px;
  background: rgba(20, 224, 180, 0.28);
  top: -120px;
  left: -100px;
}

.glow-2 {
  width: 380px;
  height: 380px;
  background: rgba(34, 211, 238, 0.22);
  bottom: -160px;
  right: -60px;
}

.hero-content {
  position: relative;
  z-index: 1;
}

.eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 14px;
  border-radius: 999px;
  border: 1px solid rgba(20, 224, 180, 0.35);
  background: rgba(20, 224, 180, 0.08);
  color: var(--sk-teal);
  font-size: 13px;
  font-weight: 600;
}

.pulse-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--sk-teal);
  box-shadow: 0 0 0 0 var(--sk-glow);
  animation: pulse 1.8s infinite;
}

@keyframes pulse {
  0% { box-shadow: 0 0 0 0 rgba(20, 224, 180, 0.6); }
  70% { box-shadow: 0 0 0 10px rgba(20, 224, 180, 0); }
  100% { box-shadow: 0 0 0 0 rgba(20, 224, 180, 0); }
}

.hero-title {
  font-size: clamp(2.6rem, 6vw, 4.6rem);
  line-height: 1.02;
  letter-spacing: -1.5px;
  color: #ffffff;
}

.hero-subtitle {
  font-size: 1.1rem;
  max-width: 520px;
  color: #9aa6b2;
}

.stat-number {
  font-size: 1.8rem;
  font-weight: 800;
  color: #ffffff;
}

.stat-label {
  font-size: 13px;
  color: #7d8894;
  text-transform: uppercase;
  letter-spacing: 1px;
}

/* Hero visual */
.hero-visual {
  position: relative;
  width: 360px;
  height: 360px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.ring {
  position: absolute;
  border-radius: 50%;
  border: 1px solid rgba(20, 224, 180, 0.25);
}

.ring-1 {
  inset: 0;
  animation: spin 22s linear infinite;
  border-style: dashed;
}

.ring-2 {
  inset: 50px;
  border-color: rgba(34, 211, 238, 0.3);
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.hero-core {
  width: 190px;
  height: 190px;
  border-radius: 50%;
  background: radial-gradient(circle at 30% 30%, #1b2633, #0b1016);
  border: 1px solid var(--sk-border);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 0 60px rgba(20, 224, 180, 0.25), inset 0 0 30px rgba(20, 224, 180, 0.08);
}

.float-chip {
  position: absolute;
  display: flex;
  align-items: center;
  padding: 8px 14px;
  border-radius: 999px;
  background: rgba(15, 20, 27, 0.85);
  border: 1px solid var(--sk-border);
  backdrop-filter: blur(8px);
  font-size: 13px;
  font-weight: 600;
  color: #e8edf2;
  animation: float 4s ease-in-out infinite;
}

.chip-a { top: 20px; left: -10px; }
.chip-b { bottom: 50px; left: -30px; animation-delay: 1.2s; }
.chip-c { top: 120px; right: -40px; animation-delay: 0.6s; }

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-8px); }
}

/* ========================================
   SECTIONS
========================================= */
.section-label {
  color: var(--sk-teal);
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 2px;
  text-transform: uppercase;
  margin-bottom: 6px;
}

.section-title {
  font-size: clamp(1.7rem, 3vw, 2.3rem);
  font-weight: 800;
  letter-spacing: -0.5px;
  color: #ffffff;
}

/* Categories */
.category-card {
  cursor: pointer;
  border-radius: 18px;
  background: var(--sk-surface);
  border: 1px solid var(--sk-border);
  transition: transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease;
}

.category-card:hover {
  transform: translateY(-4px);
  border-color: rgba(20, 224, 180, 0.4);
}

.category-icon {
  width: 56px;
  height: 56px;
  border-radius: 16px;
  background: rgba(20, 224, 180, 0.08);
  color: var(--sk-teal);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s ease, color 0.2s ease;
}

.category-active {
  border-color: var(--sk-teal);
  box-shadow: 0 0 24px rgba(20, 224, 180, 0.25);
}

.category-active .category-icon {
  background: linear-gradient(135deg, var(--sk-teal), var(--sk-cyan));
  color: #04120e;
}

/* Promos */
.promo-card {
  position: relative;
  border-radius: 18px;
  background:
    linear-gradient(var(--sk-surface), var(--sk-surface)) padding-box,
    linear-gradient(135deg, rgba(20, 224, 180, 0.5), rgba(34, 211, 238, 0.1)) border-box;
  border: 1px solid transparent;
}

.promo-icon {
  width: 52px;
  height: 52px;
  flex-shrink: 0;
  border-radius: 14px;
  background: rgba(20, 224, 180, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Search + filter chips */
.search-field {
  max-width: 420px;
  width: 100%;
}

.search-field :deep(.v-field) {
  background: var(--sk-surface-2) !important;
  border: 1px solid var(--sk-border);
}

.filter-chip {
  border-color: var(--sk-border) !important;
  color: #aab4bf !important;
}

.chip-selected {
  background: linear-gradient(90deg, var(--sk-teal), var(--sk-cyan)) !important;
  color: #04120e !important;
  border-color: transparent !important;
  font-weight: 700;
}

/* ========================================
   PRODUCT CARDS
========================================= */
.product-card {
  border-radius: 20px;
  background: var(--sk-surface);
  border: 1px solid var(--sk-border);
  overflow: hidden;
  transition: transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease;
}

.product-card:hover {
  transform: translateY(-6px);
  border-color: rgba(20, 224, 180, 0.45);
  box-shadow: 0 14px 40px rgba(0, 0, 0, 0.5), 0 0 30px rgba(20, 224, 180, 0.12);
}

.product-media {
  position: relative;
  overflow: hidden;
}

.product-img {
  background: #111821;
  transition: transform 0.4s ease;
}

.product-card:hover .product-img {
  transform: scale(1.06);
}

.product-media::after {
  content: '';
  position: absolute;
  inset: auto 0 0 0;
  height: 70px;
  background: linear-gradient(transparent, var(--sk-surface));
  pointer-events: none;
}

.no-image {
  background: #111821;
}

.category-tag {
  position: absolute;
  left: 14px;
  bottom: 12px;
  z-index: 1;
  padding: 3px 10px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  color: var(--sk-teal);
  background: rgba(7, 9, 13, 0.75);
  border: 1px solid rgba(20, 224, 180, 0.35);
  backdrop-filter: blur(6px);
}

.wishlist-btn {
  position: absolute;
  top: 12px;
  right: 12px;
  z-index: 2;
  background: rgba(7, 9, 13, 0.6) !important;
  backdrop-filter: blur(6px);
}

.stock-badge {
  position: absolute;
  top: 14px;
  left: 14px;
  z-index: 2;
}

.product-description {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  min-height: 40px;
}

.price {
  font-size: 1.3rem;
  font-weight: 800;
  color: var(--sk-teal);
}

.add-btn {
  text-transform: none;
  letter-spacing: 0;
  font-weight: 700;
}

/* Empty states */
.empty-panel {
  border-radius: 20px;
  background: var(--sk-surface);
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
   NEWSLETTER
========================================= */
.newsletter-panel {
  position: relative;
  overflow: hidden;
  border-radius: 28px;
  background: linear-gradient(135deg, #0f1a1c 0%, #0d141b 100%);
  border: 1px solid rgba(20, 224, 180, 0.25);
}

.glow-3 {
  width: 320px;
  height: 320px;
  background: rgba(20, 224, 180, 0.25);
  top: -140px;
  right: -80px;
}

.newsletter-panel :deep(.v-field) {
  background: rgba(7, 9, 13, 0.6) !important;
  border: 1px solid var(--sk-border);
}

/* ========================================
   FOOTER
========================================= */
.site-footer {
  background: #05070a;
  border-top: 1px solid var(--sk-border);
}

.footer-heading {
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 2px;
  text-transform: uppercase;
  color: #ffffff;
}

.footer-link {
  color: #7d8894;
  text-decoration: none;
  cursor: pointer;
  font-size: 14px;
  margin-bottom: 10px;
  transition: color 0.15s ease;
}

.footer-link:hover {
  color: var(--sk-teal);
}

/* ========================================
   CART / WISHLIST DRAWERS
========================================= */
.dark-drawer {
  background: #0b0f14 !important;
  border-left: 1px solid var(--sk-border) !important;
}

.count-pill {
  display: inline-block;
  min-width: 26px;
  padding: 0 8px;
  border-radius: 999px;
  font-size: 13px;
  text-align: center;
  background: rgba(20, 224, 180, 0.15);
  color: #14e0b4;
}

.cart-item {
  border-radius: 16px;
  background: #121821;
  border: 1px solid rgba(255, 255, 255, 0.06);
}

.img-frame {
  background: #1a222d;
}

.qty-box {
  border-radius: 999px;
  background: #0b0f14;
  border: 1px solid rgba(255, 255, 255, 0.08);
  padding: 0 2px;
}

.cart-footer {
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  background: #0f141b;
}

/* ========================================
   DIALOGS
========================================= */
.dialog-card {
  background: #0f141b !important;
  border: 1px solid rgba(20, 224, 180, 0.2);
}

.summary-panel {
  border-radius: 16px;
  background: #0b0f14;
  border: 1px solid rgba(255, 255, 255, 0.06);
}

.summary-table {
  background: transparent !important;
}

.success-icon {
  width: 84px;
  height: 84px;
  border-radius: 50%;
  background: linear-gradient(135deg, #14e0b4, #22d3ee);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 0 40px rgba(20, 224, 180, 0.5);
}

/* ========================================
   RESPECT REDUCED MOTION
========================================= */
@media (prefers-reduced-motion: reduce) {
  .ring-1,
  .float-chip,
  .pulse-dot {
    animation: none;
  }
}
</style>