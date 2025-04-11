const ordersPerPage = 5;
let currentPage = 1;
let allOrders = [];

async function fetchOrders() {
  try {
    console.log("Fetching orders from /admin/get-orders...");
    const response = await fetch("/admin/get-orders");
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const orders = await response.json();
    console.log("Orders fetched:", orders);
    allOrders = orders;
    return orders;
  } catch (error) {
    console.error("Failed to fetch orders:", error);
    return [];
  }
}

async function displayOrders(page) {
  console.log(`Displaying orders for page: ${page}`);
  const ordersTableBody = document.getElementById("ordersTableBody");
  ordersTableBody.innerHTML = "";

  if (allOrders.length === 0) {
    await fetchOrders();
  }

  if (allOrders.length === 0) {
    console.log("No orders found.");
    ordersTableBody.innerHTML =
      "<tr><td colspan='4' class='text-center py-4'>No orders found.</td></tr>";
    displayPageNumbers(0);
    updatePaginationButtons(0);
    return;
  }

  const startIndex = (page - 1) * ordersPerPage;
  const endIndex = startIndex + ordersPerPage;
  const pageOrders = allOrders.slice(startIndex, endIndex);

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

  pageOrders.forEach((order) => {
    const row = document.createElement("tr");
    row.innerHTML = `
            <td class="px-5 py-5 border-b border-gray-200 text-sm">${
              order.trackingId || "N/A"
            }</td>
            <td class="px-5 py-5 border-b border-gray-200 text-sm">${
              order.date || "N/A"
            }</td>
            <td class="px-5 py-5 border-b border-gray-200 text-sm">
                <span class="relative inline-block px-3 py-1 font-semibold text-${getStatusColor(
                  order.status,
                  statusMap
                )} leading-tight rounded-full bg-${getStatusBackgroundColor(
      order.status,
      statusMap
    )}">
                    <span class="absolute inset-0 rounded-full opacity-50"></span>
                    <span class="relative">${order.status || "N/A"}</span>
                </span>
            </td>
            <td class="px-5 py-5 border-b border-gray-200 text-sm">${
              order.totalAmount + " Php" || "N/A"
            }</td>
        `;
    ordersTableBody.appendChild(row);
  });
  console.log(`Total orders: ${allOrders.length}`);
  displayPageNumbers(allOrders.length);
  updatePaginationButtons(allOrders.length);

  // Calculate and display metrics
  calculateAndDisplayMetrics();
}

function getStatusColor(status, statusMap) {
  console.log(`Getting status color for: ${status}`);
  switch (status) {
    case "Order Received":
      return "gray";
    case "Design Proofing/Review":
      return "orange";
    case "Design Approved":
      return "green";
    case "Payment Confirmed":
      return "purple";
    case "In Production":
      return "indigo";
    case "Printing Completed":
      return "teal";
    case "Finishing/Binding":
      return "lime";
    case "Quality Check":
      return "rose";
    case "Ready for Pickup/Shipping":
      return "sky";
    case "Shipped":
      return "blue";
    case "Out for Delivery":
      return "fuchsia";
    case "Delivered":
      return "cyan";
    default:
      return "gray";
  }
}

function getStatusBackgroundColor(status, statusMap) {
  console.log(`Getting status background color for: ${status}`);
  switch (status) {
    case "Order Received":
      return "gray-100";
    case "Design Proofing/Review":
      return "orange-100";
    case "Design Approved":
      return "green-100";
    case "Payment Confirmed":
      return "purple-100";
    case "In Production":
      return "indigo-100";
    case "Printing Completed":
      return "teal-100";
    case "Finishing/Binding":
      return "lime-100";
    case "Quality Check":
      return "rose-100";
    case "Ready for Pickup/Shipping":
      return "sky-100";
    case "Shipped":
      return "blue-100";
    case "Out for Delivery":
      return "fuchsia-100";
    case "Delivered":
      return "cyan-100";
    default:
      return "gray-100";
  }
}

function updatePaginationButtons(ordersLength) {
  console.log(
    `Updating pagination buttons, orders length: ${ordersLength}, current page: ${currentPage}`
  );
  const prevPageBtn = document.getElementById("prevPageBtn");
  const nextPageBtn = document.getElementById("nextPageBtn");
  prevPageBtn.disabled = currentPage === 1;
  nextPageBtn.disabled =
    currentPage === Math.ceil(ordersLength / ordersPerPage);
}

function displayPageNumbers(ordersLength) {
  console.log(
    `Displaying page numbers, orders length: ${ordersLength}, current page: ${currentPage}`
  );
  const pageNumbersDiv = document.getElementById("pageNumbers");
  pageNumbersDiv.innerHTML = "";

  const totalPages = Math.ceil(ordersLength / ordersPerPage);
  let startPage = Math.max(1, currentPage - 2);
  let endPage = Math.min(totalPages, startPage + 4);

  if (endPage - startPage < 4) {
    startPage = Math.max(1, endPage - 4);
  }

  for (let i = startPage; i <= endPage; i++) {
    const pageButton = document.createElement("button");
    pageButton.textContent = i;
    pageButton.classList.add(
      "bg-gray-300",
      "hover:bg-gray-400",
      "text-gray-800",
      "font-bold",
      "py-2",
      "px-4",
      "rounded"
    );
    if (i === currentPage) {
      pageButton.classList.add("bg-cyan-500", "text-white");
    }
    pageButton.addEventListener("click", () => {
      console.log(`Page button clicked: ${i}`);
      currentPage = i;
      displayOrders(currentPage);
    });
    pageNumbersDiv.appendChild(pageButton);
  }
}

function calculateAndDisplayMetrics() {
  const totalOrders = allOrders.length;
  let pendingOrders = 0;
  let completedOrders = 0;
  let revenue = 0;

  allOrders.forEach((order) => {
    if (order.status !== "Delivered") {
      pendingOrders++;
    } else {
      completedOrders++;
    }
    if (order.totalAmount) {
      // Assuming totalAmount is a number or can be converted to a number
      revenue += parseFloat(order.totalAmount);
    }
  });

  // Update the HTML elements with the calculated metrics
  document.querySelector("#totalOrders").textContent = totalOrders;
  document.querySelector("#pendingOrders").textContent = pendingOrders;
  document.querySelector("#completedOrders").textContent = completedOrders;
  document.querySelector(
    "#revenue"
  ).textContent = `₱${revenue.toLocaleString()}`;
}

// Initial display, fetch orders and calculate metrics on load
displayOrders(currentPage);
