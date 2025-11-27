document.addEventListener("DOMContentLoaded", () => {
	const carouselWrapper = document.querySelector(".carousel-wrapper");
	const prevBtn = document.querySelector(".carousel-btn.prev");
	const nextBtn = document.querySelector(".carousel-btn.next");
	const json = "./data/products.json";

	let products = [];          // vai guardar os produtos carregados do JSON
	let nextProductIndex = 0;   // controla qual produto vem a seguir quando formos "ciclando"
	let isAppending = false;    // trava pra não disparar várias vezes seguidas

	// Cria um card de produto (reutilizável)
	function createProductCard(product) {
		const card = document.createElement("article");
		card.classList.add("product-card");

		const priceBRL = `R$ ${product.price.toFixed(2).replace(".", ",")}`;

		card.innerHTML = `
      <img src="${product.image}" alt="${product.alt ?? product.name}">
      <h3>${product.name}</h3>
      <p class="price">${priceBRL}</p>
    `;

		return card;
	}

	// Adiciona N cards seguindo a ordem dos produtos, em loop (1,2,3,1,2,3...)
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
				appendNextCards(2); // 🔹 aqui decide quantos cards novos colocar
				// libera a trava no próximo frame
				requestAnimationFrame(() => {
					isAppending = false;
				});
			}
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
			products = data;

			// Limpa (só por garantia)
			carouselWrapper.innerHTML = "";

			// Renderiza a primeira leva de produtos (ex: todos do JSON)
			products.forEach((product) => {
				const card = createProductCard(product);
				carouselWrapper.appendChild(card);
			});

			// Centraliza o scroll no meio do carrossel
			requestAnimationFrame(() => {
				const maxScroll = carouselWrapper.scrollWidth - carouselWrapper.clientWidth;
				if (maxScroll > 0) {
					carouselWrapper.scrollLeft = maxScroll / 2;
				}
			});

			// Ativa o infinite scroll
			setupInfiniteScroll();
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
