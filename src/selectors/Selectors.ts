// src/selectors/web/Selectors.ts
export const HomePageSelectors = {
  // Categorías principales
  CATEGORY_WOMEN: 'a[href="#Women"]',
  CATEGORY_MEN: 'a[href="#Men"]',
  CATEGORY_KIDS: 'a[href="#Kids"]',
  
  // Subcategorías
  SUBCATEGORY_WOMEN_DRESS: 'a[href="/category_products/1"]',
  SUBCATEGORY_WOMEN_TOPS: 'a[href="/category_products/2"]',
  SUBCATEGORY_WOMEN_SAREE: 'a[href="/category_products/7"]',
  SUBCATEGORY_MEN_TSHIRTS: 'a[href="/category_products/3"]',
  SUBCATEGORY_MEN_JEANS: 'a[href="/category_products/6"]',
  SUBCATEGORY_KIDS_DRESS: 'a[href="/category_products/4"]',
  SUBCATEGORY_KIDS_TOPS: 'a[href="/category_products/5"]',
  
  // Productos
  PRODUCT_ITEM: '.product-image-wrapper',
  PRODUCT_NAME: '.productinfo p',
  PRODUCT_PRICE: '.productinfo h2',
  ADD_TO_CART_BTN: '.add-to-cart',
  
  // Modal
  MODAL_CONFIRM: '#cartModal .modal-content',
  MODAL_CONTINUE_SHOPPING: '.close-modal',
  MODAL_VIEW_CART: '.modal-body a[href="/view_cart"]',
  
  // Carrito
  CART_LINK: 'a[href="/view_cart"]',
  CART_ITEM: '#cart_info tbody tr',
  CART_PRODUCT_NAME: '.cart_description h4 a',
  CART_QUANTITY: '.cart_quantity button',
  CART_PRICE: '.cart_price p',
  CART_TOTAL_PER_PRODUCT: '.cart_total p',
  CART_TOTAL_GENERAL: '.cart_total_amount',
  
  // Checkout
  CHECKOUT_BTN: '.check_out',
  CHECKOUT_MODAL: '.modal-content',
  CHECKOUT_CLOSE_BTN: '.close-checkout-modal',
};

export const CategoryData = {
  WOMEN: {
    name: 'Women',
    subcategories: ['Dress', 'Tops', 'Saree']
  },
  MEN: {
    name: 'Men',
    subcategories: ['Tshirts', 'Jeans']
  },
  KIDS: {
    name: 'Kids',
    subcategories: ['Dress', 'Tops & Shirts']
  }
};