// checkout.js

// --- 1. Session Storage Data ---
const designNotes = sessionStorage.getItem("designNotes");
const fileIds = JSON.parse(sessionStorage.getItem("fileIds"));
const product = JSON.parse(sessionStorage.getItem("product-details"));
const orderListItems = JSON.parse(sessionStorage.getItem("orderList")) || [];
const fileInfoArray = JSON.parse(sessionStorage.getItem("fileInfoArray")) || [];

// --- 2. Product and Price Calculations ---
const productPrice = product[0].price;
let totalQuantity = 0;
let calculatedPrice = 0;

// --- 3. DOM Elements ---
const uploadedFilesContainer = document.getElementById(
  "uploadedFilesContainer"
);
const designNotesContent = document.getElementById("designNotesContent");
const orderListContainer = document.getElementById("orderList");
const confirmCheckoutButton = document.getElementById("confirmCheckoutButton");
const coordinatesInput = document.getElementById("coordinates");

// --- 4. File Card Rendering ---
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
    "mb-2"
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
  return fileCard;
}

// --- 5. File Size Formatting ---
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

// --- 6. Extension Color Mapping ---
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

// --- 7. Fetch and Render Uploaded Files ---
function fetchAndRenderUploadedFiles() {
  const fileInfoArray = JSON.parse(sessionStorage.getItem("fileInfoArray"));

  if (fileInfoArray && Array.isArray(fileInfoArray)) {
    fileInfoArray.forEach((file) => {
      const fileCard = createFileCard(file);
      if (fileCard) {
        uploadedFilesContainer.appendChild(fileCard);
      }
    });
  } else {
    console.error("No file information found in sessionStorage.");
  }
}

// --- 8. Order Item Rendering ---
function createOrderItemCard(item) {
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

  const productId = product[0].name;
  const variations = item.variations;
  const quantity = item.quantity;
  totalQuantity += quantity;

  let variationsText = Object.entries(variations)
    .map(
      ([name, value]) =>
        `<span class="text-gray-500">${name}: ${value}, </span>`
    )
    .join("");
  variationsText = variationsText.slice(0, -2);

  itemCard.innerHTML = `
        <div class="flex flex-col items-start">
            <h3 class="font-semibold">${productId}</h3>
            <div class="font-medium">${variationsText}</div>
        </div>
        <div class="font-semibold">Quantity: ${quantity}</div>
    `;
  return itemCard;
}

// --- 9. Map Initialization and Handling ---
function initMap() {
  const map = L.map("map").setView(
    [6.9439865896984365, 122.07140922546388],
    13
  );
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  }).addTo(map);

  let marker = null;
  let selectedCoordinates = null;

  map.on("click", (event) => {
    if (marker) map.removeLayer(marker);
    marker = L.marker(event.latlng).addTo(map);
    selectedCoordinates = `${event.latlng.lat},${event.latlng.lng}`;
  });

  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        map.setView([latitude, longitude], 13);
        marker = L.marker([latitude, longitude]).addTo(map);
        selectedCoordinates = `${latitude},${longitude}`;
      },
      (error) => {
        console.error("Geolocation error:", error);
      }
    );
  } else {
    console.error("Geolocation is not supported by this browser.");
  }

  window.getSelectedCoordinates = () => selectedCoordinates;
}

// --- 10. Form Validation and Submission ---
function validateForm() {
  const fullName = document.getElementById("fullName").value.trim();
  const email = document.getElementById("email").value.trim();
  const phone = document.getElementById("phone").value.trim();
  const locationType = document.getElementById("locationType").value;

  if (!fullName) {
    showErrorModal("Full Name is required.");
    return false;
  }

  if (!email) {
    showErrorModal("Email is required.");
    return false;
  }

  if (!validateEmail(email)) {
    showErrorModal("Please enter a valid email address.");
    return false;
  }

  if (!phone) {
    showErrorModal("Contact Number is required.");
    return false;
  }

  if (!validatePhone(phone)) {
    showErrorModal("Please enter a valid phone number (09XXXXXXXXX).");
    return false;
  }

  if (locationType === "address") {
    const street = document.getElementById("street").value.trim();
    const barangay = document.getElementById("barangay").value.trim();

    if (!street) {
      showErrorModal("Street is required.");
      return false;
    }

    if (!barangay) {
      showErrorModal("Barangay is required.");
      return false;
    }
  } else {
    const coordinates = window.getSelectedCoordinates();
    if (!coordinates) {
      showErrorModal("Please select a location on the map.");
      return false;
    }
  }

  return true;
}

function showErrorModal(message) {
  Swal.fire({ icon: "error", title: "Validation Error", text: message });
}

function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function validatePhone(phone) {
  const phoneRegex = /^09\d{9}$/;
  return phoneRegex.test(phone);
}

function showLoadingModal() {
  Swal.fire({
    title: "Please Wait",
    text: "We are processing your order...",
    allowOutsideClick: false,
    didOpen: () => Swal.showLoading(),
  });
}

// --- 11. Event Listeners and Initializations ---
confirmCheckoutButton.addEventListener("click", (event) => {
  event.preventDefault();
  if (validateForm()) {
    processCheckout();
  }
});

fetchAndRenderUploadedFiles();
designNotesContent.textContent = designNotes;
orderListItems.forEach((item) =>
  orderListContainer.appendChild(createOrderItemCard(item))
);
calculatedPrice = totalQuantity * productPrice;
document
  .querySelectorAll("#totalPriceBreakdown p, #totalPriceBreakdown2 p")
  .forEach((el) => (el.textContent = "Total: Php " + calculatedPrice));

// Toggle Functionality
const locationToggle = document.getElementById("locationToggle");
const addressSection = document.getElementById("addressSection");
const mapSection = document.getElementById("mapSection");
const locationTypeInput = document.getElementById("locationType");

locationToggle.addEventListener("change", () => {
  if (locationToggle.checked) {
    addressSection.style.display = "none";
    mapSection.style.display = "block";
    locationTypeInput.value = "coordinates";
    initMap();
    if (map) {
      map.invalidateSize();
    }
  } else {
    addressSection.style.display = "block";
    mapSection.style.display = "none";
    locationTypeInput.value = "address";
  }
});

// --- 12. Checkout Process with Cloudinary ---
async function processCheckout() {
  showLoadingModal();
  try {
    let cloudinaryUrls = [];

    if (fileIds && fileIds.length > 0) {
      const uploadedFiles = await fetch("/checkout/fileuploaded", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileIds }),
      }).then((res) => res.json());

      const cloudinaryUploads = await fetch("/checkout/upload-cloudinary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ files: uploadedFiles }),
      }).then((res) => res.json());

      cloudinaryUrls = cloudinaryUploads.map((upload) => upload.secure_url);
    }

    const locationType = document.getElementById("locationType").value;
    let necessaryData;

    if (locationType === "address") {
      necessaryData = {
        guestId: sessionStorage.getItem("guestId"),
        filesArray: fileInfoArray,
        orderItems: orderListItems,
        designNotes: designNotes,
        productArray: {
          id: product[0].id,
          name: product[0].name,
          price: product[0].price,
          productOrder: totalQuantity,
        },
        totalAmount: calculatedPrice,
        client: {
          fullName: document.getElementById("fullName").value.trim(),
          companyName: document.getElementById("companyName").value.trim(),
          email: document.getElementById("email").value.trim(),
          phone: document.getElementById("phone").value.trim(),
          street: document.getElementById("street").value.trim(),
          barangay: document.getElementById("barangay").value.trim(),
          city: "Zamboanga City",
          postalCode: "7000",
          addressType: "address",
        },
      };
    } else {
      necessaryData = {
        guestId: sessionStorage.getItem("guestId"),
        filesArray: fileInfoArray,
        orderItems: orderListItems,
        designNotes: designNotes,
        productArray: {
          id: product[0].id,
          name: product[0].name,
          price: product[0].price,
          productOrder: totalQuantity,
        },
        totalAmount: calculatedPrice,
        client: {
          fullName: document.getElementById("fullName").value.trim(),
          companyName: document.getElementById("companyName").value.trim(),
          email: document.getElementById("email").value.trim(),
          phone: document.getElementById("phone").value.trim(),
          addressType: "coordinates",
          coordinates: window.getSelectedCoordinates(),
        },
      };
    }

    const firestoreResponse = await fetch("/checkout/save-to-firestore", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(necessaryData),
    }).then((res) => res.json());

    Swal.close();
    Swal.fire({
      icon: "success",
      title: "Order Successful!",
      text: "A tracking ID has been sent to your email address.",
      confirmButtonText: "Okay",
    }).then(() => (window.location.href = "/"));
  } catch (error) {
    console.error("Checkout process failed:", error);
    Swal.close();
    Swal.fire({
      icon: "error",
      title: "Order Failed!",
      text: "There was an error processing your order. Please try again.",
    });
  }
}
