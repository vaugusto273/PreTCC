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

    // Campos usados nas máscaras
    const cpfInput = document.getElementById("checkoutCpf");
    const phoneInput = document.getElementById("checkoutPhone");
    const cepInput = document.getElementById("checkoutCep");
    const cardNumberInput = document.getElementById("cardNumber");
    const cardExpiryInput = document.getElementById("cardExpiry");
    const cardCvvInput = document.getElementById("cardCvv");

    // Campos de endereço para ViaCEP
    const streetInput = document.getElementById("checkoutStreet");
    const neighborhoodInput = document.getElementById("checkoutNeighborhood");
    const cityInput = document.getElementById("checkoutCity");
    const stateInput = document.getElementById("checkoutState");

    // Valores globais de subtotal/frete
    let subtotalValue = 0;
    let shippingValue = 0;

    // -----------------------
    // Helpers
    // -----------------------
    function formatBRL(value) {
        return `R$ ${value.toFixed(2).replace(".", ",")}`;
    }

    function updateTotalsDisplay() {
        subtotalEl.textContent = formatBRL(subtotalValue);
        shippingEl.textContent = formatBRL(shippingValue);
        totalEl.textContent = formatBRL(subtotalValue + shippingValue);
    }

    // Cálculo fake de frete baseado em UF + subtotal
    function calcShipping(uf) {

        const sudeste = ["SP", "RJ", "MG", "ES"];
        const sul = ["PR", "SC", "RS"];

        if (sudeste.includes(uf)) return 19.9;
        if (sul.includes(uf)) return 24.9;
        return 29.9;
    }

    // -----------------------
    // Máscaras
    // -----------------------
    function setupMasks() {
        if (cpfInput) {
            cpfInput.addEventListener("input", () => {
                let v = cpfInput.value.replace(/\D/g, "").slice(0, 11);
                v = v.replace(/(\d{3})(\d)/, "$1.$2");
                v = v.replace(/(\d{3})(\d)/, "$1.$2");
                v = v.replace(/(\d{3})(\d{1,2})$/, "$1-$2");
                cpfInput.value = v;
            });
        }

        if (phoneInput) {
            phoneInput.addEventListener("input", () => {
                let v = phoneInput.value.replace(/\D/g, "").slice(0, 11);
                if (v.length <= 10) {
                    v = v.replace(/(\d{2})(\d)/, "($1) $2");
                    v = v.replace(/(\d{4})(\d)/, "$1-$2");
                } else {
                    v = v.replace(/(\d{2})(\d)/, "($1) $2");
                    v = v.replace(/(\d{5})(\d)/, "$1-$2");
                }
                phoneInput.value = v;
            });
        }

        if (cepInput) {
            cepInput.addEventListener("input", () => {
                let v = cepInput.value.replace(/\D/g, "").slice(0, 8);
                v = v.replace(/(\d{5})(\d)/, "$1-$2");
                cepInput.value = v;
            });
        }

        if (cardNumberInput) {
            cardNumberInput.addEventListener("input", () => {
                let v = cardNumberInput.value.replace(/\D/g, "").slice(0, 16);
                const grupos = v.match(/.{1,4}/g);
                cardNumberInput.value = grupos ? grupos.join(" ") : v;
            });
        }

        if (cardExpiryInput) {
            cardExpiryInput.addEventListener("input", () => {
                let v = cardExpiryInput.value.replace(/\D/g, "").slice(0, 4);
                v = v.replace(/(\d{2})(\d)/, "$1/$2");
                cardExpiryInput.value = v;
            });
        }

        if (cardCvvInput) {
            cardCvvInput.addEventListener("input", () => {
                let v = cardCvvInput.value.replace(/\D/g, "").slice(0, 3);
                cardCvvInput.value = v;
            });
        }
    }

    // -----------------------
    // ViaCEP
    // -----------------------
    async function fetchAddressByCep(cepRaw) {
        const cep = cepRaw.replace(/\D/g, "");
        if (cep.length !== 8) {
            showAlert("CEP inválido. Use 8 dígitos.", "warning");
            return;
        }

        try {
            const resp = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
            if (!resp.ok) throw new Error("Erro na requisição do CEP");

            const data = await resp.json();
            if (data.erro) {
                showAlert("CEP não encontrado.", "warning");
                return;
            }

            if (streetInput && data.logradouro) streetInput.value = data.logradouro;
            if (neighborhoodInput && data.bairro) neighborhoodInput.value = data.bairro;
            if (cityInput && data.localidade) cityInput.value = data.localidade;
            if (stateInput && data.uf) stateInput.value = data.uf;

            // Recalcula frete
            if (data.uf) {
                shippingValue = calcShipping(data.uf);
                updateTotalsDisplay();
            }

            showAlert("Endereço preenchido com base no CEP.", "success");
        } catch (err) {
            console.error(err);
            showAlert("Não foi possível consultar o CEP no momento.", "danger");
        }
    }

    // Chama ViaCEP ao sair do campo de CEP
    if (cepInput) {
        cepInput.addEventListener("blur", () => {
            const cepVal = cepInput.value.trim();
            if (cepVal) {
                fetchAddressByCep(cepVal);
            }
        });
    }

    // -----------------------
    // PREENCHE RESUMO DO CARRINHO
    // -----------------------
    const cart = getCart();

    if (!cart.length) {
        emptyState.classList.remove("d-none");
        hasItemsSection.classList.add("d-none");
        return;
    }

    listEl.innerHTML = "";
    subtotalValue = 0;

    cart.forEach((item) => {
        const itemTotal = item.price * item.qty;
        subtotalValue += itemTotal;

        const row = document.createElement("div");
        row.className = "d-flex justify-content-between align-items-center mb-2";

        row.innerHTML = `
            <div class="me-2 flex-grow-1">
                <div class="fw-semibold">${item.name}</div>
                <div class="text-muted">Qtd: ${item.qty}</div>
            </div>
            <div class="text-end" style="min-width: 90px;">
                ${formatBRL(itemTotal)}
            </div>
        `;
        listEl.appendChild(row);
    });

    // Frete inicial = 0 (até usuário informar CEP)
    shippingValue = 0;
    updateTotalsDisplay();

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
        const isPix = payPix && payPix.checked;

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
        const isPix = payPix && payPix.checked;

        if (!cardFields) return;

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

    if (payCard) payCard.addEventListener("change", updatePaymentVisibility);
    if (payPix) payPix.addEventListener("change", updatePaymentVisibility);
    updatePaymentVisibility();

    setupMasks();

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
        subtotalValue = 0;
        shippingValue = 0;
        updateTotalsDisplay();

        hasItemsSection.classList.add("d-none");
        emptyState.classList.remove("d-none");

        setTimeout(() => {
            window.location.href = "../index.html";
        }, 2000);
    });
});
