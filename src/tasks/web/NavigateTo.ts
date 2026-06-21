// src/tasks/web/NavigateTo.ts
import { Actor } from '../../actors/Actor';
import { BrowseTheWeb } from '../../actors/abilities/BrowseTheWeb';
import { AdManager } from '../../utils/AdManager';

export class NavigateTo {
  private url: string;

  constructor(url: string) {
    this.url = url;
  }

  static url(url: string): NavigateTo {
    return new NavigateTo(url);
  }

  static homepage(): NavigateTo {
    return new NavigateTo('/');
  }

  static cart(): NavigateTo {
    return new NavigateTo('/view_cart');
  }

  async performAs(actor: Actor): Promise<void> {
    const ability = actor.abilityTo(BrowseTheWeb);
    const page = ability.getPage();

    console.log(`📍 Navegando a: ${this.url}`);

    let lastError: Error | null = null;
    const maxRetries = 3;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        // ✅ Intentar navegar
        await ability.navigateTo(this.url);

        // ✅ Esperar que la página esté cargada
        await page.waitForLoadState('domcontentloaded', { timeout: 30000 });

        // ✅ VERIFICAR SI FUIMOS REDIRIGIDOS A UN ANUNCIO
        const currentUrl = page.url();
        console.log(`📍 URL actual después de navegar: ${currentUrl}`);

        // Si la URL es un anuncio, cerrarlo y reintentar
        if (currentUrl.includes('hbomax') ||
          currentUrl.includes('doubleclick') ||
          currentUrl.includes('googleads') ||
          currentUrl.includes('ad.doubleclick')) {
          console.log(`⚠️ Redirigido a anuncio: ${currentUrl}`);

          // Cerrar la pestaña del anuncio
          const contexts = page.context().pages();
          if (contexts.length > 1) {
            for (let i = 1; i < contexts.length; i++) {
              try {
                await contexts[i].close();
                console.log(`✅ Pestaña de anuncio cerrada`);
              } catch {
                // Ignorar
              }
            }
          }

          // Volver a la URL correcta
          const targetUrl = this.url === '/' || this.url === ''
            ? 'https://automationexercise.com'
            : `https://automationexercise.com${this.url}`;

          console.log(`🔄 Navegando a la URL correcta: ${targetUrl}`);
          await page.goto(targetUrl, { waitUntil: 'domcontentloaded' });
          await page.waitForTimeout(1000);

          // Cerrar anuncios en la página principal
          await AdManager.closeAds(page, '🔹 ');

          // Verificar que estamos en la URL correcta
          const newUrl = page.url();
          if (newUrl.includes('automationexercise.com') && !newUrl.includes('hbomax')) {
            console.log(`✅ Navegación exitosa a: ${newUrl}`);
            return;
          } else {
            console.log(`⚠️ Aún en URL incorrecta: ${newUrl}, reintentando...`);
            continue;
          }
        }

        // ✅ Intentar cerrar anuncios
        await AdManager.ensureNoAds(page, '🔹 ');

        // ✅ Esperar que elementos principales estén visibles
        try {
          await page.waitForSelector('header', { state: 'visible', timeout: 10000 });
          console.log(`✅ Navegación exitosa a: ${this.url}`);
          return;
        } catch {
          console.log(`⚠️ Header no visible en intento ${attempt}`);

          // Si el header no es visible, puede que haya un anuncio bloqueando
          await AdManager.closeAds(page, '🔹 ');
          await page.waitForTimeout(1000);

          // Reintentar la navegación si es el último intento
          if (attempt === maxRetries) {
            console.log(`🔄 Último intento, forzando navegación...`);
            await page.goto('https://automationexercise.com', {
              waitUntil: 'domcontentloaded'
            });
            await page.waitForTimeout(1000);
            await AdManager.closeAds(page, '🔹 ');

            // Verificar si el header apareció
            try {
              await page.waitForSelector('header', { state: 'visible', timeout: 5000 });
              console.log(`✅ Header visible después de forzar navegación`);
              return;
            } catch {
              // Si aún no hay header, continuar de todas formas
              console.log(`⚠️ Header no visible, continuando de todas formas...`);
            }
          }
        }

      } catch (error) {
        lastError = error as Error;
        console.log(`⚠️ Error en intento ${attempt}:`, error);

        // Intentar recuperar la página
        try {
          const currentUrl = page.url();
          if (currentUrl.includes('hbomax') || currentUrl.includes('doubleclick')) {
            console.log(`🔄 Recuperando de anuncio...`);
            await page.goto('https://automationexercise.com', { waitUntil: 'domcontentloaded' });
            await page.waitForTimeout(1000);
          }
        } catch {
          // Ignorar
        }

        await AdManager.closeAds(page, '🔹 ');
        await page.waitForTimeout(1000);
      }
    }

    // ✅ Si llegamos aquí, todos los intentos fallaron, pero intentamos una última vez
    console.log(`⚠️ Todos los intentos fallaron, intentando navegación directa...`);
    try {
      await page.goto('https://automationexercise.com', { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(2000);
      await AdManager.closeAds(page, '🔹 ');
      console.log(`✅ Navegación forzada exitosa`);
    } catch {
      if (lastError) {
        throw new Error(`No se pudo navegar después de ${maxRetries} intentos: ${lastError.message}`);
      }
    }
  }
}