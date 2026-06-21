// src/utils/AdManager.ts
import { Page } from '@playwright/test';

export class AdManager {
    private static readonly AD_SELECTORS = [
        '#dismiss-button',
        '#dismiss-button-element',
        '.close-button-outer',
        '.close-button',
        'div[aria-label="Close ad"]',
        '[role="button"] .continue-prompt-text',
        'button:has-text("Close")',
        'button:has-text("×")',
        '.modal .close',
        '.advertisement .close',
        '.popup .close-btn',
        '#popup-modal .close',
        '.ad-close',
        '[aria-label="Close"]',
        '.cookie-consent .close',
        'button:has-text("Accept")',
        'button:has-text("Aceptar")',
    ];

    static async closeAds(page: Page, logPrefix: string = ''): Promise<boolean> {
        let closed = false;

        try {
            for (const selector of AdManager.AD_SELECTORS) {
                try {
                    const elements = await page.locator(selector).all();
                    for (const element of elements) {
                        if (await element.isVisible({ timeout: 300 })) {
                            console.log(`${logPrefix}🔄 Cerrando anuncio: ${selector}`);
                            await element.click({ force: true });
                            await page.waitForTimeout(300);
                            closed = true;
                        }
                    }
                } catch {
                    // Ignorar
                }
            }

            if (closed) {
                await page.waitForTimeout(500);
            }

            return closed;
        } catch {
            return closed;
        }
    }

    static async ensureNoAds(page: Page, logPrefix: string = ''): Promise<void> {
        for (let attempt = 1; attempt <= 3; attempt++) {
            const closed = await AdManager.closeAds(page, logPrefix);
            if (closed) {
                await page.waitForTimeout(500);
            } else {
                break;
            }
        }
    }

    /**
     * ✅ VERIFICA SI HAY UN ANUNCIO BLOQUEANDO LA PÁGINA
     */
    static async isAdBlockingPage(page: Page): Promise<boolean> {
        try {
            for (const selector of AdManager.AD_SELECTORS) {
                const element = page.locator(selector);
                if (await element.isVisible({ timeout: 500 })) {
                    return true;
                }
            }
            return false;
        } catch {
            return false;
        }
    }
}