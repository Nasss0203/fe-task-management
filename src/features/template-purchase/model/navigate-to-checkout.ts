/** Full-page navigation to the provider's hosted checkout (mockable in tests). */
export function navigateToCheckout(checkoutUrl: string) {
	window.location.assign(checkoutUrl);
}
