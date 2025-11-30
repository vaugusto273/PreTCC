document.addEventListener("DOMContentLoaded", async () => {
    const params = new URLSearchParams(window.location.search);
    const productId = params.get("id");

    if (!productId) {
        document.querySelector("main").innerHTML =
            `<div class="alert alert-danger mt-5">Produto não encontrado.</div>`;
        return;
    }

    // Carrega JSON de produtos
    let data;
    try {
        const res = await fetch("../data/products.json");
        if (!res.ok) throw new Error("Erro ao carregar JSON");
        data = await res.json();
    } catch (err) {
        console.error(err);
        document.querySelector("main").innerHTML =
            `<div class="alert alert-danger mt-5">Erro ao carregar informações do produto.</div>`;
        return;
    }

    // Achata categories/subcategories → lista única
    const all = [];
    data.forEach(cat =>
        cat.subcategories?.forEach(sub =>
            sub.products?.forEach(p =>
                all.push({ ...p, category: cat.category, subcategory: sub.name })
            )
        )
    );

    const product = all.find(p => p.id === productId);

    if (!product) {
        document.querySelector("main").innerHTML =
            `<div class="alert alert-danger mt-5">Produto não encontrado.</div>`;
        return;
    }

    // ---------- Breadcrumb ----------
    const breadcrumb = document.getElementById("breadcrumb");
    breadcrumb.innerHTML = `
        <li class="breadcrumb-item"><a href="../index.html">Início</a></li>
        <li class="breadcrumb-item">${product.category}</li>
        <li class="breadcrumb-item">${product.subcategory}</li>
        <li class="breadcrumb-item active" aria-current="page">${product.name}</li>
    `;

    // ---------- Título, preço, estoque, descrição ----------
    document.getElementById("product-title").textContent = product.name;

    document.getElementById("product-price").textContent =
        `R$ ${product.price.toFixed(2).replace(".", ",")}`;

    document.getElementById("product-stock").textContent =
        `${product.stock} unidades disponíveis • envio imediato`;

    document.getElementById("product-desc").textContent = product.desc;

    // ---------- Imagens ----------
    const mainImg = document.getElementById("product-main-img");
    mainImg.src = "." + product.img;
    mainImg.alt = product.alt || product.name;

    const thumbs = document.getElementById("product-thumbs");
    thumbs.innerHTML = `
        <img src="${"." + product.img}" 
             class="img-thumbnail flex-fill thumb-item" 
             alt="${product.alt || product.name}">
    `;

    thumbs.querySelectorAll(".thumb-item").forEach(thumb => {
        thumb.addEventListener("click", () => {
            mainImg.src = thumb.src;
        });
    });

    // ---------- Especificações ----------
    const specsBox = document.getElementById("product-specs");
    specsBox.innerHTML = `
        <h2 class="h6 fw-semibold mb-2">Destaques do produto</h2>
        <ul class="mb-0">
            ${(product.specs || []).map(s => `<li>${s}</li>`).join("")}
        </ul>
    `;

    // ---------- Botões: adicionar / comprar agora ----------
    const qtyInput = document.getElementById("qty");
    const btnAdd = document.getElementById("btn-add-cart");
    const btnBuyNow = document.getElementById("btn-buy-now");

    function getQty() {
        const value = Number(qtyInput.value);
        const qty = Number.isFinite(value) && value > 0 ? value : 1;
        qtyInput.value = qty;
        return qty;
    }

    // Adicionar ao carrinho
    btnAdd.addEventListener("click", () => {
        const qty = getQty();
        for (let i = 0; i < qty; i++) {
            // addToCart está definido em cart.js e já chama showAlert
            addToCart(product);
        }
    });

    // Comprar agora: adiciona e vai para o checkout
    btnBuyNow.addEventListener("click", () => {
        const qty = getQty();
        for (let i = 0; i < qty; i++) {
            addToCart(product);
        }
        window.location.href = "./checkout.html";
    });
});
