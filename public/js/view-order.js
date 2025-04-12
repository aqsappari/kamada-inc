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
  statusSelect.innerHTML = "";

  for (const status in statusMap) {
    const option = document.createElement("option");
    option.value = status;
    option.textContent = status;

    if (status === currentStatus) {
      option.selected = true;
    }

    statusSelect.appendChild(option);
  }
}

async function fetchOrderDetails(trackingId, skipMapInit = false) {
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

    displayOrderDetails(orderData, productData, skipMapInit);
  } catch (error) {
    alert(error.message);
  }
}

function displayOrderDetails(orderData, productData, skipMapInit = false) {
  const uploadedFilesContainer = document.getElementById(
    "uploadedFilesContainer"
  );
  uploadedFilesContainer.innerHTML = "";
  if (orderData.filesArray && orderData.filesArray.length > 0) {
    orderData.filesArray.forEach((file) => {
      const fileCard = createFileCard(file);
      if (fileCard) {
        uploadedFilesContainer.appendChild(fileCard);
      }
    });
  }

  document.getElementById("designNotesContent").textContent =
    orderData.designNotes;
  document
    .getElementById("totalPriceBreakdown")
    .querySelector(
      "p"
    ).textContent = `Total: Php ${orderData.totalAmount.toFixed(2)}`;

  const galleryImage = document.getElementById("galleryImage");
  galleryImage.src = productData.images[0].cloudinaryUrl;
  galleryImage.alt = productData.name;

  document.getElementById("productName").textContent = productData.name;
  document.getElementById(
    "productPrice"
  ).textContent = `Php ${productData.price}.00`;
  document.getElementById("productDetails").innerText = productData.details;

  const orderList = document.getElementById("orderList");
  orderList.innerHTML = "";
  const orderItems = orderData.orderItems;
  let totalQuantity = 0;
  orderItems.forEach((item) => {
    const orderCard = createOrderItemCard(item, productData);
    orderList.appendChild(orderCard);
    totalQuantity += item.quantity;
  });

  let totalQuantityDiv = document.getElementById("totalQuantityDiv");

  if (!totalQuantityDiv) {
    totalQuantityDiv = document.createElement("div");
    totalQuantityDiv.id = "totalQuantityDiv";
    totalQuantityDiv.classList.add("mt-4", "font-bold", "text-right");
    orderList.parentElement.appendChild(totalQuantityDiv);
  }

  totalQuantityDiv.textContent = `Total Quantity: ${totalQuantity}`;

  document.getElementById("fullNameDisplay").innerText =
    orderData.client.fullName;
  document.getElementById("companyNameDisplay").innerText =
    orderData.client.companyName || "N/A";
  document.getElementById("emailDisplay").innerText = orderData.client.email;
  document.getElementById("phoneDisplay").innerText = orderData.client.phone;

  const addressDisplay = document.getElementById("addressDisplay");
  const mapDiv = document.getElementById("map");

  if (orderData.client.addressType === "coordinates") {
    mapDiv.style.display = "block";
    addressDisplay.style.display = "none";
    if (!skipMapInit) {
      initMap(orderData.client.coordinates);
    }
  } else {
    mapDiv.style.display = "none";
    addressDisplay.style.display = "block";
    addressDisplay.innerHTML = `
          <p><strong>Street:</strong> ${orderData.client.street}</p>
          <p><strong>Barangay:</strong> ${orderData.client.barangay}</p>
          <p><strong>City:</strong> ${orderData.client.city}</p>
          <p><strong>Postal Code:</strong> ${orderData.client.postalCode}</p>
      `;
  }

  populateStatusDropdown(orderData.status);
  document
    .getElementById("updateStatusButton")
    .addEventListener("click", () => {
      const selectedStatus = document.getElementById("orderStatus").value;
      updateOrderStatus(orderData.trackingId, selectedStatus);
    });
}

function createOrderItemCard(item, product) {
  const itemCard = document.createElement("div");
  itemCard.classList.add(
    "flex",
    "items-start",
    "justify-between",
    "p-4",
    "border",
    "rounded-lg",
    "mb-2",
    "bg-white"
  );

  const productId = product.name;
  const variations = item.variations;
  const quantity = item.quantity;

  let variationsText = "";
  if (variations) {
    variationsText = Object.entries(variations)
      .map(
        ([name, value]) =>
          `<span class="text-gray-500">${name}: ${value}, </span>`
      )
      .join("");
    variationsText = variationsText.slice(0, -2);
  }

  itemCard.innerHTML = `
      <div class="flex flex-col items-start">
          <h3 class="font-semibold">${productId}</h3>
          <div class="font-medium">${variationsText || "N/A"}</div>
      </div>
      <div class="font-semibold">Quantity: ${quantity}</div>
  `;
  return itemCard;
}

function createFileCard(fileObj) {
  if (!fileObj) {
    console.error("fileObj is undefined in createFileCard");
    return null;
  }

  const fileName =
    fileObj.originalName.length > 20
      ? fileObj.originalName.substring(0, 20) + "..."
      : fileObj.originalName;
  const extensionColor = getExtensionColor(
    fileObj.originalExtension.toUpperCase()
  );
  const { size, unit } = formatFileSize(fileObj.originalSize);

  const fileCard = document.createElement("div");
  fileCard.classList.add(
    "flex",
    "items-center",
    "justify-between",
    "p-4",
    "border",
    "rounded-lg",
    "mb-2",
    "bg-white",
    "cursor-pointer"
  );
  fileCard.innerHTML = `
      <div class="flex items-center">
          <div class="w-16 h-10 rounded-lg flex items-center justify-center text-white mr-4 font-medium" style="background-color: ${extensionColor};">
              ${fileObj.originalExtension.toUpperCase()}
          </div>
          <div>
              <p>${fileName}</p>
              <p class="text-xs text-gray-500">${size} ${unit.toLocaleUpperCase()}</p>
          </div>
      </div>
  `;

  fileCard.addEventListener("click", () => {
    downloadFile(fileObj.url, fileObj.originalName);
  });

  return fileCard;
}

function formatFileSize(bytes) {
  const units = ["B", "KB", "MB", "GB", "TB"];
  let size = bytes;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }

  return { size: size.toFixed(2), unit: units[unitIndex] };
}

function getExtensionColor(extension) {
  const colors = {
    PSD: "#29ABE2",
    AI: "#FF7300",
    EPS: "#800080",
    SVG: "#E91E63",
    PDF: "#FF6347",
    PNG: "#90EE90",
    JPG: "#FFA07A",
    JPEG: "#FFA07A",
    GIF: "#DDA0DD",
    TIFF: "#00CED1",
    TIF: "#00CED1",
    BMP: "#A9A9A9",
    RAW: "#8B4513",
    CR2: "#8B4513",
    NEF: "#8B4513",
    DNG: "#8B4513",
    DOC: "#4682B4",
    DOCX: "#4682B4",
    TXT: "#20B2AA",
    ZIP: "#FFD700",
    RAR: "#FFD700",
    CSV: "#778899",
  };
  return colors[extension] || "#808080";
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
    fetchOrderDetails(trackingId, true);
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
      '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  }).addTo(map);

  L.marker([parseFloat(lat), parseFloat(lng)]).addTo(map);

  console.log("Map initialized with coordinates:", coordinates);
}

function downloadFile(fileUrl, fileName) {
  if (fileUrl.includes("cloudinary.com")) {
    fileUrl = fileUrl.replace("/upload/", "/upload/fl_attachment/");
  }

  const link = document.createElement("a");
  link.href = fileUrl;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
