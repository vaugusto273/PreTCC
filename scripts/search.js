document.addEventListener("DOMContentLoaded", () => {
    const forms = document.querySelectorAll(".search-bar");

    forms.forEach(form => {
        const input = form.querySelector(".search-input");
        const btn = form.querySelector(".btn-search");

        function doSearch(e) {
            if (e) e.preventDefault();
            const q = input.value.trim();

            if (!q) {
                showAlert("Digite algo para pesquisar.", "warning");
                return;
            }

            window.location.href = `/pages/search.html?q=${encodeURIComponent(q)}`;
        }

        form.addEventListener("submit", doSearch);
        btn.addEventListener("click", doSearch);
    });
});
