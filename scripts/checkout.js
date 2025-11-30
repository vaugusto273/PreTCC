// ------------------------------
// CHECKOUT PAGE SCRIPT
// ------------------------------

document.addEventListener("DOMContentLoaded", () => {
    const listEl = document.getElementById("checkout-items-list");
    const subtotalEl = document.querySelector(".checkout-subtotal");
    const shippingEl = document.querySelector(".checkout-shipping");
    const totalEl = document.querySelector(".checkout-total");
    const emptyState = document.getElementById("checkout-empty");
    const hasItemsSection = document.getElementById("checkout-has-items");
    const finishBtn = document.getElementById("btn-finish-order");

    const payCard = document.getElementById("payCard");
    const payPix = document.getElementById("payPix");
    const cardFields = document.getElementById("card-fields");

    // -------- PREENCHE RESUMO ----------
    const cart = getCart();

    if (!cart.length) {
        emptyState.classList.remove("d-none");
        hasItemsSection.classList.add("d-none");
        return;
    }

    let subtotal = 0;
    listEl.innerHTML = "";

    cart.forEach((item) => {
        const itemTotal = item.price * item.qty;
        subtotal += itemTotal;

        const row = document.createElement("div");
        row.className = "d-flex justify-content-between align-items-center mb-2";

        row.innerHTML = `
            <div class="me-2 flex-grow-1">
                <div class="fw-semibold">${item.name}</div>
                <div class="text-muted">Qtd: ${item.qty}</div>
            </div>
            <div class="text-end" style="min-width: 90px;">
                R$ ${itemTotal.toFixed(2).replace(".", ",")}
            </div>
        `;
        listEl.appendChild(row);
    });

    const shipping = 0.0;
    const total = subtotal + shipping;

    subtotalEl.textContent = `R$ ${subtotal.toFixed(2).replace(".", ",")}`;
    shippingEl.textContent = `R$ ${shipping.toFixed(2).replace(".", ",")}`;
    totalEl.textContent = `R$ ${total.toFixed(2).replace(".", ",")}`;

    // -------- VALIDAÇÃO DO FORMULÁRIO ----------
    function validateCheckoutForm() {
        const fields = [
            "checkoutName",
            "checkoutEmail",
            "checkoutPhone",
            "checkoutCpf",
            "checkoutCep",
            "checkoutStreet",
            "checkoutNumber",
            "checkoutNeighborhood",
            "checkoutCity",
            "checkoutState",
            "cardNumber",
            "cardExpiry",
            "cardCvv",
        ];

        let valid = true;
        const isPix = payPix.checked;

        fields.forEach((id) => {
            const input = document.getElementById(id);
            if (!input) return;

            // Se for PIX, pula validação dos campos do cartão
            if (isPix && ["cardNumber", "cardExpiry", "cardCvv"].includes(id)) {
                input.classList.remove("is-invalid");
                return;
            }

            const value = input.value.trim();
            let fieldValid = true;

            if (!value) fieldValid = false;

            if (id === "checkoutEmail") {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                fieldValid = emailRegex.test(value);
            }

            if (id === "checkoutState") {
                fieldValid = value.length === 2;
            }

            if (id === "cardNumber" && !isPix) {
                fieldValid = value.replace(/\s+/g, "").length >= 13;
            }

            if (!fieldValid) {
                valid = false;
                input.classList.add("is-invalid");
            } else {
                input.classList.remove("is-invalid");
            }
        });

        return valid;
    }

    // ----------------------
    // ALTERAR CAMPOS CONFORME MÉTODO DE PAGAMENTO
    // ----------------------
    function updatePaymentVisibility() {
        const isPix = payPix.checked;

        if (isPix) {
            cardFields.classList.add("d-none");

            ["cardNumber", "cardExpiry", "cardCvv"].forEach((id) => {
                const el = document.getElementById(id);
                if (el) el.required = false;
            });
        } else {
            cardFields.classList.remove("d-none");

            ["cardNumber", "cardExpiry", "cardCvv"].forEach((id) => {
                const el = document.getElementById(id);
                if (el) el.required = true;
            });
        }
    }

    // Listeners para os dois rádios
    if (payCard) payCard.addEventListener("change", updatePaymentVisibility);
    if (payPix) payPix.addEventListener("change", updatePaymentVisibility);

    updatePaymentVisibility();

    // -------- BOTÃO FINALIZAR PEDIDO ----------
    finishBtn.addEventListener("click", () => {
        if (!validateCheckoutForm()) {
            showAlert("Por favor, corrija os campos destacados.", "danger");
            return;
        }

        const currentCart = getCart();
        if (!currentCart.length) {
            showAlert("Seu carrinho está vazio!", "warning");
            return;
        }

        showAlert("Pedido concluído com sucesso! Obrigado por comprar com a Snapps! 💙", "success");

        saveCart([]);
        updateCartDisplay();

        listEl.innerHTML = "";
        subtotalEl.textContent = "R$ 0,00";
        shippingEl.textContent = "R$ 0,00";
        totalEl.textContent = "R$ 0,00";

        hasItemsSection.classList.add("d-none");
        emptyState.classList.remove("d-none");

        setTimeout(() => {
            window.location.href = "../index.html";
        }, 2000);
    });
});
