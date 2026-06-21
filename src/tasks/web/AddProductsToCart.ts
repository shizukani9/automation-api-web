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
    for (const product of this.products) {
      await actor.attemptsTo(
        AddToCart.product(product)
      );
    }
  }
}