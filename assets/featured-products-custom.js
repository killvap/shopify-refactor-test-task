/**
 * Custom Web Component for Featured Products.
 * Handles AJAX Add to Cart and updates section via Section Rendering API.
 */
class FeaturedProductsCustom extends HTMLElement {
	constructor() {
		super();
		this.sectionId = this.dataset.sectionId;
		this.init();
	}

	init() {
		// Initialize listeners, removing old ones to prevent duplication
		this.querySelectorAll('form[action*="/cart/add"]').forEach((form) => {
			form.removeEventListener("submit", this.onSubmit.bind(this));
			form.addEventListener("submit", this.onSubmit.bind(this));
		});
	}

	async onSubmit(event) {
		event.preventDefault();

		const form = event.target;
		const submitButton = form.querySelector('[name="add"]');
		const originalButtonText = submitButton.textContent;

		// Prevent multiple clicks
		if (submitButton) {
			submitButton.setAttribute("disabled", true);
			submitButton.textContent = "Adding...";
		}

		const formData = new FormData(form);
		// Request 'cart-icon-bubble' section to update header icon
		formData.append("sections", "cart-icon-bubble");

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

			if (response.ok) {
				// 1. Refresh section to hide the added product
				await this.updateSection();

				// 2. Update global cart icon in header
				if (
					responseJson.sections &&
					responseJson.sections["cart-icon-bubble"]
				) {
					this.updateCartCount(responseJson.sections["cart-icon-bubble"]);
				}
			} else {
				this.handleError(
					submitButton,
					originalButtonText,
					responseJson.description
				);
			}
		} catch (error) {
			this.handleError(submitButton, originalButtonText, error);
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
		alert(error || "Error adding to cart");
		if (button) {
			button.removeAttribute("disabled");
			button.textContent = originalText;
		}
	}
}

customElements.define("featured-products-custom", FeaturedProductsCustom);
