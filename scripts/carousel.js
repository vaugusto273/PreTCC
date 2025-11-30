document.addEventListener("DOMContentLoaded", () => {
	const carouselWrapper = document.querySelector(".carousel-wrapper");
	const prevBtn = document.querySelector(".carousel-btn.prev");
	const nextBtn = document.querySelector(".carousel-btn.next");
	const json = "./data/products.json";

	let products = []; // vai guardar TODOS os produtos (já achatados e embaralhados)
	let nextProductIndex = 0; // controla qual produto vem a seguir
	let isAppending = false; // trava pra não disparar várias vezes seguidas

	function mdc(a, b) {
        return b === 0 ? a : mdc(b, a % b);
    }

    function mmc(a, b) {
        return (a * b) / mdc(a, b);
    }

    function mmcArray(arr) {
        return arr.reduce((acc, val) => mmc(acc, val));
    }

	// 🔹 Achata o JSON: categories -> subcategories -> products
	function getAllProducts(data) {
		const all = [];

		data.forEach((category) => {
			if (!category.subcategories) return;
			category.subcategories.forEach((subcat) => {
				if (!subcat.products) return;
				subcat.products.forEach((prod) => all.push(prod));
			});
		});

		return all;
	}

	// 🔹 Embaralha array (Fisher-Yates)
	function shuffleArray(array) {
		const arr = [...array];
		for (let i = arr.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[arr[i], arr[j]] = [arr[j], arr[i]];
		}
		return arr;
	}

	// Cria um card de produto (reutilizável)
	function createProductCard(product, extraClass = "") {
		const card = document.createElement("article");
		card.classList.add("product-card", "d-flex", "flex-column", "align-items-center");
		if (extraClass) {
			card.classList.add(extraClass); // para o grid
		}

		const priceBRL = `R$ ${product.price.toFixed(2).replace(".", ",")}`;

		// usa img principal ou primeira das images
		const imageSrc = product.img || (product.images && product.images[0]) || "https://via.placeholder.com/300x200";

		card.innerHTML = `
        <img src="${imageSrc}" alt="${product.alt ?? product.name}">
        <h3>${product.name}</h3>
        <p class="price">${priceBRL}</p>
        <button class="btn btn-primary">
            <i class="fa fa-shopping-cart cart-icon text-center"></i>
            Comprar
        </button>
    `;

		return card;
	}

	// Adiciona N cards seguindo a ordem dos produtos (já embaralhados), em loop
	function appendNextCards(quantity) {
		if (!products.length) return;

		for (let i = 0; i < quantity; i++) {
			const product = products[nextProductIndex];
			const card = createProductCard(product);
			carouselWrapper.appendChild(card);

			// avança pro próximo produto, voltando ao 0 quando chegar no fim
			nextProductIndex = (nextProductIndex + 1) % products.length;
		}
	}

	// Configura o "infinite scroll": quando chegar perto do fim, gera mais cards
	function setupInfiniteScroll() {
		carouselWrapper.addEventListener("scroll", () => {
			const threshold = 200; // distância em px antes do fim para disparar
			const position = carouselWrapper.scrollLeft + carouselWrapper.clientWidth;
			const maxScroll = carouselWrapper.scrollWidth;

			if (!isAppending && position >= maxScroll - threshold) {
				isAppending = true;
				appendNextCards(2); // 🔹 quantos cartões novos adicionar por vez
				requestAnimationFrame(() => {
					isAppending = false;
				});
			}
		});
	}

function renderRandomProductsGrid(allProducts) {
        const grid = document.getElementById("random-products-grid");
        if (!grid) return;

        const shuffled = shuffleArray(allProducts);

        const total = shuffled.length;

        const hardLimit = Math.min(20, total);

        // quantos cabem por linha em cada breakpoint
        const perRow = [2, 3, 4]; // col-6, col-md-4, col-lg-3

        // MMC desses valores (2,3,4) => 12
        const idealGroup = mmcArray(perRow);

        let count = Math.floor(hardLimit / idealGroup) * idealGroup;

        if (count === 0) {
            const desktopCols = perRow[perRow.length - 1]; // 4
            count = Math.floor(hardLimit / desktopCols) * desktopCols;
        }

        if (count === 0) {
            count = hardLimit;
        }

        const selectedProducts = shuffled.slice(0, count);

        grid.innerHTML = "";

        selectedProducts.forEach((product) => {
            const col = document.createElement("div");
            col.className = "col-6 col-md-4 col-lg-3";

            const card = createProductCard(product, "product-card-grid");
            col.appendChild(card);

            grid.appendChild(col);
        });
    }



	// Carrega o JSON de produtos
	fetch(json)
		.then((response) => {
			if (!response.ok) {
				throw new Error("Erro ao carregar produtos: " + response.status);
			}
			return response.json();
		})
		.then((data) => {
			// 🔹 Achata o JSON (categories -> subcategories -> products)
			const allProducts = getAllProducts(data);

			if (!allProducts.length) {
				throw new Error("Nenhum produto encontrado no JSON.");
			}

			// 🔹 Embaralha para que a ordem seja aleatória
			products = shuffleArray(allProducts);
			nextProductIndex = 0;

			// Limpa (só por garantia)
			carouselWrapper.innerHTML = "";

			// 🔹 Renderiza a primeira leva de produtos aleatórios
			const INITIAL_CARDS = Math.min(8, products.length); // pode ajustar a quantidade inicial
			appendNextCards(INITIAL_CARDS);

			// Centraliza o scroll no meio do carrossel
			requestAnimationFrame(() => {
				const maxScroll = carouselWrapper.scrollWidth - carouselWrapper.clientWidth;
				if (maxScroll > 0) {
					carouselWrapper.scrollLeft = maxScroll / 2;
				}
			});

			// Ativa o infinite scroll
			setupInfiniteScroll();
			renderRandomProductsGrid(allProducts);
		})
		.catch((error) => {
			console.error(error);
			carouselWrapper.innerHTML = "<p>Não foi possível carregar os produtos.</p>";
		});

	// Navegação pelos botões ❮ ❯
	const scrollStep = 300; // px por clique, pode ajustar

	nextBtn.addEventListener("click", () => {
		carouselWrapper.scrollBy({
			left: scrollStep,
			behavior: "smooth",
		});
	});

	prevBtn.addEventListener("click", () => {
		carouselWrapper.scrollBy({
			left: -scrollStep,
			behavior: "smooth",
		});
	});
});
