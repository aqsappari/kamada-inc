const orders = [
  {
    orderId: 1001,
    trackingId: "TK12345",
    date: "2024-07-28",
    status: "Shipped",
    total: "$150.00",
  },
  {
    orderId: 1002,
    trackingId: "TK12346",
    date: "2024-07-27",
    status: "Pending",
    total: "$250.00",
  },
  {
    orderId: 1003,
    trackingId: "TK12347",
    date: "2024-07-26",
    status: "Delivered",
    total: "$120.00",
  },
  {
    orderId: 1004,
    trackingId: "TK12348",
    date: "2024-07-25",
    status: "Processing",
    total: "$300.00",
  },
  {
    orderId: 1005,
    trackingId: "TK12349",
    date: "2024-07-24",
    status: "Shipped",
    total: "$180.00",
  },
  {
    orderId: 1006,
    trackingId: "TK12350",
    date: "2024-07-23",
    status: "Pending",
    total: "$200.00",
  },
  {
    orderId: 1007,
    trackingId: "TK12351",
    date: "2024-07-22",
    status: "Delivered",
    total: "$130.00",
  },
  {
    orderId: 1008,
    trackingId: "TK12352",
    date: "2024-07-21",
    status: "Processing",
    total: "$280.00",
  },
  {
    orderId: 1009,
    trackingId: "TK12353",
    date: "2024-07-20",
    status: "Shipped",
    total: "$160.00",
  },
  {
    orderId: 1010,
    trackingId: "TK12354",
    date: "2024-07-19",
    status: "Pending",
    total: "$220.00",
  },
  {
    orderId: 1011,
    trackingId: "TK12355",
    date: "2024-07-18",
    status: "Delivered",
    total: "$140.00",
  },
  {
    orderId: 1012,
    trackingId: "TK12356",
    date: "2024-07-17",
    status: "Processing",
    total: "$290.00",
  },
];

const ordersPerPage = 5;
let currentPage = 1;

function displayOrders(page) {
  const ordersTableBody = document.getElementById("ordersTableBody");
  ordersTableBody.innerHTML = ""; // Clear existing rows
  const startIndex = (page - 1) * ordersPerPage;
  const endIndex = startIndex + ordersPerPage;
  const pageOrders = orders.slice(startIndex, endIndex);

  pageOrders.forEach((order) => {
    const row = document.createElement("tr");
    row.innerHTML = `
                <td class="px-5 py-5 border-b border-gray-200 text-sm">${
                  order.orderId
                }</td>
                <td class="px-5 py-5 border-b border-gray-200 text-sm">${
                  order.trackingId
                }</td>
                <td class="px-5 py-5 border-b border-gray-200 text-sm">${
                  order.date
                }</td>
                <td class="px-5 py-5 border-b border-gray-200 text-sm">
                    <span class="relative inline-block px-3 py-1 font-semibold text-${
                      order.status === "Shipped"
                        ? "green"
                        : order.status === "Pending"
                        ? "yellow"
                        : order.status === "Delivered"
                        ? "blue"
                        : "gray"
                    }-500 leading-tight rounded-full bg-${
      order.status === "Shipped"
        ? "green"
        : order.status === "Pending"
        ? "yellow"
        : order.status === "Delivered"
        ? "blue"
        : "gray"
    }-100">
                        <span class="absolute inset-0 rounded-full opacity-50"></span>
                        <span class="relative">${order.status}</span>
                    </span>
                </td>
                <td class="px-5 py-5 border-b border-gray-200 text-sm">${
                  order.total
                }</td>
            `;
    ordersTableBody.appendChild(row);
  });
  displayPageNumbers();
}

function updatePaginationButtons() {
  const prevPageBtn = document.getElementById("prevPageBtn");
  const nextPageBtn = document.getElementById("nextPageBtn");
  prevPageBtn.disabled = currentPage === 1;
  nextPageBtn.disabled =
    currentPage === Math.ceil(orders.length / ordersPerPage);
}

function displayPageNumbers() {
  const pageNumbersDiv = document.getElementById("pageNumbers");
  pageNumbersDiv.innerHTML = ""; // Clear existing page numbers

  const totalPages = Math.ceil(orders.length / ordersPerPage);
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
      currentPage = i;
      displayOrders(currentPage);
      updatePaginationButtons();
    });
    pageNumbersDiv.appendChild(pageButton);
  }
}

displayOrders(currentPage);
updatePaginationButtons();
