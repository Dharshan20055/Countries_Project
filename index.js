const countriesContainer = document.getElementById("countries");
const paginationContainer = document.getElementById("pagination");

let allCountries = [];
let currentPage = 1;
const countriesPerPage = 16; 



fetch("https://restcountries.com/v3.1/all?fields=name,flags")
  .then(res => res.json())
  .then(data => {
    allCountries = data;
    displayCountries(currentPage);
    setupPagination();
  });

  function displayCountries(page) {
  countriesContainer.innerHTML = "";

  const start = (page - 1) * countriesPerPage;
  const end = start + countriesPerPage;

  allCountries.slice(start, end).forEach(country => {
    const card = document.createElement("div");
    card.className = "card";

    card.innerHTML = `
      <img src="${country.flags.png}">
      <p>${country.name.common}</p>
    `;

    countriesContainer.appendChild(card);
  });
}


function setupPagination() {
  paginationContainer.innerHTML = "";
  const pageCount = Math.ceil(allCountries.length / countriesPerPage);

  for (let i = 1; i <= pageCount; i++) {
    const btn = document.createElement("button");
    btn.innerText = i;

    if (i === currentPage) btn.classList.add("active");

    btn.onclick = () => {
      currentPage = i;
      displayCountries(currentPage);
      setupPagination();
    };

    paginationContainer.appendChild(btn);
  }
}

