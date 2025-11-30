document.addEventListener("DOMContentLoaded", () => {
	const form = document.getElementById("contactForm");
	if (!form) return;

	form.addEventListener("submit", function (event) {
		event.preventDefault();
		event.stopPropagation();

		if (!form.checkValidity()) {
			form.classList.add("was-validated");
			return;
		}

		// Aqui seria o envio real (fetch / backend).
		// Como é só front, mostramos um alerta de sucesso.
		if (typeof showAlert === "function") {
			showAlert("Sua mensagem foi enviada! Em breve entraremos em contato.", "success");
		} else {
			alert("Sua mensagem foi enviada! Em breve entraremos em contato.");
		}

		form.reset();
		form.classList.remove("was-validated");
	});
});
