let products = []; // Initialize as an empty array
let filteredProducts = [];
const productsContainer = document.getElementById("productsContainer");
const searchInput = document.getElementById("searchInput");
const prevPageButton = document.getElementById("prevPage");
const nextPageButton = document.getElementById("nextPage");
const pageNumbersContainer = document.getElementById("pageNumbers");
const productTypeFilter = document.getElementById("productTypeFilter");

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
  const productsPerPage = 12;
  let sortedProducts = [...productList]; // Create a copy to avoid mutating the original

  // Sort products
  sortedProducts.sort((a, b) => {
    // First, sort by availability: available > unavailable > coming-soon
    const availabilityOrder = {
      available: 1,
      unavailable: 2,
      "coming-soon": 3,
    };
    const availabilityComparison =
      availabilityOrder[a.availability] - availabilityOrder[b.availability];
    if (availabilityComparison !== 0) {
      return availabilityComparison; // Products with different availability
    }

    // If availability is the same, sort "available" products by isFeatured (true > false)
    if (a.availability === "available" && b.availability === "available") {
      if (a.isFeatured && !b.isFeatured) {
        return -1; // a is featured, b is not
      } else if (!a.isFeatured && b.isFeatured) {
        return 1; // b is featured, a is not
      }
      // else both are featured or neither is, so maintain original order
    }

    return 0; // Maintain original order if availability and isFeatured are the same
  });

  const startIndex = (page - 1) * productsPerPage;
  const endIndex = startIndex + productsPerPage;
  const productsToDisplay = sortedProducts.slice(startIndex, endIndex);

  productsToDisplay.forEach((product) => {
    let thumbnail =
      product.images &&
      product.images.length > 0 &&
      product.images[0].cloudinaryUrl
        ? product.images[0].cloudinaryUrl
        : "https://via.placeholder.com/150";

    const productCard = document.createElement("div");
    productCard.className =
      "bg-white rounded-lg shadow-md p-4 min-h-[450px] h-auto transition-colors duration-200";

    let cardContent = "";
    let availabilityClasses = "";
    let cardStyle = "";
    let clickEvent = `window.location.href = '/products/${product.id}';`;

    if (product.availability === "unavailable") {
      availabilityClasses = "opacity-50 cursor-not-allowed";
      cardStyle = "background-color: #f3f4f6;";
      clickEvent = "";
    } else if (product.availability === "coming-soon") {
      availabilityClasses = "relative";
      cardStyle = "";
      cardContent = `<div class="absolute inset-0 bg-white/80 flex items-center justify-center rounded-lg">
                            <span class="text-xl font-bold text-gray-700">Coming Soon</span>
                           </div>`;
    } else {
      availabilityClasses =
        "cursor-pointer hover:bg-black hover:text-gray-100 group"; // Apply hover effects only to "available"
    }

    productCard.className += " " + availabilityClasses;
    productCard.style.cssText = cardStyle;

    // Product Types Listing
    let productTypesHtml = "";
    if (product.productTypes && product.productTypes.length > 0) {
      const displayedTypes = product.productTypes.slice(0, 3);
      productTypesHtml = displayedTypes
        .map(
          (type) =>
            `<span class="inline-block bg-indigo-200 text-indigo-700 px-2 py-1 rounded-full text-xs font-semibold mr-2 ${
              product.availability === "available"
                ? "group-hover:bg-indigo-500 group-hover:text-white"
                : ""
            }">${type}</span>`
        )
        .join("");
      productTypesHtml = `<div class="mb-2 transition-colors duration-200">${productTypesHtml}</div>`;
    }

    const priceColor =
      product.availability === "unavailable"
        ? "text-gray-600"
        : "text-green-600";

    cardContent += `
            <div class='flex justify-center items-center min-h-1/2 max-h-1/2'>
            <img src="${thumbnail}" alt="${product.name}" 
            class="mb-4 min-h-[250px] max-h-[250px] object-contain w-full"> 
            </div>
            <h3 class="text-xl font-semibold mb-2 ${
              product.availability === "available"
                ? "group-hover:text-white transition-colors duration-200"
                : ""
            }">${product.name}</h3>
            ${productTypesHtml}
            <p class="text-gray-600 mb-2 ${
              product.availability === "available"
                ? "group-hover:text-gray-300 transition-colors duration-200"
                : ""
            }">${
      product.details && product.details.length > 100
        ? product.details.substring(0, 100) + "..."
        : product.details || ""
    }</p>
            <p class="${priceColor} font-bold transition-colors duration-200 ${
      product.availability === "available" ? "group-hover:text-yellow-400" : ""
    }">${product.price}PHP</p>
        `;

    productCard.innerHTML = cardContent;

    if (clickEvent) {
      productCard.addEventListener("click", () => {
        window.location.href = `/products/${product.id}`;
      });
    }
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

function populateProductTypeFilter(types) {
  productTypeFilter.innerHTML = '<option value="">All Products</option>';

  types.forEach((type) => {
    const option = document.createElement("option");
    option.value = type.toLowerCase();
    option.textContent = type;
    productTypeFilter.appendChild(option);
  });
}

async function initializeProducts() {
  const fetchedProducts = await fetchProducts();
  products = fetchedProducts;
  filteredProducts = [...products];

  const uniqueTypes = [
    ...new Set(products.flatMap((product) => product.productTypes)),
  ];

  populateProductTypeFilter(uniqueTypes);
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

productTypeFilter.addEventListener("change", (event) => {
  const selectedType = event.target.value;
  currentPage = 1;
  if (selectedType === "") {
    filteredProducts = [...products];
  } else {
    filteredProducts = products.filter((product) => {
      if (selectedType === "") {
        return true; // Include all products if no type is selected
      }
      if (product.productTypes && product.productTypes.length > 0) {
        return product.productTypes.some(
          (type) => type.toLowerCase() === selectedType.toLowerCase()
        );
      }
      return false; // Exclude products that don't have the selected type
    });
  }
  updatePage();
});

document.addEventListener("keydown", (event) => {
  if (event.key === "/") {
    searchInput.focus();
    event.preventDefault();
  }
});
