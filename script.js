let clickCount = 0;

const countryInput = document.getElementById('country');
const countryCodeInput = document.getElementById('countryCode');
const myForm = document.getElementById('form');
const modal = document.getElementById('form-feedback-modal');
const clicksInfo = document.getElementById('click-count');

document.addEventListener("DOMContentLoaded", function () {
    const createAccountCheckbox = document.getElementById("create-account");
    const passwordField = document.getElementById("passwordSection");

    function togglePasswordField() {
        if (createAccountCheckbox.checked) {
            passwordField.closest('.mb-3').style.display = "flex";
            passwordField.setAttribute("required", "true");
        } else {
            passwordField.closest('.mb-3').style.display = "none";
            passwordField.removeAttribute("required");
        }
    }

    createAccountCheckbox.addEventListener("change", togglePasswordField);

    // Ukrycie pola hasła na starcie
    togglePasswordField();
});

document.addEventListener("DOMContentLoaded", function () {
    const vatInvoiceCheckbox = document.getElementById("vatUE");
    const invoiceFields = document.getElementById("invoiceSection");

    function togglePasswordField() {
        if (vatInvoiceCheckbox.checked) {
            invoiceFields.closest('.mb-3').style.display = "flex";
            invoiceFields.setAttribute("required", "true");
        } else {
            invoiceFields.closest('.mb-3').style.display = "none";
            invoiceFields.removeAttribute("required");
        }
    }

    vatInvoiceCheckbox.addEventListener("change", togglePasswordField);

    // Ukrycie pola hasła na starcie
    togglePasswordField();
});

function handleClick() {
    clickCount++;
    clicksInfo.innerText = clickCount;
}

async function fetchAndFillCountries() {
    try {
        const response = await fetch('https://restcountries.com/v3.1/all');
        if (!response.ok) {
            throw new Error('Błąd pobierania danych');
        }
        const data = await response.json();

        const countries = data.map(country => ({
            name: country.name.common,
            flag: country.flags.svg
        }));

        countries.sort((a, b) => a.name.localeCompare(b.name));
        // FIXME: Remove log line after testing 
        let logCountries = data.sort((a, b) => a.name.common.localeCompare(b.name.common))
        console.log(logCountries);
        countryInput.innerHTML = countries.map(country => 
            `<option value="${country.name}" data-flag="${country.flag}">
                ${country.flag ? `<img class="flag-icon" src="${country.flag}" alt="Flag">` : ''} 
                ${country.name}
            </option>`
        ).join('');

        const countriesCodes = data.map(country => ({
            name: country.name.common,
            flag: country.flags.svg,
            countryCode: country.idd.root + (country.idd.suffixes?.length === 1 ? country.idd.suffixes[0] : '')
        }));

        console.log(countriesCodes);

        countryCodeInput.innerHTML = countriesCodes.map(country => 
            `<option value="${country.name}" data-flag="${country.flag}" data-country-code="${country.countryCode}">
                ${country.flag ? `<img class="flag-icon" src="${country.flag}" alt="Flag">` : ''} 
                ${country.name}
            </option>`
        ).join('');
    } catch (error) {
        console.error('Wystąpił błąd:', error);
    }
}

async function getCountryByIP() {
    try {
        const response = await fetch('https://get.geojs.io/v1/ip/geo.json');
        const data = await response.json();
        console.log('Dane z serwera GeoJS:', data);
        return data.country;
    } catch (error) {
        console.error('Błąd pobierania danych z serwera GeoJS:', error);
        return null;
    }
}


(async () => {
    // nasłuchiwania na zdarzenie kliknięcia myszką
    document.addEventListener('click', handleClick);

    await fetchAndFillCountries();
    let currentIPCountry = await getCountryByIP()
    console.log('Bieżący kraj IP:', currentIPCountry);
    $('#country').val(currentIPCountry).trigger('change');
    $('#countryCode').val(currentIPCountry).trigger('change');
})()

function formatOption (state) {
    if (!state.id) return state.text;
    var img = $(state.element).data('flag');
    return $(
      `<div class="country-selected"><img src="${img}" class="flag-icon"> ${state.text}</div>`
    );
}

function countryCodesSelectionFormatOption (state) {
    if (!state.id) return state.text;
    let img = $(state.element).data('flag');
    let countryCode = $(state.element).data('country-code');
    return $(
      `<div class="country-code-selected"><img src="${img}" class="flag-icon"><div>${countryCode}</div></div>`
    );
}

function countryCodesResultFormatOption (state) {
    if (!state.id) return state.text;
    let img = $(state.element).data('flag');
    let countryCode = $(state.element).data('country-code');
    return $(
      `<span><img src="${img}" class="flag-icon"> (${countryCode}) ${state.text}</span>`
    );
}


// TODO: add click event for arrow
$(document).ready(function () {
    // Inicjalizacja Select2 dla dropdownów
    $('#country').select2({
        placeholder: "Wybierz...",
        templateResult: formatOption,
        templateSelection: formatOption,
        width: '100%',
    }).next('.select2-container').addClass('form-select');;

    $('#countryCode').select2({
        placeholder: "Wybierz...",
        templateSelection: countryCodesSelectionFormatOption,
        templateResult: countryCodesResultFormatOption,
        width: '100%',
        dropdownCssClass: 'country-code-dropdown',
        dropdownAutoWidth: true,
    }).next('.select2-container').addClass('form-select');;

    $('#countryCode').next('.select2-container').addClass('country-code-select2');
});
