document.addEventListener("DOMContentLoaded", async () => {
    const params = new URLSearchParams(window.location.search);
    const q = params.get("q")?.trim();

    const titleEl = document.getElementById("search-title");
    const resultsBox = document.getElementById("search-results");

    if (!q) {
        titleEl.textContent = "Digite algo para buscar";
        resultsBox.innerHTML = `
            <div class="col-12 alert alert-warning">
                Nenhuma busca realizada.
            </div>`;
        return;
    }

    // coloca o termo na barra de busca do topo
    const headerInput = document.querySelector(".search-input");
    if (headerInput) headerInput.value = q;

    titleEl.textContent = `Resultados para "${q}"`;

    // -----------------------------
    // Carregar todos os produtos
    // -----------------------------
    const data = await fetch("../data/products.json").then(r => r.json());

    const allProducts = [];
    data.forEach(cat =>
        cat.subcategories?.forEach(sub =>
            sub.products?.forEach(p =>
                allProducts.push({ ...p, category: cat.category, subcategory: sub.name })
            )
        )
    );

    function normalize(text) {
        return text.toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "");
    }

    const nq = normalize(q);

    const filtered = allProducts.filter(p =>
        normalize(p.name).includes(nq) ||
        normalize(p.category).includes(nq) ||
        normalize(p.subcategory).includes(nq) ||
        normalize(p.desc || "").includes(nq)
    );

    if (!filtered.length) {
        resultsBox.innerHTML = `
            <div class="col-12 alert alert-info">
                Nenhum produto encontrado para <strong>${q}</strong>.
            </div>`;
        return;
    }

    // -----------------------------
    // Função de card igual ao index
    // -----------------------------
    function createProductCard(product, extraClass = "") {
        const card = document.createElement("article");
        card.classList.add(
            "product-card",
            "d-flex",
            "flex-column",
            "align-items-center"
        );
        if (extraClass) card.classList.add(extraClass);

        const priceBRL = `R$ ${product.price.toFixed(2).replace(".", ",")}`;
        const imageSrc =
            '.'+product.img ||
            (product.images && product.images[0]) ||
            "https://via.placeholder.com/300x200";

        card.innerHTML = `
            <a href="./product.html?id=${product.id}" class="product-item text-decoration-none text-center">
                <img src="${imageSrc}" alt="${product.alt ?? product.name}">
                <h3>${product.name}</h3>
            </a>
            <p class="price">${priceBRL}</p>
            <button class="btn btn-primary buy-btn">
                <i class="fa fa-shopping-cart cart-icon text-center"></i>
                Comprar
            </button>
        `;

        return card;
    }

    // -----------------------------
    // Montar cards no grid
    // -----------------------------
    resultsBox.innerHTML = "";

    filtered.forEach(product => {
        const col = document.createElement("div");
        col.className = "col-6 col-md-4 col-lg-3";

        const card = createProductCard(product, "product-card-grid");
        col.appendChild(card);
        resultsBox.appendChild(col);

        const buyBtn = card.querySelector(".buy-btn");
        buyBtn.addEventListener("click", (e) => {
            e.preventDefault();
            addToCart(product);
        });
    });
});
