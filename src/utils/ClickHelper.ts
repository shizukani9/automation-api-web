// src/utils/ClickHelper.ts
import { Page, Locator } from '@playwright/test';
import { AdManager } from './AdManager';

export class ClickHelper {
    /**
     * ✅ Hace click en un elemento y maneja redirecciones a anuncios
     */
    static async clickWithRecovery(
        page: Page,
        locator: Locator,
        options: {
            expectedUrl?: string;
            timeout?: number;
            maxRetries?: number;
            logPrefix?: string;
            fallbackUrl?: string;
            isSubcategory?: boolean; // ✅ Nuevo: indica si es click en subcategoría
        } = {}
    ): Promise<boolean> {
        const {
            expectedUrl,
            timeout = 5000,
            maxRetries = 3,
            logPrefix = '',
            fallbackUrl,
            isSubcategory = false
        } = options;

        let attempts = 0;

        while (attempts < maxRetries) {
            attempts++;
            console.log(`${logPrefix}🔄 Intento ${attempts}/${maxRetries}`);

            try {
                // ✅ 1. Guardar la URL actual antes del click
                const urlBeforeClick = page.url();
                console.log(`${logPrefix}📍 URL antes del click: ${urlBeforeClick}`);

                // ✅ 2. Cerrar anuncios antes del click
                await AdManager.closeAds(page, logPrefix);

                // ✅ 3. Verificar que estamos en la URL correcta (para subcategorías)
                if (isSubcategory && expectedUrl) {
                    const currentUrl = page.url();
                    if (!currentUrl.includes('automationexercise.com') || currentUrl.includes('hbomax')) {
                        console.log(`${logPrefix}⚠️ URL incorrecta, navegando a la página principal...`);
                        await page.goto('https://automationexercise.com', { waitUntil: 'domcontentloaded' });
                        await page.waitForTimeout(1000);
                        await AdManager.closeAds(page, logPrefix);

                        // ✅ Reintentar el click en categoría primero
                        console.log(`${logPrefix}🔄 Reintentando navegación a categoría...`);
                        // El clickCategory manejará esto
                        return false;
                    }
                }

                // ✅ 4. Esperar que el elemento esté visible
                console.log(`${logPrefix}⏳ Esperando elemento...`);
                await locator.waitFor({ state: 'visible', timeout: 5000 });

                // ✅ 5. Hacer click con force
                console.log(`${logPrefix}🖱️ Ejecutando click...`);
                await locator.click({ force: true, timeout: 3000 });

                // ✅ 6. Esperar un momento para que la página reaccione
                await page.waitForTimeout(800);

                // ✅ 7. VERIFICAR SI SE ABRIÓ UNA NUEVA PESTAÑA (ANUNCIO)
                const contexts = page.context().pages();
                if (contexts.length > 1) {
                    console.log(`${logPrefix}⚠️ Se detectaron ${contexts.length} pestañas`);

                    let adTabFound = false;
                    for (let i = 1; i < contexts.length; i++) {
                        try {
                            const tabUrl = await contexts[i].url();
                            console.log(`${logPrefix}📄 Pestaña ${i}: ${tabUrl}`);

                            if (tabUrl.includes('hbomax') ||
                                tabUrl.includes('doubleclick') ||
                                tabUrl.includes('googleads') ||
                                tabUrl.includes('ad.doubleclick')) {
                                console.log(`${logPrefix}✅ Cerrando pestaña de anuncio: ${tabUrl}`);
                                await contexts[i].close();
                                adTabFound = true;
                            }
                        } catch {
                            // Ignorar errores al cerrar
                        }
                    }

                    if (adTabFound) {
                        console.log(`${logPrefix}🔄 Anuncio detectado y cerrado`);

                        // ✅ IMPORTANTE: Verificar si la página principal fue redirigida
                        const mainPage = page.context().pages()[0];
                        if (mainPage) {
                            const mainUrl = await mainPage.url();
                            if (mainUrl.includes('hbomax') || mainUrl.includes('doubleclick')) {
                                console.log(`${logPrefix}⚠️ La página principal fue redirigida a: ${mainUrl}`);
                                // Volver a la URL correcta
                                const targetUrl = fallbackUrl || 'https://automationexercise.com';
                                console.log(`${logPrefix}🔄 Volviendo a: ${targetUrl}`);
                                await mainPage.goto(targetUrl, { waitUntil: 'domcontentloaded' });
                                await page.waitForTimeout(1000);
                                await AdManager.closeAds(page, logPrefix);
                            }
                        }

                        // Si es subcategoría, necesitamos reintentar desde la categoría
                        if (isSubcategory) {
                            console.log(`${logPrefix}🔄 Es subcategoría, se necesita reclicar categoría`);
                            return false;
                        }

                        console.log(`${logPrefix}🔄 Reintentando click...`);
                        continue;
                    }
                }

                // ✅ 8. VERIFICAR LA URL ACTUAL
                const currentUrl = page.url();
                console.log(`${logPrefix}📍 URL actual: ${currentUrl}`);

                // Si la URL actual es un anuncio, redirigir
                if (currentUrl.includes('hbomax') ||
                    currentUrl.includes('doubleclick') ||
                    currentUrl.includes('googleads')) {
                    console.log(`${logPrefix}⚠️ La página fue redirigida a un anuncio`);

                    const targetUrl = expectedUrl || fallbackUrl || 'https://automationexercise.com';
                    console.log(`${logPrefix}🔄 Navegando a: ${targetUrl}`);
                    await page.goto(targetUrl, { waitUntil: 'domcontentloaded' });
                    await page.waitForTimeout(1000);
                    await AdManager.closeAds(page, logPrefix);

                    if (isSubcategory) {
                        return false; // Necesita reclicar categoría
                    }
                    continue;
                }

                // ✅ 9. VERIFICAR URL ESPERADA
                if (expectedUrl && !currentUrl.includes(expectedUrl)) {
                    console.log(`${logPrefix}⚠️ URL incorrecta. Esperada: ${expectedUrl}`);
                    // Si es subcategoría y no estamos en la URL esperada, fallar para reintentar
                    if (isSubcategory) {
                        console.log(`${logPrefix}🔄 Subcategoría no navegó correctamente`);
                        return false;
                    }
                }

                // ✅ 10. Verificar si hay anuncios bloqueando
                const hasAd = await AdManager.isAdBlockingPage(page);
                if (hasAd) {
                    console.log(`${logPrefix}⚠️ Anuncio detectado después del click`);
                    await AdManager.closeAds(page, logPrefix);
                    continue;
                }

                console.log(`${logPrefix}✅ Click exitoso`);
                return true;

            } catch (error) {
                console.log(`${logPrefix}⚠️ Error en intento ${attempts}:`, error);

                // Si es subcategoría y hay error, probablemente el menú se cerró
                if (isSubcategory) {
                    console.log(`${logPrefix}🔄 Error en subcategoría, se necesita reclicar categoría`);
                    return false;
                }

                await AdManager.closeAds(page, logPrefix);
                await page.waitForTimeout(1000);
            }
        }

        console.error(`${logPrefix}❌ Todos los ${maxRetries} intentos fallaron`);
        return false;
    }

    /**
     * ✅ Click en categoría con verificación de navegación
     */
    static async clickCategory(
        page: Page,
        category: string,
        subcategory: string
    ): Promise<void> {
        console.log(`📂 Click en categoría: ${category}`);

        // ✅ PRIMERO: Asegurarnos de que estamos en la URL correcta
        const currentUrl = page.url();
        if (!currentUrl.includes('automationexercise.com') || currentUrl.includes('hbomax')) {
            console.log(`🔄 URL incorrecta, navegando a la página principal...`);
            await page.goto('https://automationexercise.com', { waitUntil: 'domcontentloaded' });
            await page.waitForTimeout(1000);
            await AdManager.closeAds(page, '🔹 ');
        }

        const categorySelector = `a[href="#${category}"]`;
        const categoryLocator = page.locator(categorySelector);

        // Click en categoría
        const categorySuccess = await ClickHelper.clickWithRecovery(page, categoryLocator, {
            logPrefix: '🔹 ',
            fallbackUrl: 'https://automationexercise.com',
            isSubcategory: false
        });

        if (!categorySuccess) {
            console.log(`⚠️ Click en categoría falló, intentando navegación directa...`);
            await page.goto('https://automationexercise.com', { waitUntil: 'domcontentloaded' });
            await page.waitForTimeout(1000);
            await AdManager.closeAds(page, '🔹 ');

            // Reintentar click en categoría
            await categoryLocator.click({ force: true });
            await page.waitForTimeout(1000);
        }

        // Esperar que el menú se despliegue
        await page.waitForTimeout(1500);

        // ✅ VERIFICAR QUE EL MENÚ ESTÁ DESPLEGADO
        const subcategorySelector = ClickHelper.getSubcategorySelector(category, subcategory);
        const subcategoryLocator = page.locator(subcategorySelector);

        // Verificar si la subcategoría está visible
        const isSubcategoryVisible = await subcategoryLocator.isVisible({ timeout: 2000 }).catch(() => false);

        if (!isSubcategoryVisible) {
            console.log(`⚠️ Subcategoría no visible, reclicando categoría...`);
            // Reintentar click en categoría
            await categoryLocator.click({ force: true });
            await page.waitForTimeout(1500);
        }

        console.log(`📂 Click en subcategoría: ${subcategory}`);

        // Click en subcategoría con verificación
        const subcategorySuccess = await ClickHelper.clickWithRecovery(page, subcategoryLocator, {
            expectedUrl: '/category_products/',
            logPrefix: '🔹 ',
            fallbackUrl: 'https://automationexercise.com',
            isSubcategory: true
        });

        if (!subcategorySuccess) {
            console.log(`🔄 Subcategoría falló, reintentando desde categoría...`);

            // Reintentar el proceso completo
            await page.goto('https://automationexercise.com', { waitUntil: 'domcontentloaded' });
            await page.waitForTimeout(1000);
            await AdManager.closeAds(page, '🔹 ');

            // Click en categoría nuevamente
            await categoryLocator.click({ force: true });
            await page.waitForTimeout(1500);

            // Click en subcategoría nuevamente
            await subcategoryLocator.click({ force: true });
            await page.waitForTimeout(1000);
        }

        // ✅ VERIFICAR QUE LLEGAMOS A LA URL CORRECTA
        const finalUrl = page.url();
        if (!finalUrl.includes('/category_products/')) {
            console.log(`⚠️ No se navegó a category_products, navegando directamente...`);
            const path = ClickHelper.getCategoryPath(category, subcategory);
            if (path) {
                await page.goto(`https://automationexercise.com${path}`, {
                    waitUntil: 'domcontentloaded'
                });
            }
        }

        // Esperar que los productos carguen
        try {
            await page.waitForSelector('.product-image-wrapper', {
                state: 'visible',
                timeout: 10000
            });
            console.log(`✅ Productos cargados correctamente`);
        } catch {
            console.log(`⚠️ Productos no visibles, recargando...`);
            await page.reload();
            await page.waitForSelector('.product-image-wrapper', {
                state: 'visible',
                timeout: 10000
            });
        }

        console.log(`✅ Navegado a: ${page.url()}`);
    }

    /**
     * ✅ Obtiene el selector de subcategoría
     */
    private static getSubcategorySelector(category: string, subcategory: string): string {
        const SUBCATEGORY_SELECTORS: Record<string, Record<string, string>> = {
            Women: {
                Dress: 'a[href="/category_products/1"]',
                Tops: 'a[href="/category_products/2"]',
                Saree: 'a[href="/category_products/7"]',
            },
            Men: {
                Tshirts: 'a[href="/category_products/3"]',
                Jeans: 'a[href="/category_products/6"]',
            },
            Kids: {
                Dress: 'a[href="/category_products/4"]',
                'Tops & Shirts': 'a[href="/category_products/5"]',
            },
        };

        const subcategorySelectors = SUBCATEGORY_SELECTORS[category];
        const selector = subcategorySelectors?.[subcategory];

        if (!selector) {
            return `a[href*="/category_products/"]:has-text("${subcategory}")`;
        }

        return selector;
    }

    /**
     * ✅ Obtiene la ruta directa para una categoría/subcategoría
     */
    private static getCategoryPath(category: string, subcategory: string): string | null {
        const PATHS: Record<string, Record<string, string>> = {
            Women: {
                Dress: '/category_products/1',
                Tops: '/category_products/2',
                Saree: '/category_products/7',
            },
            Men: {
                Tshirts: '/category_products/3',
                Jeans: '/category_products/6',
            },
            Kids: {
                Dress: '/category_products/4',
                'Tops & Shirts': '/category_products/5',
            },
        };

        return PATHS[category]?.[subcategory] || null;
    }
}