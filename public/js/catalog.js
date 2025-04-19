let products = []; // Initialize as an empty array
let filteredProducts = [];
const productsContainer = document.getElementById("productsContainer");
const searchInput = document.getElementById("searchInput");
const prevPageButton = document.getElementById("prevPage");
const nextPageButton = document.getElementById("nextPage");
const pageNumbersContainer = document.getElementById("pageNumbers");

const productsPerPage = 12;
let currentPage = 1;

async function fetchProducts() {
  try {
    const response = await fetch("/products/get-products");
    const fetchedProducts = await response.json();
    return fetchedProducts;
  } catch (error) {
    console.error("Error fetching products:", error);
    return [];
  }
}

function displayProducts(productList, page) {
  productsContainer.innerHTML = "";
  const startIndex = (page - 1) * productsPerPage;
  const endIndex = startIndex + productsPerPage;
  const productsToDisplay = productList.slice(startIndex, endIndex);

  productsToDisplay.forEach((product) => {
    let thumbnail = product["images"][0]["cloudinaryUrl"];

    const productCard = document.createElement("div");
    productCard.className =
      "bg-white rounded-lg shadow-md p-4 min-h-[450px] max-h-[450px] cursor-pointer hover:bg-gray-100 transition-colors duration-200";
    productCard.innerHTML = `
            <div class='flex justify-center items-center min-h-1/2 max-h-1/2'>
            <img src="${thumbnail}" alt="${product.name}" 
            class="mb-4 min-h-[250px] max-h-[250px] object-contain w-full"> 
            </div>
            <h3 class="text-xl font-semibold mb-2">${product.name}</h3>
            <p class="text-gray-600 mb-2">${
              product.details && product.details.length > 100
                ? product.details.substring(0, 100) + "..."
                : product.details || ""
            }</p>
            <p class="text-green-600 font-bold">${product.price}PHP</p>
        `;
    productCard.addEventListener("click", () => {
      window.location.href = `/products/${product.id}`;
    });
    productsContainer.appendChild(productCard);
  });
}

function updatePaginationButtons(productList) {
  pageNumbersContainer.innerHTML = "";
  const pageCount = Math.ceil(productList.length / productsPerPage);
  for (let i = 1; i <= pageCount; i++) {
    const pageButton = document.createElement("button");
    pageButton.className = `px-3 py-1 bg-gray-200 rounded-md mr-1 ${
      currentPage === i ? "bg-cyan-500 text-white" : ""
    }`;
    pageButton.textContent = i;
    pageButton.addEventListener("click", () => {
      currentPage = i;
      displayProducts(productList, currentPage);
      updatePaginationButtons(productList);
    });
    pageNumbersContainer.appendChild(pageButton);
  }
}

function updatePage() {
  displayProducts(filteredProducts, currentPage);
  updatePaginationButtons(filteredProducts);
}

async function initializeProducts() {
  const fetchedProducts = await fetchProducts();
  products = fetchedProducts;
  filteredProducts = [...products];
  updatePage();
}

initializeProducts();

searchInput.addEventListener("input", () => {
  const searchTerm = searchInput.value.toLowerCase();
  filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchTerm)
  );
  currentPage = 1;
  updatePage();
});

prevPageButton.addEventListener("click", () => {
  if (currentPage > 1) {
    currentPage--;
    updatePage();
  }
});

nextPageButton.addEventListener("click", () => {
  const pageCount = Math.ceil(filteredProducts.length / productsPerPage);
  if (currentPage < pageCount) {
    currentPage++;
    updatePage();
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "/") {
    searchInput.focus();
    event.preventDefault();
  }
});
