/**
 * Custom Web Component for Featured Products.
 * Handles AJAX Add to Cart and updates section via Section Rendering API.
 */
class FeaturedProductsCustom extends HTMLElement {
	constructor() {
		super();
		this.sectionId = this.dataset.sectionId;

		// Get the default cart notification popup
		this.cartNotification = document.querySelector("cart-notification");

		this.init();
	}

	init() {
		// Initialize event listeners, removing old ones to prevent duplication
		this.querySelectorAll('form[action*="/cart/add"]').forEach((form) => {
			form.removeEventListener("submit", this.onSubmit.bind(this));
			form.addEventListener("submit", this.onSubmit.bind(this));
		});
	}

	async onSubmit(event) {
		event.preventDefault();

		const form = event.target;
		const submitButton = form.querySelector('[name="add"]');
		const originalButtonText = submitButton ? submitButton.textContent : "";

		// Prevent multiple clicks
		if (submitButton) {
			submitButton.setAttribute("disabled", true);
			submitButton.textContent = "Adding...";
		}

		const formData = new FormData(form);

		// Prepare data so Shopify returns cart popup and icon HTML via the Section Rendering API
		if (
			this.cartNotification &&
			typeof this.cartNotification.getSectionsToRender === "function"
		) {
			const sectionsToRender = this.cartNotification
				.getSectionsToRender()
				.map((section) => section.id);

			formData.append("sections", sectionsToRender.join(","));
			formData.append("sections_url", window.location.pathname);
		} else {
			// fallback: at least update the cart icon
			formData.append("sections", "cart-icon-bubble");
			formData.append("sections_url", window.location.pathname);
		}

		const config = {
			method: "POST",
			headers: {
				"X-Requested-With": "XMLHttpRequest",
				Accept: "application/javascript",
			},
			body: formData,
		};

		try {
			const response = await fetch(
				window.Shopify.routes.root + "cart/add.js",
				config
			);
			const responseJson = await response.json();

			if (!response.ok) {
				this.handleError(
					submitButton,
					originalButtonText,
					responseJson.description
				);
				return;
			}

			// Refresh section to hide the added product
			await this.updateSection();

			// Refresh default popup if it exist
			if (this.cartNotification && responseJson.sections) {
				// renderContents update section and shows popup
				this.cartNotification.renderContents(responseJson);
			} else if (
				responseJson.sections &&
				responseJson.sections["cart-icon-bubble"]
			) {
				// fallback: just update bubble in the header
				this.updateCartCount(responseJson.sections["cart-icon-bubble"]);
			}
		} catch (error) {
			this.handleError(
				submitButton,
				originalButtonText,
				error?.message || error
			);
		}
	}

	async updateSection() {
		const url = `${window.location.pathname}?section_id=${this.sectionId}`;

		try {
			const response = await fetch(url);
			const text = await response.text();
			const parser = new DOMParser();
			const html = parser.parseFromString(text, "text/html");

			const newContent = html.querySelector("featured-products-custom");

			if (newContent) {
				this.innerHTML = newContent.innerHTML;
				this.init(); // Re-init listeners for new content
			}
		} catch (e) {
			console.error("Failed to update section", e);
		}
	}

	updateCartCount(html) {
		const cartIconBubble = document.getElementById("cart-icon-bubble");
		if (cartIconBubble) {
			cartIconBubble.innerHTML = html;
		}
	}

	handleError(button, originalText, error) {
		console.error("Error:", error);
		if (button) {
			button.removeAttribute("disabled");
			button.textContent = originalText;
		}
	}
}

customElements.define("featured-products-custom", FeaturedProductsCustom);
