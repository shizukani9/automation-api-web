// src/tasks/web/AddProductsToCart.ts
import { Actor } from '../../actors/Actor';
import { AddToCart } from './AddToCart';
import { ProductInfo } from './SelectRandomProducts';

export class AddProductsToCart {
  private products: ProductInfo[];

  constructor(products: ProductInfo[]) {
    this.products = products;
  }

  static all(products: ProductInfo[]): AddProductsToCart {
    return new AddProductsToCart(products);
  }

  async performAs(actor: Actor): Promise<void> {
    console.log('\n📋 RESUMEN DE PRODUCTOS A AGREGAR:');
    console.log('=====================================');
    
    for (let i = 0; i < this.products.length; i++) {
      const product = this.products[i];
      console.log(`  ${i + 1}. ${product.name} → Cantidad: ${product.quantity}x`);
    }
    
    console.log('=====================================\n');

    for (const product of this.products) {
      console.log(`🛒 Agregando: "${product.name}" (${product.quantity}x)`);
      await actor.attemptsTo(
        AddToCart.product(product)
      );
      // Pequeña pausa entre productos
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    console.log('\n✅ Todos los productos fueron agregados al carrito');
  }
}