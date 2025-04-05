const statusMap = {
  "Order Received": 0,
  "Design Proofing/Review": 1,
  "Design Approved": 2,
  "Payment Confirmed": 3,
  "In Production": 4,
  "Printing Completed": 5,
  "Finishing/Binding": 6,
  "Quality Check": 7,
  "Ready for Pickup/Shipping": 8,
  Shipped: 9,
  "Out for Delivery": 10,
  Delivered: 11,
};

const ordersTableBody = document.getElementById("ordersTableBody");
const searchInput = document.getElementById("searchInput");
const pageNumbers = document.getElementById("pageNumbers");
const prevPage = document.getElementById("prevPage");
const nextPage = document.getElementById("nextPage");

let currentPage = 1;
const itemsPerPage = 10;
let originalOrders = [];
let displayedOrders = [];

async function fetchOrdersFromFirestore() {
  try {
    const response = await fetch("get-orders");
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    originalOrders = data;
    displayedOrders = [...data];
  } catch (error) {
    console.error("Error fetching orders:", error);
    Swal.fire({
      icon: "error",
      title: "Fetch Error",
      text: error.message || "Failed to fetch orders.",
    });
  }
}

function displayOrders() {
  ordersTableBody.innerHTML = "";
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const pageOrders = displayedOrders.slice(startIndex, endIndex);

  pageOrders.forEach((order, index) => {
    const row = document.createElement("tr");
    let borderClass = "border-b border-gray-200";

    if (index === pageOrders.length - 1) {
      borderClass = "";
    }

    let statusColor = "bg-gray-200 text-gray-800"; // Default color
    if (order.status === "Order Received") {
      statusColor = "bg-blue-200 text-blue-800";
    } else if (order.status === "Design Proofing/Review") {
      statusColor = "bg-yellow-200 text-yellow-800";
    } else if (order.status === "Design Approved") {
      statusColor = "bg-green-200 text-green-800";
    } else if (order.status === "Payment Confirmed") {
      statusColor = "bg-green-300 text-green-800";
    } else if (order.status === "In Production") {
      statusColor = "bg-indigo-200 text-indigo-800";
    } else if (order.status === "Printing Completed") {
      statusColor = "bg-purple-200 text-purple-800";
    } else if (order.status === "Finishing/Binding") {
      statusColor = "bg-pink-200 text-pink-800";
    } else if (order.status === "Quality Check") {
      statusColor = "bg-teal-200 text-teal-800";
    } else if (order.status === "Ready for Pickup/Shipping") {
      statusColor = "bg-lime-200 text-lime-800";
    } else if (order.status === "Shipped") {
      statusColor = "bg-orange-200 text-orange-800";
    } else if (order.status === "Out for Delivery") {
      statusColor = "bg-amber-200 text-amber-800";
    } else if (order.status === "Delivered") {
      statusColor = "bg-green-500 text-white";
    }

    row.innerHTML = `
          <td class="p-3 ${borderClass}">${order.trackingId}</td>
          <td class="p-3 ${borderClass} hidden xl:table-cell">${order.client.email}</td>
          <td class="p-3 ${borderClass}"><span class="px-2 py-1 rounded-full ${statusColor} text-nowrap">${order.status}</span></td>
          <td class="p-3 ${borderClass}" id="actionBtn">
              <button class="bg-blue-500 text-white px-3 py-1 rounded-md" id="${order.trackingId}">View</button>
          </td>
      `;
    ordersTableBody.appendChild(row);

    const view = row.children["actionBtn"].querySelector("button");
    view.onclick = () => {
      window.location.href = "/admin/orders/" + view.id;
    };
  });
}

function displayPagination() {
  pageNumbers.innerHTML = "";
  const totalPages = Math.ceil(displayedOrders.length / itemsPerPage);
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
      updatePage();
    });
    pageNumbers.appendChild(pageNumber);
  }
}

function updatePage() {
  displayOrders();
  displayPagination();
}

async function initializePage() {
  await fetchOrdersFromFirestore();
  updatePage();
}

initializePage();

searchInput.addEventListener("keyup", () => {
  const searchTerm = searchInput.value.toLowerCase();

  if (searchTerm === "") {
    displayedOrders = [...originalOrders];
  } else {
    displayedOrders = originalOrders.filter(
      (order) =>
        order.trackingId.toLowerCase().includes(searchTerm) ||
        order.client.email.toLowerCase().includes(searchTerm) ||
        order.status.toLowerCase().includes(searchTerm)
    );
  }

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
  const totalPages = Math.ceil(displayedOrders.length / itemsPerPage);
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
