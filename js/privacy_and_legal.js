/**
 * the init-function in body onload
 */
async function privacyInit() {
	await includeHTML();
	highlightPrivacyLegalNavLink();
	changeLinks();
}


/**
 * Function to highlight the privacy or legal navigation link based on the current URL.
 *
 * @return {void} This function does not return anything.
 */
function highlightPrivacyLegalNavLink() {
	const currentURL = window.location.href;
	const searchStringPrivacy = "privacy.html";
	const searchStringPrivacyExternal = "privacy_external.html";
	const searchStringLegal = "legal_notice.html";
	const searchStringLegalExternal = "legal_notice_external.html";

	if (currentURL.includes(searchStringPrivacy) || currentURL.includes(searchStringPrivacyExternal)) {
		const privacyNavLink = document.getElementById('privacyNav');
		privacyNavLink.classList.add('highlit');
	} else if (currentURL.includes(searchStringLegal) || currentURL.includes(searchStringLegalExternal)) {
		const legalNavLink = document.getElementById('legalNav');
		legalNavLink.classList.add('highlit');
	}
}


/**
 * Updates the links for privacy and legal navigation based on the current URL if it includes "external".
 *
 * @return {void} This function does not return anything.
 */
function changeLinks(){
	const currentUrl = window.location.href;
	if (currentUrl.includes("external")) {
		document.getElementById('privacyNav').children[0].setAttribute("href", "privacy_external.html");
		document.getElementById('legalNav').children[0].setAttribute("href", "legal_notice_external.html");
	}
}



