const galleryImage = document.getElementById("galleryImage");
const productName = document.getElementById("productName");
const productPrice = document.getElementById("productPrice");
const productDetails = document.getElementById("productDetails");
let currentImageIndex = 0;
let productImages = []; // Store product images here

let productData = [];
function populateVariations(variations) {
  const variationsContainer = document.getElementById("variationsContainer");
  variationsContainer.innerHTML = ""; // Clear existing variations

  if (variations && variations.length > 0) {
    variations.forEach((variation) => {
      const variationDiv = document.createElement("div");
      variationDiv.classList.add("mb-4", "flex", "flex-col");

      const label = document.createElement("label");
      label.classList.add("text-gray-700", "text-sm", "font-bold", "mb-2");
      label.textContent = variation.name + ":";

      variationDiv.appendChild(label);

      const optionsContainer = document.createElement("div");
      optionsContainer.classList.add("flex", "flex-wrap", "gap-2");

      variation.options.forEach((option) => {
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
          // Remove 'selected' class from other buttons in the same group
          const siblingButtons = optionsContainer.querySelectorAll("button");
          siblingButtons.forEach((btn) => btn.classList.remove("bg-blue-200"));

          // Add 'selected' class to the clicked button
          optionButton.classList.add("bg-blue-200");
        });

        optionsContainer.appendChild(optionButton);
      });

      variationDiv.appendChild(optionsContainer);
      variationsContainer.appendChild(variationDiv);
    });
  } else {
    document.getElementById("orderListContainer").style.display = "none";
  }
}

// Order List Functionality
const addItemButton = document.getElementById("addItemButton");
const quantityInput = document.getElementById("quantityInput");
const orderList = document.getElementById("orderList");

// Initialize orderListArray
let orderListArray = [];

addItemButton.addEventListener("click", () => {
  const variations = {};
  const variationDivs = document.querySelectorAll("#variationsContainer > div");

  // Validation flags
  let variationsComplete = true;
  let quantityValid = true;

  variationDivs.forEach((variationDiv) => {
    const variationName = variationDiv
      .querySelector("label")
      ?.textContent.replace(":", "");
    const selectedButton = variationDiv.querySelector("button.bg-blue-200");

    if (variationName && !selectedButton) {
      variationsComplete = false;
    }

    if (selectedButton) {
      variations[variationName] = selectedButton.textContent;
    }
  });

  const quantity = parseInt(quantityInput.value);

  if (!quantity || quantity <= 0) {
    quantityValid = false;
  }

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
  } else {
    const itemKey = JSON.stringify(variations);

    const existingItemIndex = orderListArray.findIndex(
      (item) => item.itemKey === itemKey
    );

    if (existingItemIndex !== -1) {
      // Update quantity if item exists
      orderListArray[existingItemIndex].quantity += quantity;
      updateListItem(
        orderList.children[existingItemIndex],
        orderListArray[existingItemIndex]
      );
    } else {
      // Add new item
      const newItem = {
        variations,
        quantity,
        itemKey,
      };
      orderListArray.push(newItem);
      const listItem = createListItem(newItem);
      orderList.appendChild(listItem);
    }

    quantityInput.value = "";
    updateSessionStorage(); // Update sessionStorage
  }
});

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

  let variationsDisplay = "";
  for (const variationName in item.variations) {
    variationsDisplay += `<div class="text-xs text-gray-700">${variationName}: ${item.variations[variationName]}</div>`;
  }

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

  const deleteButton = listItem.querySelector(".delete-item");
  deleteButton.addEventListener("click", () => {
    deleteItem(listItem);
  });

  const editButton = listItem.querySelector(".edit-item");
  editButton.addEventListener("click", () => {
    editItem(listItem);
  });

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
    // Find the label that matches the variation name
    const labels = document.querySelectorAll("#variationsContainer label");
    let matchingLabel;
    labels.forEach((label) => {
      if (label.textContent.replace(":", "") === variationName) {
        matchingLabel = label;
      }
    });

    if (matchingLabel) {
      // Get the parent variation div
      const variationDiv = matchingLabel.parentElement;

      // **Clear previously selected buttons in the same group**
      const buttons = variationDiv.querySelectorAll("button");
      buttons.forEach((button) => {
        button.classList.remove("bg-blue-200");
      });

      // Find the button with the matching variation option
      buttons.forEach((button) => {
        if (button.textContent === item.variations[variationName]) {
          button.classList.add("bg-blue-200");
        }
      });
    }
  }

  quantityInput.value = item.quantity;

  deleteItem(listItem); // Remove the item from the list and array
}

function updateSessionStorage() {
  sessionStorage.setItem("orderList", JSON.stringify(orderListArray));
}

// Load from sessionStorage
orderListArray = JSON.parse(sessionStorage.getItem("orderList")) || [];
orderListArray.forEach((item) => {
  orderList.appendChild(createListItem(item));
});

async function fetchProductDetails() {
  try {
    const productId = window.location.pathname.split("/").pop();
    const response = await fetch(`/products/get-product/${productId}`);
    if (response.ok) {
      const product = await response.json();

      // Populate product details
      productName.textContent = product.name;
      productPrice.textContent = `${product.price}PHP`;
      productDetails.textContent = product.details;

      // Store product images (mapped to cloudinaryURL)
      if (product.images && product.images.length > 0) {
        productImages = product.images.map((img) => img.cloudinaryUrl); // Remove await here
        galleryImage.src = productImages[0];
      } else {
        galleryImage.src = "https://via.placeholder.com/600"; // Placeholder image
      }

      if (product.variations && product.variations.length > 0) {
        populateVariations(product.variations);
      }

      productData.push({
        name: product.name,
        id: productId,
        price: product.price,
      });

      sessionStorage.setItem("product-details", JSON.stringify(productData));
    } else {
      console.error("Failed to fetch product details:", response.statusText);
    }
  } catch (error) {
    console.error("Error fetching product details:", error);
  }
}

function updateGalleryImage() {
  if (productImages && productImages.length > 0) {
    galleryImage.src = productImages[currentImageIndex];
  } else {
    galleryImage.src = "https://via.placeholder.com/600"; // Placeholder
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

fetchProductDetails();

// Upload Files Functionality
const designUploadPrints = document.getElementById("designUploadPrints");
const uploadedFilesList = document.getElementById("uploadedFilesList");
const addFilesButton = document.getElementById("addFilesButton");
const infoIcons = document.querySelectorAll(".info-icon");
const infoBoxes = document.querySelectorAll(".info-box");

let filesArray = [];

// Info Box Functionality
infoIcons.forEach((icon, index) => {
  icon.addEventListener("mouseover", (event) => {
    const infoText = icon.getAttribute("data-info");
    infoBoxes[index].textContent = infoText;
    infoBoxes[index].classList.remove("hidden");
  });

  icon.addEventListener("mouseout", () => {
    infoBoxes[index].classList.add("hidden");
  });
});

// Upload Prints Functionality
addFilesButton.addEventListener("click", () => {
  designUploadPrints.click();
});

designUploadPrints.addEventListener("change", (event) => {
  handleFileUpload(event.target.files);
});

function handleFileUpload(files) {
  if (files && files.length > 0) {
    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const fileExtension = file.name.split(".").pop().toUpperCase();
        const { size, unit } = formatFileSize(file.size);

        filesArray.push({
          file: file, // For Multer upload
          dataURL: e.target.result,
          name: file.name,
          size: `${size} ${unit}`,
          extension: fileExtension,
        });
        renderFiles();
      };
      reader.readAsDataURL(file);
    });
  }
}

function renderFiles() {
  uploadedFilesList.innerHTML = "";
  filesArray.forEach((fileObj, index) => {
    const fileCard = createFileCard(fileObj, index);
    uploadedFilesList.appendChild(fileCard);
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
    .addEventListener("click", (event) => {
      removeFile(index);
    });

  return fileCard;
}

function formatFileSize(bytes) {
  if (bytes < 1024) {
    return { size: bytes.toFixed(2), unit: "B" };
  } else if (bytes < 1024 * 1024) {
    return { size: (bytes / 1024).toFixed(2), unit: "KB" };
  } else if (bytes < 1024 * 1024 * 1024) {
    return { size: (bytes / (1024 * 1024)).toFixed(2), unit: "MB" };
  } else if (bytes < 1024 * 1024 * 1024 * 1024) {
    return {
      size: (bytes / (1024 * 1024 * 1024)).toFixed(2),
      unit: "GB",
    };
  } else {
    return {
      size: (bytes / (1024 * 1024 * 1024 * 1024)).toFixed(2),
      unit: "TB",
    };
  }
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

function validateOrder() {
  const uploadedFiles =
    document.getElementById("uploadedFilesList").children.length;
  const quantityInput = document.querySelector(
    "#variationsContainer input[type='number']"
  );
  const quantity = quantityInput ? parseInt(quantityInput.value) : NaN; // Parse to NaN if invalid
  const variations = [];
  document
    .querySelectorAll(
      "#variationsContainer > div:not(:last-child) button.bg-blue-200"
    )
    .forEach((element) => {
      variations.push(element.textContent);
    });

  if (uploadedFiles === 0) {
    Swal.fire({
      icon: "error",
      title: "Upload Required",
      text: "Please upload at least one design file.",
    });
    return false;
  }

  if (isNaN(quantity) || quantity <= 0) {
    // Use isNaN to check for NaN
    Swal.fire({
      icon: "error",
      title: "Quantity Required",
      text: "Please enter a valid quantity.",
    });
    return false;
  }

  if (
    document.querySelectorAll("#variationsContainer > div:not(:last-child)")
      .length > 0 &&
    document.querySelectorAll(
      "#variationsContainer > div:not(:last-child) button.bg-blue-200"
    ).length !==
      document.querySelectorAll("#variationsContainer > div:not(:last-child)")
        .length
  ) {
    Swal.fire({
      icon: "error",
      title: "Variation Required",
      text: "Please select all variations.",
    });
    return false;
  }
  return true;
}

let cartItems = JSON.parse(sessionStorage.getItem("cartItems")) || [];

function fileToBase64(file) {
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
    ) {
      return false;
    }
  }
  return true;
}

function addToCart() {
  if (!validateOrder()) return;

  const productId = window.location.pathname.split("/").pop();
  const quantityInput = document.querySelector(
    "#variationsContainer input[type='number']"
  );
  const quantity = parseInt(quantityInput.value);

  const variationSelections = [];
  document
    .querySelectorAll(
      "#variationsContainer > div:not(:last-child) button.bg-blue-200"
    )
    .forEach((element) => {
      variationSelections.push(element.textContent);
    });

  const designPrints = [];
  for (const file of document.getElementById("designUploadPrints").files) {
    designPrints.push({
      name: file.name,
      type: file.type,
      size: file.size,
    });
  }

  const designNotes =
    document.getElementById("designNotes").value.trim() ||
    "The user left this empty.";

  const cartItem = {
    productId: productId,
    quantity: quantity,
    variations: variationSelections,
    designPrints: designPrints,
    designNotes: designNotes,
  };

  // Check if a similar item exists
  let existingItemIndex = -1;
  for (let i = 0; i < cartItems.length; i++) {
    if (
      cartItems[i].productId === productId &&
      areDesignPrintsEqual(cartItems[i].designPrints, designPrints) &&
      cartItems[i].designNotes === designNotes
    ) {
      existingItemIndex = i;
      break;
    }
  }

  if (existingItemIndex !== -1) {
    // Append variations to the existing item
    cartItems[existingItemIndex].variations.push(...variationSelections);
    cartItems[existingItemIndex].quantity += quantity;
  } else {
    // Add a new cart item
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
      // Add another variation logic
      console.log("Add another variation");
      // You can add logic here to clear variation selections if needed.
    } else if (result.isDenied) {
      // Add another design logic
      console.log("Add another design");
      clearFormFields();
    } else if (
      result.isDismissed &&
      result.dismiss === Swal.DismissReason.cancel
    ) {
      // Proceed to checkout logic
      console.log("Proceed to checkout");
      window.location.href = "/cart"; // Redirect to cart page
    } else {
      console.log("Browse Products");
      window.location.href = "/products"; // Redirect to products page
    }
  });
}

function clearFormFields() {
  // Clear variation selections
  document
    .querySelectorAll("#variationsContainer button.bg-blue-200")
    .forEach((button) => {
      button.classList.remove("bg-blue-200");
    });

  // Clear quantity input
  const quantityInput = document.querySelector(
    "#variationsContainer input[type='number']"
  );
  if (quantityInput) {
    quantityInput.value = "";
  }

  // Clear design prints
  document.getElementById("designUploadPrints").value = ""; // Clear file input
  document.getElementById("uploadedFilesList").innerHTML = ""; // Clear displayed list

  // Clear design notes
  document.getElementById("designNotes").value = "";
}

const checkoutButton = document.querySelector("#checkoutButton");

checkoutButton.addEventListener("click", () => {
  const designPrints = filesArray.map((fileObj) => ({
    name: fileObj.name,
    type: fileObj.file.type,
    size: fileObj.file.size,
    file: fileObj.file,
  }));

  const designNotes =
    document.getElementById("designNotes").value.trim() ||
    "The user left this empty.";

  let validationPassed = true;
  let errorMessage = "";
  let errorTitle = "";

  if (designPrints.length === 0) {
    validationPassed = false;
    errorTitle = "No Design Uploaded";
    errorMessage = "Please upload at least one design file.";
  } else if (
    document.querySelectorAll("#variationsContainer > div").length > 0
  ) {
    if (orderListArray.length === 0) {
      validationPassed = false;
      errorTitle = "No Order List";
      errorMessage = "Please add at least one item to the order list.";
    }
  } else {
    const quantity = parseInt(quantityInput.value);
    if (!quantity || quantity <= 0) {
      validationPassed = false;
      errorTitle = "Invalid Quantity";
      errorMessage = "Please provide a valid quantity.";
    }
  }

  if (validationPassed) {
    const firestoreData = {
      guestId: sessionStorage.getItem("guestId"),
      productId: window.location.pathname.split("/").pop(),
      designPrints: designPrints,
      designNotes: designNotes,
      orderList: orderListArray,
    };

    Swal.fire({
      title: "Loading...",
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
        fetch("/upload", {
          method: "POST",
          body: (() => {
            const formData = new FormData();
            formData.append("guestId", firestoreData.guestId);
            designPrints.forEach((fileObj) => {
              formData.append("files", fileObj.file);
            });
            return formData;
          })(),
        })
          .then((response) => {
            if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
          })
          .then((data) => {
            Swal.close();
            if (data && data.files && data.files.length > 0) {
              const uploadedFiles = data.files.map((file, index) => ({
                filename: file.filename,
                path: file.path,
                cloudinaryUrl: file.cloudinaryUrl,
                publicId: file.publicId,
                originalName: filesArray[index].name,
                originalSize: filesArray[index].size,
                originalExtension: filesArray[index].name.split(".").pop(),
              }));

              sessionStorage.setItem(
                "filesArray",
                JSON.stringify(uploadedFiles)
              );
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
                text: "File upload failed or no files in response",
              });
            }
          })
          .catch((error) => {
            Swal.close();
            console.error("File upload failed:", error);
            if (error instanceof TypeError) {
              Swal.fire({
                icon: "error",
                title: "Network Error",
                text: "Network error during file upload. Please check your connection.",
              });
            } else if (error instanceof Error) {
              Swal.fire({
                icon: "error",
                title: "Server Error",
                text: "Server error during file upload. Please try again later.",
              });
            } else {
              Swal.fire({
                icon: "error",
                title: "Upload Failed",
                text: "File upload failed. Please try again.",
              });
            }
          });
      },
    });
  } else {
    Swal.fire({
      icon: "error",
      title: errorTitle,
      text: errorMessage,
    });
  }
});
