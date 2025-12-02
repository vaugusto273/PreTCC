document.addEventListener("DOMContentLoaded", async () => {
	const params = new URLSearchParams(window.location.search);
	const categoryParam = params.get("category"); // ex: "Eletrodomésticos"
	const subcategoryParam = params.get("subcategory"); // ex: "Micro-ondas"

	const titleEl = document.getElementById("category-title");
	const subtitleEl = document.getElementById("category-subtitle");
	const gridEl = document.getElementById("category-products-grid");
	const emptyEl = document.getElementById("category-empty");
	const breadcrumbEl = document.getElementById("category-breadcrumb");

	if (!categoryParam && !subcategoryParam) {
		document.title = "Snapps - Categoria";
		titleEl.textContent = "Categoria não especificada";
		subtitleEl.textContent = "Use o menu de categorias para escolher o que deseja visualizar.";
		emptyEl.classList.remove("d-none");
		return;
	}

	let pageTitle = "";
	let breadcrumbHTML = `
        <li class="breadcrumb-item"><a href="../index.html">Início</a></li>
    `;

	if (categoryParam && subcategoryParam) {
		pageTitle = `${subcategoryParam} (${categoryParam})`;
		breadcrumbHTML += `
            <li class="breadcrumb-item">${categoryParam}</li>
            <li class="breadcrumb-item active" aria-current="page">${subcategoryParam}</li>
        `;
	} else if (subcategoryParam) {
		pageTitle = subcategoryParam;
		breadcrumbHTML += `
            <li class="breadcrumb-item active" aria-current="page">${subcategoryParam}</li>
        `;
	} else {
		pageTitle = categoryParam;
		breadcrumbHTML += `
            <li class="breadcrumb-item active" aria-current="page">${categoryParam}</li>
        `;
	}

	breadcrumbEl.innerHTML = breadcrumbHTML;
	titleEl.textContent = pageTitle;
	document.title = `Snapps - ${pageTitle}`;

	subtitleEl.textContent =
		categoryParam && subcategoryParam
			? `Mostrando produtos da subcategoria "${subcategoryParam}" em "${categoryParam}".`
			: categoryParam
			? `Mostrando produtos da categoria "${categoryParam}".`
			: `Mostrando produtos da subcategoria "${subcategoryParam}".`;

	// ------- Carrega o JSON -------
	let data;
	try {
		const response = await fetch("../data/products.json");
		if (!response.ok) throw new Error("Erro ao carregar JSON");
		data = await response.json();
	} catch (err) {
		console.error(err);
		emptyEl.classList.remove("d-none");
		emptyEl.textContent = "Não foi possível carregar os produtos.";
		return;
	}

	// ------- Achata e filtra -------
	const allProducts = [];
	data.forEach((cat) => {
		cat.subcategories?.forEach((sub) => {
			sub.products?.forEach((prod) => {
				allProducts.push({
					...prod,
					category: cat.category,
					subcategory: sub.name,
				});
			});
		});
	});

	let filtered = allProducts;

	if (categoryParam) {
		const catLower = categoryParam.toLowerCase();
		filtered = filtered.filter((p) => p.category.toLowerCase() === catLower);
	}

	if (subcategoryParam) {
		const subLower = subcategoryParam.toLowerCase();
		filtered = filtered.filter((p) => p.subcategory.toLowerCase() === subLower);
	}

	if (!filtered.length) {
		emptyEl.classList.remove("d-none");
		return;
	}

	emptyEl.classList.add("d-none");
	gridEl.innerHTML = "";

	// ------- Helpers -------

	function resolveImagePath(imgPath) {
		if (!imgPath) return "https://via.placeholder.com/300x200";
		// se já estiver começando com "../" deixamos
		if (imgPath.startsWith("../")) return imgPath;
		// se vier como "./assets/..." (igual no index), ajusta para "../assets/..."
		if (imgPath.startsWith("./")) return ".." + imgPath.slice(1);
		return imgPath;
	}

	function createCategoryCard(product) {
		const col = document.createElement("div");
		col.className = "col-6 col-md-4 col-lg-3";

		const card = document.createElement("article");
		card.className = "product-card d-flex flex-column align-items-center";

		const priceBRL = `R$ ${product.price.toFixed(2).replace(".", ",")}`;
		const imageSrc = resolveImagePath(product.img);

		card.innerHTML = `
            <a href="./product.html?id=${encodeURIComponent(product.id)}"
               class="w-100 text-decoration-none text-center product-item">
                <img src="${imageSrc}" alt="${product.alt ?? product.name}">
                <h3>${product.name}</h3>
            </a>
            <p class="price">${priceBRL}</p>
            <button class="btn btn-primary buy-btn">
                <i class="fa fa-shopping-cart cart-icon text-center"></i>
                Comprar
            </button>
        `;

		const buyBtn = card.querySelector(".buy-btn");
		buyBtn.addEventListener("click", (e) => {
			e.preventDefault();
			addToCart(product);
		});

		col.appendChild(card);
		return col;
	}

	// ------- Renderiza cards -------
	filtered.forEach((product) => {
		const col = createCategoryCard(product);
		gridEl.appendChild(col);
	});

	// ------- Form de busca no topo (mesma lógica da search-page) -------
	const searchForm = document.getElementById("search-form");
	const searchInput = document.getElementById("search-input");

	if (searchForm && searchInput) {
		searchForm.addEventListener("submit", (event) => {
			event.preventDefault();
			const q = searchInput.value.trim();
			if (!q) return;
			window.location.href = `./search.html?q=${encodeURIComponent(q)}`;
		});
	}
});
