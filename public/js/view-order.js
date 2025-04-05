document.addEventListener("DOMContentLoaded", () => {
  const trackingId = window.location.pathname.split("/")[3];

  if (trackingId) {
    fetchOrderDetails(trackingId);
  } else {
    alert("Tracking ID is required.");
  }
});

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

function populateStatusDropdown(currentStatus) {
  const statusSelect = document.getElementById("orderStatus");
  statusSelect.innerHTML = ""; // Clear existing options

  for (const status in statusMap) {
    const option = document.createElement("option");
    option.value = status;
    option.textContent = status;

    if (status === currentStatus) {
      option.selected = true; // Select the current status
    }

    statusSelect.appendChild(option);
  }
}

async function fetchOrderDetails(trackingId) {
  try {
    const orderResponse = await fetch(`/admin/orders/data?id=${trackingId}`);
    if (!orderResponse.ok) {
      throw new Error("Failed to fetch order details.");
    }
    const orderData = await orderResponse.json();
    console.log(orderData);

    const productId = orderData.productArray.id;
    const productResponse = await fetch(
      `/admin/products/${productId}/retrieve`
    );
    if (!productResponse.ok) {
      throw new Error("Failed to fetch product details.");
    }
    const productData = await productResponse.json();
    console.log(productData);

    displayOrderDetails(orderData, productData);
  } catch (error) {
    alert(error.message);
  }
}

function displayOrderDetails(orderData, productData) {
  // Populate Uploaded Files
  const uploadedFilesContainer = document.getElementById(
    "uploadedFilesContainer"
  );
  uploadedFilesContainer.innerHTML = "";
  orderData.filesArray.forEach((file) => {
    const fileDiv = document.createElement("div");
    fileDiv.textContent = file;
    uploadedFilesContainer.appendChild(fileDiv);
  });

  // Populate Design Notes
  document.getElementById("designNotesContent").textContent =
    orderData.designNotes;

  // Populate Total Price
  document
    .getElementById("totalPriceBreakdown")
    .querySelector(
      "p"
    ).textContent = `Total: Php ${orderData.totalAmount.toFixed(2)}`;

  // Populate Gallery Image and Product Details
  const galleryImage = document.getElementById("galleryImage");
  galleryImage.src = productData.images[0].cloudinaryUrl;
  galleryImage.alt = productData.name;

  document.getElementById("productName").textContent = productData.name;
  document.getElementById(
    "productPrice"
  ).textContent = `Php ${productData.price}.00`;

  // Populate Product Details
  const productDetails = document.getElementById("productDetails");
  productDetails.innerText = productData.details;

  // Populate Order List
  const orderList = document.getElementById("orderList");
  orderList.innerHTML = "";
  const orderItems = orderData.orderItems;
  orderItems.forEach((item) => {
    const itemDiv = document.createElement("div");
    itemDiv.textContent = `${item.itemKey}: ${item.itemValue}`;
    orderList.appendChild(itemDiv);
  });

  const statusSelect = document.getElementById("orderStatus");
  statusSelect.selected = orderData.status;

  // Populate Personal Data
  document.getElementById("fullNameDisplay").innerText =
    orderData.client.fullName;
  document.getElementById("companyNameDisplay").innerText =
    orderData.client.companyName || "";
  document.getElementById("emailDisplay").innerText = orderData.client.email;
  document.getElementById("phoneDisplay").innerText = orderData.client.phone;
  document.getElementById("streetDisplay").innerText = orderData.client.street;
  document.getElementById("barangayDisplay").innerText =
    orderData.client.barangay;
  document.getElementById("cityDisplay").innerText = orderData.client.city;
  document.getElementById("postalCodeDisplay").innerText =
    orderData.client.postalCode;

  initMap(orderData.client.coordinates);

  // Populate Status Dropdown
  populateStatusDropdown(orderData.status);

  // Update Status Button Event Listener
  document
    .getElementById("updateStatusButton")
    .addEventListener("click", () => {
      const selectedStatus = document.getElementById("orderStatus").value;
      updateOrderStatus(orderData.trackingId, selectedStatus);
    });
}

async function updateOrderStatus(trackingId, newStatus) {
  try {
    const response = await fetch(`/admin/orders/${trackingId}/status`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status: newStatus }),
    });

    if (!response.ok) {
      throw new Error("Failed to update order status.");
    }

    alert("Order status updated successfully!");
    fetchOrderDetails(trackingId); // Reload the order details
  } catch (error) {
    alert(error.message);
  }
}

function initMap(coordinates) {
  if (!coordinates) {
    console.error("Coordinates are null or undefined.");
    return;
  }

  const parts = coordinates.split(",");

  if (parts.length !== 2) {
    console.error("Invalid coordinates format:", coordinates);
    return;
  }

  const lat = parts[0];
  const lng = parts[1];

  console.log("Latitude:", lat);
  console.log("Longitude:", lng);

  const map = L.map("map").setView([parseFloat(lat), parseFloat(lng)], 15);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  }).addTo(map);

  L.marker([parseFloat(lat), parseFloat(lng)]).addTo(map);

  console.log("Map initialized with coordinates:", coordinates);
}
