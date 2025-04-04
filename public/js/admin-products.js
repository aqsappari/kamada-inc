const productsTableBody = document.getElementById("productsTableBody");
const searchInput = document.getElementById("searchInput");
const pageNumbers = document.getElementById("pageNumbers");
const prevPage = document.getElementById("prevPage");
const nextPage = document.getElementById("nextPage");

let currentPage = 1;
const itemsPerPage = 10;
let filteredProducts = [];

// Function to fetch products from Firestore
async function fetchProductsFromFirestore() {
  try {
    const response = await fetch("get-products");
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    filteredProducts = data; // Assign fetched data to filteredProducts
  } catch (error) {
    console.error("Error fetching products:", error);
    Swal.fire({
      icon: "error",
      title: "Fetch Error",
      text: error.message || "Failed to fetch products.",
    });
  }
}

// Function to display products
function displayProducts() {
  productsTableBody.innerHTML = "";
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const pageProducts = filteredProducts.slice(startIndex, endIndex);

  pageProducts.forEach((product, index) => {
    const row = document.createElement("tr");
    let borderClass = "border-b border-gray-200";

    if (index === pageProducts.length - 1) {
      borderClass = "";
    }

    row.innerHTML = `
          <td class="p-3 ${borderClass} hidden sm:table-cell">${product.productId}</td>
          <td class="p-3 ${borderClass}">${product.name}</td>
          <td class="p-3 ${borderClass}">${product.order}</td>
          <td class="p-3 ${borderClass}" id="actionBtn">
              <button class="bg-blue-500 text-white px-3 py-1 rounded-md" id="${product.productId}">View</button>
          </td>
      `;
    productsTableBody.appendChild(row);

    const view = row.children["actionBtn"].querySelector("button");
    view.onclick = () => {
      window.location.href = "/admin/products/" + view.id;
    };
  });
}

function displayPagination() {
  pageNumbers.innerHTML = "";
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const startPage = Math.max(1, currentPage - 2);
  const endPage = Math.min(totalPages, currentPage + 2);

  for (let i = startPage; i <= endPage; i++) {
    const pageNumber = document.createElement("button");
    pageNumber.textContent = i;
    pageNumber.classList.add(
      "px-3",
      "py-1",
      "rounded-md",
      "border",
      "border-gray-300",
      "bg-indigo-200",
      "text-white"
    );
    if (i === currentPage) {
      pageNumber.classList.replace("bg-indigo-200", "bg-indigo-500");
    }
    pageNumber.addEventListener("click", () => {
      currentPage = i;
      displayProducts();
      displayPagination();
    });
    pageNumbers.appendChild(pageNumber);
  }
}

function updatePage() {
  displayProducts();
  displayPagination();
}

// Initial fetch and display
async function initializePage() {
  await fetchProductsFromFirestore();
  updatePage(); // Display products and pagination
}

initializePage(); // Call the initialization function

searchInput.addEventListener("input", () => {
  const searchTerm = searchInput.value.toLowerCase();
  filteredProducts = filteredProducts.filter((product) =>
    product.name.toLowerCase().includes(searchTerm)
  );
  currentPage = 1;
  updatePage();
});

prevPage.addEventListener("click", () => {
  if (currentPage > 1) {
    currentPage--;
    updatePage();
  }
});

nextPage.addEventListener("click", () => {
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  if (currentPage < totalPages) {
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

const addProductButton = document.getElementById("addProductButton");

addProductButton.onclick = () => {
  window.location.href = "/admin/products/add-product";
};
