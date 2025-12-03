(function () {
	const translations = {
		en: "Loading...",
		cs: "Načítání...",
	};

	function getLang() {
		return localStorage.getItem("i18nextLng") || document.cookie.match(/(?:^|; )i18next=([^;]*)/)?.[1] || navigator.language.split("-")[0] || "en";
	}

	const lang = getLang();
	const text = translations[lang] || translations["en"];

	const el = document.getElementById("loader-text");
	if (el) el.textContent = text;
})();
