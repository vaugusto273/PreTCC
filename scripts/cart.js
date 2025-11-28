// ------------------------------
// CART MODULE
// ------------------------------

// ------------------------------
// BOOTSTRAP ALERT HELPER
// ------------------------------
function showAlert(message, type = "success") {
    const container = document.getElementById("alert-container");
    if (!container) return;

    const wrapper = document.createElement("div");
    wrapper.innerHTML = `
        <div class="alert alert-${type} alert-dismissible fade show" role="alert">
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        </div>
    `;

    const alertElement = wrapper.firstElementChild;
    container.appendChild(alertElement);

    // Remove automaticamente após 3s
    setTimeout(() => {
        const alertInstance = bootstrap.Alert.getOrCreateInstance(alertElement);
        alertInstance.close();
    }, 3000);
}

// Pega o carrinho salvo no localStorage
function getCart() {
    return JSON.parse(localStorage.getItem("cart") || "[]");
}

// Salva o carrinho no localStorage
function saveCart(cart) {
    localStorage.setItem("cart", JSON.stringify(cart));
}

// Adiciona 1 item ao carrinho
function addToCart(product) {
    const cart = getCart();

    const existing = cart.find(item => item.id === product.id);

    if (existing) {
        existing.qty += 1;
    } else {
        cart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            img: product.img || (product.images && product.images[0]),
            qty: 1
        });
    }

    saveCart(cart);
    updateCartDisplay();

    // 🔹 ALERTA BOOTSTRAP
    showAlert(`"${product.name}" foi adicionado ao carrinho!`, "success");
}

// 🔹 Remove um item do carrinho (remove o produto inteiro, não só -1 quantidade)
function removeFromCart(productId) {
    const cart = getCart().filter(item => item.id !== productId);
    saveCart(cart);
}

// Quantidade total (soma de todos os itens)
function getCartQty() {
    return getCart().reduce((sum, item) => sum + item.qty, 0);
}

// Valor total
function getCartTotal() {
    return getCart().reduce((sum, item) => sum + item.qty * item.price, 0);
}

// Atualiza o texto do botão do carrinho (Navbar)
function updateCartDisplay() {
    const cartPriceEl = document.querySelector(".cart-price");
    const total = getCartTotal();

    if (cartPriceEl) {
        cartPriceEl.textContent =
            total > 0 ? `R$ ${total.toFixed(2).replace(".", ",")}` : "R$ 0,00";
    }
}

// 🔹 Monta a lista de itens dentro do offcanvas
function renderCartItems() {
    const cart = getCart();
    const listEl = document.querySelector(".cart-items-list");
    const totalEl = document.querySelector(".cart-total-value");

    if (!listEl || !totalEl) return;

    listEl.innerHTML = "";

    if (cart.length === 0) {
        listEl.innerHTML = `<p class="text-muted mb-0">Seu carrinho está vazio.</p>`;
        totalEl.textContent = "R$ 0,00";
        return;
    }

    cart.forEach(item => {
        const row = document.createElement("div");
        row.className = "d-flex align-items-center mb-2 cart-item";
        row.dataset.id = item.id; // pra facilitar

        const itemTotal = item.price * item.qty;
        const itemTotalBRL = `R$ ${itemTotal.toFixed(2).replace(".", ",")}`;

        row.innerHTML = `
            <img 
                src="${item.img || "https://via.placeholder.com/60x60"}" 
                alt="${item.name}"
                class="me-2"
                style="width: 48px; height: 48px; object-fit: contain;"
            >
            <div class="flex-grow-1">
                <div class="fw-semibold small">${item.name}</div>
                <div class="text-muted small">Qtd: ${item.qty}</div>
            </div>
            <div class="text-end" style="min-width: 110px;">
                <div class="fw-semibold small">
                    ${itemTotalBRL}
                </div>
                <button type="button" class="btn btn-link btn-sm text-danger cart-remove-btn p-0">
                    Remover
                </button>
            </div>
        `;

        listEl.appendChild(row);
    });

    const total = getCartTotal();
    totalEl.textContent = `R$ ${total.toFixed(2).replace(".", ",")}`;
}

// Atualiza assim que a página carregar e conecta o clique do carrinho + remover
document.addEventListener("DOMContentLoaded", () => {
    updateCartDisplay();

    // todos os botões que abrem o carrinho (.cart-btn)
    const cartButtons = document.querySelectorAll(".cart-btn");
    const cartOffcanvasEl = document.getElementById("cartOffcanvas");
    const cartItemsList = document.querySelector(".cart-items-list");

    if (cartOffcanvasEl && cartButtons.length > 0) {
        const offcanvasInstance = bootstrap.Offcanvas.getOrCreateInstance(cartOffcanvasEl);

        cartButtons.forEach(btn => {
            btn.addEventListener("click", () => {
                renderCartItems();      // monta a lista atualizada
                offcanvasInstance.show();
            });
        });
    }

    // 🔹 Delegação de clique para o botão "Remover"
    if (cartItemsList) {
        cartItemsList.addEventListener("click", (event) => {
            const removeBtn = event.target.closest(".cart-remove-btn");
            if (!removeBtn) return;

            // sobe até o .cart-item pra pegar o id do produto
            const itemRow = removeBtn.closest(".cart-item");
            const productId = itemRow?.dataset.id;
            if (!productId) return;

            removeFromCart(productId);
            renderCartItems();
            updateCartDisplay();
        });
    }
});
