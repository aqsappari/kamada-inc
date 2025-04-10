// --- 1. Product Gallery Management ---
const galleryImage = document.getElementById("galleryImage");
const productName = document.getElementById("productName");
const productPrice = document.getElementById("productPrice");
const productDetails = document.getElementById("productDetails");
let currentImageIndex = 0;
let productImages = [];
let productData = [];

function updateGalleryImage() {
  if (productImages && productImages.length > 0) {
    galleryImage.src = productImages[currentImageIndex];
  } else {
    galleryImage.src = "https://via.placeholder.com/600";
  }
}

window.nextImage = () => {
  if (productImages && productImages.length > 0) {
    currentImageIndex = (currentImageIndex + 1) % productImages.length;
    updateGalleryImage();
  }
};

window.prevImage = () => {
  if (productImages && productImages.length > 0) {
    currentImageIndex =
      (currentImageIndex - 1 + productImages.length) % productImages.length;
    updateGalleryImage();
  }
};

// --- 2. Product Variations Management ---
function populateVariations(variations) {
  const variationsContainer = document.getElementById("variationsContainer");
  variationsContainer.innerHTML = "";

  if (variations && variations.length > 0) {
    variations.forEach((variation) => {
      const variationDiv = createVariationDiv(variation);
      variationsContainer.appendChild(variationDiv);
    });
  } else {
    document.getElementById("orderListContainer").style.display = "none";
  }
}

function createVariationDiv(variation) {
  const variationDiv = document.createElement("div");
  variationDiv.classList.add("mb-4", "flex", "flex-col");

  const label = createLabel(variation.name);
  variationDiv.appendChild(label);

  const optionsContainer = createOptionsContainer(variation.options);
  variationDiv.appendChild(optionsContainer);

  return variationDiv;
}

function createLabel(name) {
  const label = document.createElement("label");
  label.classList.add("text-gray-700", "text-sm", "font-bold", "mb-2");
  label.textContent = name + ":";
  return label;
}

function createOptionsContainer(options) {
  const optionsContainer = document.createElement("div");
  optionsContainer.classList.add("flex", "flex-wrap", "gap-2");

  options.forEach((option) => {
    const optionButton = createOptionButton(option, optionsContainer);
    optionsContainer.appendChild(optionButton);
  });

  return optionsContainer;
}

function createOptionButton(option, optionsContainer) {
  const optionButton = document.createElement("button");
  optionButton.classList.add(
    "border",
    "rounded-full",
    "px-4",
    "py-2",
    "text-sm",
    "text-gray-700",
    "hover:bg-gray-100",
    "focus:outline-none",
    "focus:ring",
    "focus:ring-blue-300",
    "transition",
    "duration-300"
  );
  optionButton.textContent = option;

  optionButton.addEventListener("click", () => {
    const siblingButtons = optionsContainer.querySelectorAll("button");
    siblingButtons.forEach((btn) => btn.classList.remove("bg-blue-200"));
    optionButton.classList.add("bg-blue-200");
  });

  return optionButton;
}

// --- 3. Order List Management ---
const addItemButton = document.getElementById("addItemButton");
const quantityInput = document.getElementById("quantityInput");
const orderList = document.getElementById("orderList");
let orderListArray = JSON.parse(sessionStorage.getItem("orderList")) || [];

addItemButton.addEventListener("click", handleAddItem);
orderListArray.forEach((item) => orderList.appendChild(createListItem(item)));

function handleAddItem() {
  const variations = getSelectedVariations();
  const quantity = parseInt(quantityInput.value);

  if (!validateOrderInput(variations, quantity)) return;

  const itemKey = JSON.stringify(variations);
  const existingItemIndex = orderListArray.findIndex(
    (item) => item.itemKey === itemKey
  );

  if (existingItemIndex !== -1) {
    orderListArray[existingItemIndex].quantity += quantity;
    updateListItem(
      orderList.children[existingItemIndex],
      orderListArray[existingItemIndex]
    );
  } else {
    const newItem = { variations, quantity, itemKey };
    orderListArray.push(newItem);
    orderList.appendChild(createListItem(newItem));
  }

  quantityInput.value = "";
  updateSessionStorage();
}

function getSelectedVariations() {
  const variations = {};
  const variationDivs = document.querySelectorAll("#variationsContainer > div");

  variationDivs.forEach((variationDiv) => {
    const variationName = variationDiv
      .querySelector("label")
      ?.textContent.replace(":", "");
    const selectedButton = variationDiv.querySelector("button.bg-blue-200");

    if (selectedButton) {
      variations[variationName] = selectedButton.textContent;
    }
  });

  return variations;
}

function validateOrderInput(variations, quantity) {
  let variationsComplete =
    Object.keys(variations).length ===
    document.querySelectorAll("#variationsContainer > div label").length;
  let quantityValid = quantity && quantity > 0;

  if (!variationsComplete && !quantityValid) {
    Swal.fire({
      icon: "error",
      title: "Missing Details",
      text: "Please select all variations and provide a valid quantity.",
    });
  } else if (!variationsComplete) {
    Swal.fire({
      icon: "error",
      title: "Missing Variations",
      text: "Please select all variations.",
    });
  } else if (!quantityValid) {
    Swal.fire({
      icon: "error",
      title: "Invalid Quantity",
      text: "Please provide a valid quantity.",
    });
  }

  return variationsComplete && quantityValid;
}

function createListItem(item) {
  const listItem = document.createElement("li");
  listItem.dataset.itemKey = item.itemKey;
  listItem.classList.add(
    "flex",
    "items-center",
    "justify-between",
    "mb-2",
    "p-4",
    "border",
    "rounded"
  );

  const variationsDisplay = Object.entries(item.variations)
    .map(
      ([name, value]) =>
        `<div class="text-xs text-gray-700">${name}: ${value}</div>`
    )
    .join("");

  listItem.innerHTML = `
        <div class="flex items-center">
            <div>
                ${variationsDisplay}
                <div class="text-xs text-gray-700"><span class="quantity">Quantity: ${item.quantity}</span></div>
            </div>
        </div>
        <div>
            <button class="text-blue-500 hover:underline mr-2 edit-item">Edit</button>
            <button class="text-red-500 hover:underline delete-item">Delete</button>
        </div>
    `;

  listItem
    .querySelector(".delete-item")
    .addEventListener("click", () => deleteItem(listItem));
  listItem
    .querySelector(".edit-item")
    .addEventListener("click", () => editItem(listItem));

  return listItem;
}

function updateListItem(listItem, item) {
  listItem.querySelector(
    ".quantity"
  ).textContent = `Quantity: ${item.quantity}`;
}

function deleteItem(listItem) {
  const itemKey = listItem.dataset.itemKey;
  orderListArray = orderListArray.filter((item) => item.itemKey !== itemKey);
  listItem.remove();
  updateSessionStorage();
}

function editItem(listItem) {
  const itemKey = listItem.dataset.itemKey;
  const item = orderListArray.find((item) => item.itemKey === itemKey);

  for (const variationName in item.variations) {
    const variationDiv = Array.from(
      document.querySelectorAll("#variationsContainer label")
    ).find(
      (label) => label.textContent.replace(":", "") === variationName
    )?.parentElement;
    if (variationDiv) {
      variationDiv
        .querySelectorAll("button")
        .forEach((button) => button.classList.remove("bg-blue-200"));
      Array.from(variationDiv.querySelectorAll("button"))
        .find((button) => button.textContent === item.variations[variationName])
        ?.classList.add("bg-blue-200");
    }
  }

  quantityInput.value = item.quantity;
  deleteItem(listItem);
}

function updateSessionStorage() {
  sessionStorage.setItem("orderList", JSON.stringify(orderListArray));
}

// --- 4. Product Data Fetching ---
async function fetchProductDetails() {
  try {
    const productId = window.location.pathname.split("/").pop();
    const response = await fetch(`/products/get-product/${productId}`);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

    const product = await response.json();
    productName.textContent = product.name;
    productPrice.textContent = `${product.price}PHP`;
    productDetails.textContent = product.details;
    productImages = product.images?.map((img) => img.cloudinaryUrl) || [];
    updateGalleryImage();

    if (product.variations && product.variations.length > 0)
      populateVariations(product.variations);

    productData.push({
      name: product.name,
      id: productId,
      price: product.price,
    });
    sessionStorage.setItem("product-details", JSON.stringify(productData));
  } catch (error) {
    console.error("Error fetching product details:", error);
  }
}

fetchProductDetails();

// --- 5. File Upload Management ---
const designUploadPrints = document.getElementById("designUploadPrints");
const uploadedFilesList = document.getElementById("uploadedFilesList");
const addFilesButton = document.getElementById("addFilesButton");
const infoIcons = document.querySelectorAll(".info-icon");
const infoBoxes = document.querySelectorAll(".info-box");
let filesArray = [];

infoIcons.forEach((icon, index) => {
  icon.addEventListener("mouseover", () => {
    infoBoxes[index].textContent = icon.getAttribute("data-info");
    infoBoxes[index].classList.remove("hidden");
  });
  icon.addEventListener("mouseout", () =>
    infoBoxes[index].classList.add("hidden")
  );
});

addFilesButton.addEventListener("click", () => designUploadPrints.click());
designUploadPrints.addEventListener("change", (event) =>
  handleFileUpload(event.target.files)
);

function handleFileUpload(files) {
  if (!files || files.length === 0) return;

  const allowedMimeTypes = [
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/webp",
    "image/svg+xml",
    "image/tiff",
    "image/tif",
    "application/pdf",
    "application/postscript",
    "application/vnd.adobe.illustrator",
    "application/illustrator",
    "application/x-illustrator",
    "application/x-eps",
    "application/coreldraw",
    "application/cdr",
    "image/vnd.adobe.photoshop",
    "application/photoshop",
    "application/x-indesign",
    "application/x-xd",
    "application/sketch",
    "application/zip",
    "application/x-rar-compressed",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  ];

  Array.from(files).forEach((file) => {
    const fileExtension = file.name.split(".").pop().toLowerCase();
    if (allowedMimeTypes.includes(file.type) || fileExtension === "psd") {
      const reader = new FileReader();
      reader.onload = (e) => {
        const { size, unit } = formatFileSize(file.size);
        filesArray.push({
          file: file,
          dataURL: e.target.result,
          name: file.name,
          size: `${size} ${unit}`,
          extension: fileExtension.toUpperCase(),
        });
        renderFiles();
      };
      reader.readAsDataURL(file);
    } else {
      alert(
        `The file "${file.name}" is not allowed. Please upload files with allowed types.`
      );
    }
  });
}

function renderFiles() {
  uploadedFilesList.innerHTML = "";
  filesArray.forEach((fileObj, index) => {
    uploadedFilesList.appendChild(createFileCard(fileObj, index));
  });
}

function createFileCard(fileObj, index) {
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
  const fileName =
    fileObj.name.length > 20
      ? fileObj.name.substring(0, 20) + "..."
      : fileObj.name;
  const extensionColor = getExtensionColor(fileObj.extension);

  fileCard.innerHTML = `
        <div class="flex items-center">
            <div class="w-16 h-10 rounded-lg flex items-center justify-center text-white mr-4 font-medium" style="background-color: ${extensionColor};">${fileObj.extension}</div>
            <div>
                <p>${fileName}</p>
                <p class="text-xs text-gray-500">${fileObj.size}</p>
            </div>
        </div>
        <i class="ri-delete-bin-line cursor-pointer text-red-500" data-index="${index}"></i>
    `;

  fileCard
    .querySelector(".ri-delete-bin-line")
    .addEventListener("click", () => removeFile(index));
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

function removeFile(index) {
  filesArray.splice(index, 1);
  renderFiles();
}

// --- 6. Order Validation and Cart Management ---
function validateOrder() {
  // Check filesArray.length directly
  if (!filesArray || filesArray.length === 0) {
    return Swal.fire({
      title: "No Design Files Uploaded",
      text: "You haven't uploaded any design files. Are you sure you want to continue?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, continue",
      cancelButtonText: "No, upload files",
    }).then((result) => {
      if (!result.isConfirmed) {
        return false;
      }
      return validateOrderList();
    });
  }

  return validateOrderList();
}

function validateOrderList() {
  const orderListItems = orderListArray.length;

  if (orderListItems === 0) {
    return Swal.fire({
      title: "No Items in Order List",
      text: "Please add at least one item to your order.",
      icon: "warning",
      confirmButtonText: "Add items",
    }).then(() => false);
  }

  return Promise.resolve(true);
}

let cartItems = JSON.parse(sessionStorage.getItem("cartItems")) || [];

async function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });
}

function areDesignPrintsEqual(prints1, prints2) {
  if (prints1.length !== prints2.length) return false;
  for (let i = 0; i < prints1.length; i++) {
    if (
      prints1[i].name !== prints2[i].name ||
      prints1[i].type !== prints2[i].type ||
      prints1[i].size !== prints2[i].size
    )
      return false;
  }
  return true;
}

function addToCart() {
  if (!validateOrder()) return;

  const productId = window.location.pathname.split("/").pop();
  const quantity = parseInt(quantityInput.value);
  const variationSelections = Array.from(
    document.querySelectorAll(
      "#variationsContainer > div:not(:last-child) button.bg-blue-200"
    )
  ).map((element) => element.textContent);
  const designPrints = Array.from(
    document.getElementById("designUploadPrints").files
  ).map((file) => ({ name: file.name, type: file.type, size: file.size }));
  const designNotes =
    document.getElementById("designNotes").value.trim() ||
    "The user left this empty.";

  const cartItem = {
    productId,
    quantity,
    variations: variationSelections,
    designPrints,
    designNotes,
  };
  const existingItemIndex = cartItems.findIndex(
    (item) =>
      item.productId === productId &&
      areDesignPrintsEqual(item.designPrints, designPrints) &&
      item.designNotes === designNotes
  );

  if (existingItemIndex !== -1) {
    cartItems[existingItemIndex].variations.push(...variationSelections);
    cartItems[existingItemIndex].quantity += quantity;
  } else {
    cartItems.push(cartItem);
  }

  sessionStorage.setItem("cartItems", JSON.stringify(cartItems));

  Swal.fire({
    icon: "success",
    title: "Added to Cart",
    text: "Your item has been added to the cart.",
    showDenyButton: true,
    showCancelButton: true,
    confirmButtonText: "Add another variation",
    denyButtonText: `Add another design`,
    cancelButtonText: "Proceed to Checkout",
  }).then((result) => {
    if (result.isConfirmed) {
      console.log("Add another variation");
    } else if (result.isDenied) {
      clearFormFields();
    } else if (result.dismiss === Swal.DismissReason.cancel) {
      window.location.href = "/cart";
    } else {
      window.location.href = "/products";
    }
  });
}

function clearFormFields() {
  document
    .querySelectorAll("#variationsContainer button.bg-blue-200")
    .forEach((button) => button.classList.remove("bg-blue-200"));
  quantityInput.value = "";
  document.getElementById("designUploadPrints").value = "";
  uploadedFilesList.innerHTML = "";
  document.getElementById("designNotes").value = "";
}

// --- 7. Checkout Process ---
const checkoutButton = document.querySelector("#checkoutButton");
checkoutButton.addEventListener("click", handleCheckout);

async function handleCheckout() {
  const designPrints = filesArray.map((fileObj) => ({
    name: fileObj.name,
    type: fileObj.file.type,
    size: fileObj.file.size,
    file: fileObj.file,
  }));
  const designNotes =
    document.getElementById("designNotes").value.trim() ||
    "The user left this empty.";

  // Use the consolidated validateOrder function
  const isValid = await validateOrder(); // Use await because validateOrder returns a Promise

  if (!isValid) {
    // Validation failed, Swal.fire messages are already handled in validateOrder
    return; // Stop further processing
  }

  // Check if filesArray is empty (user agreed to continue without files)
  if (filesArray.length === 0) {
    // Skip file upload and proceed directly to checkout
    Swal.fire({
      title: "Proceeding to Checkout",
      text: "You are proceeding to checkout without uploading design files.",
      icon: "info",
      showConfirmButton: false,
      timer: 2000, // Optional: Auto-close after 2 seconds
    });

    // Proceed directly to checkout without file upload
    sessionStorage.setItem("designNotes", designNotes);
    sessionStorage.setItem("orderListItems", JSON.stringify(orderListArray));
    sessionStorage.removeItem("orderList");
    window.location.href = "/checkout";

    return; // Stop further processing in this function
  }

  // If filesArray is not empty, proceed with file upload
  Swal.fire({
    title: "Loading...",
    allowOutsideClick: false,
    didOpen: () => {
      Swal.showLoading();
      uploadFilesAndRedirect({
        guestId: sessionStorage.getItem("guestId"),
        productId: window.location.pathname.split("/").pop(),
        designPrints,
        designNotes,
        orderList: orderListArray,
      });
    },
  });
}

async function uploadFilesAndRedirect(firestoreData) {
  try {
    const formData = new FormData();
    formData.append("guestId", firestoreData.guestId);
    firestoreData.designPrints.forEach((fileObj) =>
      formData.append("files", fileObj.file)
    );

    const response = await fetch("/products/upload", {
      method: "POST",
      body: formData,
    });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

    const data = await response.json();
    Swal.close();

    if (data && data.fileIds && data.fileIds.length > 0) {
      sessionStorage.setItem("fileIds", JSON.stringify(data.fileIds));
      sessionStorage.setItem("designNotes", firestoreData.designNotes);
      sessionStorage.setItem(
        "orderListItems",
        JSON.stringify(firestoreData.orderList)
      );
      sessionStorage.removeItem("orderList");
      window.location.href = "/checkout";
    } else {
      Swal.fire({
        icon: "error",
        title: "Upload Failed",
        text: "File upload failed or no fileIds in response",
      });
    }
  } catch (error) {
    Swal.close();
    console.error("File upload failed:", error);
    const errorMessage =
      error instanceof TypeError
        ? "Network error during file upload. Please check your connection."
        : "Server error during file upload. Please try again later.";
    Swal.fire({ icon: "error", title: "Upload Failed", text: errorMessage });
  }
}
