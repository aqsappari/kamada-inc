// ---------------------------- DOM Element References ----------------------------
const addImageButton = document.getElementById("addImageButton");
const imageUpload = document.getElementById("imageUpload");
const productImages = document.getElementById("productImages");
const variationsContainer = document.getElementById("variationsContainer");
const addVariationButton = document.getElementById("addVariationButton");
const variationPreview = document.getElementById("variationPreview");
const saveButton = document.getElementById("saveButton");
const deleteButton = document.getElementById("deleteButton");
const designableToggle = document.getElementById("isDesignableBx");
const designableStatusLabel = document.getElementById("designableLabel");
const availabilitySelect = document.getElementById("availabilitySelect");
const featuredCheckbox = document.getElementById("isFeaturedBx");
const featuredLabel = document.getElementById("featuredLabel");
const productTypeInputEl = document.getElementById("productType");
const productTypeTagWrapper = document.getElementById("tagInputWrapper");
const productTypeSuggestionsEl = document.getElementById("suggestions");
const productPriceInput = document.getElementById("productPrice");

// ---------------------------- State Variables ----------------------------
let filesToUpload = [];
let filesAlreadyUploaded = [];
let filesRemoved = [];
let productId = window.location.pathname.split("/").pop();
let selectedProductTypes = [];
let productOrders = 0;

// -------- Product Type Constants --------
const PRODUCT_TYPE_LIST = [
  "T-Shirt",
  "Mug",
  "Sticker",
  "Poster",
  "Notebook",
  "Canvas",
  "Hoodie",
  "Cap",
  "Phone Case",
  "Keychain",
  "Water Bottle",
  "Sweatshirt",
  "Backpack",
  "Tote Bag",
  "Banner",
  "Business Card",
  "Invitation",
  "Envelope",
  "Brochure",
  "Flyer",
];
const MAX_DEFAULT_SUGGESTIONS = 6;

// -------- Debounce Variables (INSERT HERE) --------
const DEBOUNCE_DELAY = 300; // milliseconds
let debounceTimer;

// ============================ Data Fetching Module ============================
/**
 * Fetches product data from the server based on the product ID.
 * @param {string} productId - The ID of the product to fetch.
 * @returns {Promise<object|null>} The product data as a JSON object, or null if an error occurs.
 */
async function fetchProductData(productId) {
  if (!productId || productId === "add-product") return null;
  try {
    const response = await fetch(`/admin/products/${productId}/retrieve`);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error("Error fetching product data:", error);
    Swal.fire({
      icon: "error",
      title: "Fetch Error",
      text: error.message || "Failed to fetch product data.",
    });
    return null;
  }
}

// ============================ Form Population Module ============================
/**
 * Populates the form fields with the provided product data.
 * @param {object} productData - The data of the product to populate the form with.
 */
async function populateForm(productData) {
  if (!productData) return;

  productOrders = productData.order || 0;
  document.getElementById("productName").value = productData.name || "";
  document.getElementById("productPrice").value = productData.price || "";
  document.getElementById("productDetails").value = productData.details || "";

  // Populate Variations
  if (productData.variations && productData.variations.length > 0) {
    variationsContainer.innerHTML = "";
    productData.variations.forEach(renderExistingVariation);
    updatePreview();
  }

  // Populate Images
  if (productData.images && productData.images.length > 0) {
    productImages.innerHTML = "";
    productData.images.forEach(renderExistingImage);
  }

  // Populate Product Types
  if (productData.productTypes && productData.productTypes.length > 0) {
    productData.productTypes.forEach(addProductTypeTag);
  }

  // Populate UI Toggles/Selects
  designableToggle.checked = productData.isDesignable || false;
  updateDesignableStatusLabel();
  availabilitySelect.value =
    productData.availability || availabilitySelect.options[0].value;
  featuredCheckbox.checked = productData.isFeatured || false;
  updateFeaturedLabel();
}

// ============================ Image Handling Module ============================
/**
 * Renders an existing image to the product images container.
 * @param {object} image - The image object containing URL, public ID, and filename.
 */
function renderExistingImage(image) {
  const imgDiv = document.createElement("div");
  imgDiv.classList.add("relative", "flex-shrink-0");
  imgDiv.innerHTML = `
  <img src="${image.cloudinaryUrl}" class="w-[250px] h-full p-4 object-contain rounded-md border relative" alt="${image.filename}">
  <button type="button" class="absolute top-0 right-0 bg-red-500 text-white p-1 px-3 rounded-full deleteImage" data-publicId="${image.publicId}">X</button>
`;
  productImages.appendChild(imgDiv);
  filesAlreadyUploaded.push({
    cloudinaryUrl: image.cloudinaryUrl,
    publicId: image.publicId,
    filename: image.filename,
  });
}

/**
 * Handles the addition of a new image to the upload queue and displays it.
 * @param {File} file - The image file to be added.
 */
function handleImageUpload(file) {
  const imgDiv = document.createElement("div");
  imgDiv.classList.add("relative", "h-[280px]");
  imgDiv.innerHTML = `
    <img src="${URL.createObjectURL(
      file
    )}" class="w-fit h-full p-2 bg-white object-contain rounded-md border relative" alt="${
    file.name
  }">
    <button type="button" class="absolute top-0 right-0 bg-red-500 text-white p-1 px-3 rounded-full deleteImage" data-filename="${
      file.name
    }">X</button>
  `;
  productImages.appendChild(imgDiv);
  filesToUpload.push(file);
}

/**
 * Handles the deletion of an image, updating the respective file arrays.
 * @param {HTMLElement} deleteButton - The button that triggered the delete action.
 */
function handleDeleteImage(deleteButton) {
  const publicId = deleteButton.dataset.publicid;
  if (publicId) {
    const index = filesAlreadyUploaded.findIndex(
      (image) => image.publicId === publicId
    );
    if (index !== -1) {
      filesRemoved.push(filesAlreadyUploaded[index]);
      filesAlreadyUploaded.splice(index, 1);
    }
  } else {
    const filename = deleteButton.dataset.filename;
    const index = filesToUpload.findIndex((file) => file.name === filename);
    if (index !== -1) {
      filesToUpload.splice(index, 1);
    }
  }
  deleteButton.parentElement.remove();
}

// ============================ Variation Handling Module ============================
/**
 * Renders an existing variation to the variations container.
 * @param {object} variation - The variation object containing name and options.
 */
function renderExistingVariation(variation) {
  const variationDiv = document.createElement("div");
  variationDiv.className = "mb-4 variation-item p-2";
  variationDiv.innerHTML = `
    <div class="w-full border-b my-4 lg:hidden"></div>
    <div class="flex items-center mb-2">
      <label class="block text-sm font-medium text-gray-700 mr-2">Variation Name:</label>
      <input type="text" class="mt-1 p-2 border rounded-md w-full" id="variation-name" value="${
        variation.name
      }" placeholder="e.g., Size, Color, Material">
      <button type="button" class="bg-red-500 text-white p-2 rounded-md ml-2 deleteVariation">Delete</button>
    </div>
    <div class="w-full border-b my-4"></div>
    <div class="variation-options">
      ${variation.options.map(renderExistingOption).join("")}
    </div>
    <div class="flex justify-end">
      <button type="button" class="bg-blue-500 text-white p-2 rounded-md addOption">Add Option</button>
    </div>
  `;
  variationsContainer.appendChild(variationDiv);
}

/**
 * Renders an existing variation option.
 * @param {string} option - The text of the variation option.
 * @returns {string} The HTML string for the option.
 */
function renderExistingOption(option) {
  return `
    <div class="mb-2 flex items-center">
      <label class="block text-sm font-medium text-gray-700 mr-2">Option:</label>
      <input type="text" class="mt-1 p-2 border rounded-md w-full" value="${option}" placeholder="e.g., Small, Red, Cotton">
      <button type="button" class="bg-red-500 text-white p-2 rounded-md ml-2 deleteOption">Delete</button>
    </div>
  `;
}

/**
 * Handles the addition of a new variation to the form.
 */
function handleAddVariation() {
  const variationDiv = document.createElement("div");
  variationDiv.className = "mb-4 variation-item p-2";
  variationDiv.innerHTML = `
    <div class="w-full border-b my-4 lg:hidden"></div>
    <div class="flex items-center mb-2">
      <label class="block text-sm font-medium text-gray-700 mr-2">Variation Name:</label>
      <input type="text" class="mt-1 p-2 border rounded-md w-full" id="variation-name" placeholder="e.g., Size, Color, Material">
      <button type="button" class="bg-red-500 text-white p-2 rounded-md ml-2 deleteVariation">Delete</button>
    </div>
    <div class="w-full border-b my-4"></div>
    <div class="variation-options"></div>
    <div class="flex justify-end">
      <button type="button" class="bg-blue-500 text-white p-2 rounded-md addOption">Add Option</button>
    </div>
  `;
  variationsContainer.appendChild(variationDiv);
  updatePreview();
  variationDiv.querySelector("#variation-name").focus();
}

/**
 * Handles the deletion of a variation.
 * @param {HTMLElement} deleteButton - The button that triggered the delete action.
 */
function handleDeleteVariation(deleteButton) {
  deleteButton.parentElement.parentElement.remove();
  updatePreview();
}

/**
 * Handles the addition of a new option to a variation.
 * @param {HTMLElement} addButton - The button that triggered the add action.
 */
function handleAddOption(addButton) {
  const optionsDiv =
    addButton.parentElement.parentElement.querySelector(".variation-options");
  const optionDiv = document.createElement("div");
  optionDiv.className = "mb-2 flex items-center";
  optionDiv.innerHTML = `
    <label class="block text-sm font-medium text-gray-700 mr-2">Option:</label>
    <input type="text" class="mt-1 p-2 border rounded-md w-full" id="variation-option" placeholder="e.g., Small, Red, Cotton">
    <button type="button" class="bg-red-500 text-white p-2 rounded-md ml-2 deleteOption">Delete</button>
  `;
  optionsDiv.appendChild(optionDiv);
  updatePreview();
  optionDiv.querySelector("#variation-option").focus();
}

/**
 * Handles the deletion of an option from a variation.
 * @param {HTMLElement} deleteButton - The button that triggered the delete action.
 */
function handleDeleteOption(deleteButton) {
  deleteButton.parentElement.remove();
  updatePreview();
}

// ============================ Variation Preview Module ============================
/**
 * Generates the live preview of the product variations.
 */
function generatePreview() {
  variationPreview.innerHTML = "";
  const variationItems = document.querySelectorAll(".variation-item");
  variationItems.forEach((item) => {
    const variationName = item.querySelector("input").value;
    const options = item.querySelectorAll(".variation-options input");
    if (variationName && options.length > 0) {
      const previewDiv = document.createElement("div");
      previewDiv.className = "mb-4 p-2";
      previewDiv.innerHTML = `
        <p class="font-semibold">${variationName}:</p>
        <div class="flex flex-wrap gap-2">
          ${Array.from(options)
            .map(
              (option) =>
                `<button class="bg-gray-200 p-2 rounded">${option.value}</button>`
            )
            .join("")}
        </div>
      `;
      variationPreview.appendChild(previewDiv);
    }
  });
}

/**
 * Updates the variation preview.
 */
function updatePreview() {
  generatePreview();
}

// ============================ Save Product Module ============================
/**
 * Handles the saving of the product data to the server.
 */
async function handleSaveProduct() {
  const productName = document.getElementById("productName").value.trim();
  const productPrice = document.getElementById("productPrice").value.trim();
  const productDetails = document.getElementById("productDetails").value.trim();

  // --- Validation ---
  if (!productName)
    return Swal.fire({
      icon: "error",
      title: "Product Name Required",
      text: "Please enter a product name.",
    });
  if (!productPrice)
    return Swal.fire({
      icon: "error",
      title: "Product Price Required",
      text: "Please enter a product price.",
    });
  if (!productDetails)
    return Swal.fire({
      icon: "error",
      title: "Product Details Required",
      text: "Please enter product details.",
    });

  const variations = Array.from(
    document.querySelectorAll(".variation-item")
  ).map((item) => ({
    name: item.querySelector("#variation-name").value,
    options: Array.from(item.querySelectorAll(".variation-options input")).map(
      (input) => input.value
    ),
  }));

  const formData = new FormData();
  formData.append("filesRemoved", JSON.stringify(filesRemoved));
  filesToUpload.forEach((file) => formData.append("files", file));

  let uploadCancelled = false;
  const uploadController = new AbortController();
  const saveController = new AbortController();

  const swalInstance = Swal.fire({
    title: "Processing Upload...",
    text: "Please wait while we upload your files and save product data.",
    allowOutsideClick: false,
    showConfirmButton: false,
    showCancelButton: true,
    cancelButtonText: "Cancel",
    willClose: async (result) => {
      if (result.dismiss === Swal.DismissReason.cancel) {
        uploadCancelled = true;
        uploadController.abort();
        saveController.abort();
        try {
          const cancelResponse = await fetch("cancel-upload", {
            method: "POST",
          });
          if (!cancelResponse.ok)
            console.error("Cancellation failed:", cancelResponse.statusText);
        } catch (error) {
          console.error("Cancellation error:", error);
        }
      }
    },
  });

  if (uploadCancelled)
    return Swal.fire({
      icon: "info",
      title: "Upload Cancelled",
      text: "The upload process was cancelled.",
    });

  try {
    const uploadResponse = await fetch("upload", {
      method: "POST",
      body: formData,
      signal: uploadController.signal,
    });
    if (!uploadResponse.ok) {
      const errorData = await uploadResponse.json();
      const errorMessage =
        errorData.error || `HTTP error! status: ${uploadResponse.status}`;
      return Swal.fire({
        icon: "error",
        title: "Upload Error",
        text: errorMessage,
      });
    }
    const uploadResult = await uploadResponse.json();
    if (uploadCancelled)
      return Swal.fire({
        icon: "info",
        title: "Upload Cancelled",
        text: "The upload process was cancelled.",
      });

    const firestoreData = {
      productId: productId === "add-product" ? null : productId,
      name: productName,
      price: productPrice,
      details: productDetails,
      variations: variations,
      images: [...filesAlreadyUploaded, ...uploadResult.files],
      order: productOrders,
      productTypes: selectedProductTypes,
      isDesignable: designableToggle.checked,
      availability: availabilitySelect.value,
      isFeatured: featuredCheckbox.checked,
    };

    const saveResponse = await fetch("save-to-firestore", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(firestoreData),
      signal: saveController.signal,
    });

    if (!saveResponse.ok)
      throw new Error(`HTTP error! status: ${saveResponse.status}`);
    const saveResult = await saveResponse.json();

    Swal.close();
    Swal.fire({
      icon: "success",
      title: "Product Saved!",
      text: "Product and images saved successfully.",
      confirmButtonText: "OK",
    }).then((result) => {
      if (result.isConfirmed) window.location.href = "/admin/products";
    });
  } catch (error) {
    if (error.name === "AbortError") {
      Swal.fire({
        icon: "info",
        title: "Upload Cancelled",
        text: "The upload process was cancelled.",
      });
    } else {
      console.error("Error during upload or save:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.message || "An error occurred.",
      });
    }
  }
}

// ============================ UI Updates Module ============================
/**
 * Updates the display label for the designable status.
 */
function updateDesignableStatusLabel() {
  const isChecked = designableToggle.checked;
  designableStatusLabel.textContent = isChecked ? "Yes" : "No";
  designableStatusLabel.className = `text-sm font-medium ${
    isChecked ? "text-teal-800" : "text-gray-500"
  }`;
}

/**
 * Updates the display label for the featured status.
 */
function updateFeaturedLabel() {
  const isChecked = featuredCheckbox.checked;
  featuredLabel.textContent = isChecked ? "Yes" : "No";
  featuredLabel.className = `text-sm ${
    isChecked ? "text-yellow-600" : "text-gray-500"
  }`;
}

// ============================ Product Type Handling Module ============================
/**
 * Handles the input event on the product type input with debouncing.
 * It prevents sending queries for single letter inputs.
 */
function handleProductTypeInput() {
  const inputValue = productTypeInputEl.value.trim();
  if (inputValue.length <= 1) {
    productTypeSuggestionsEl.classList.add("hidden");
    return;
  }

  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(showMatchingProductTypes, DEBOUNCE_DELAY);
}

/**
 * Handles the keydown event on the product type input to add tags on Enter.
 * @param {KeyboardEvent} e - The keyboard event.
 */
function handleProductTypeKeydown(e) {
  if (e.key === "Enter") {
    e.preventDefault();
    const value = productTypeInputEl.value.trim();
    if (value && !selectedProductTypes.includes(value)) {
      addProductTypeTag(value);
    }
    productTypeInputEl.value = "";
    showMatchingProductTypes();
  }
}

/**
 * Creates and appends a tag element for a selected product type.
 * @param {string} value - The product type value to add as a tag.
 */
function addProductTypeTag(value) {
  selectedProductTypes.push(value);
  const tag = document.createElement("span");
  tag.className =
    "bg-emerald-100 text-emerald-700 text-sm rounded-full px-3 py-1 flex items-center gap-2";
  tag.innerHTML = `
    <span>${value}</span>
    <button type="button" class="text-emerald-700 hover:text-red-500" aria-label="Remove tag">&times;</button>
  `;
  tag.querySelector("button").addEventListener("click", () => {
    selectedProductTypes = selectedProductTypes.filter((t) => t !== value);
    tag.remove();
  });
  productTypeTagWrapper.insertBefore(tag, productTypeInputEl);
}

/**
 * Updates the suggestions list for product types based on user input.
 */
function showMatchingProductTypes() {
  const inputValue = productTypeInputEl.value.toLowerCase();
  const matches = PRODUCT_TYPE_LIST.filter(
    (type) =>
      type.toLowerCase().includes(inputValue) &&
      !selectedProductTypes.includes(type)
  );
  const maxSuggestions =
    inputValue.length > 2
      ? 12
      : inputValue.length > 0
      ? 8
      : MAX_DEFAULT_SUGGESTIONS;
  const visibleSuggestions = matches.slice(0, maxSuggestions);
  productTypeSuggestionsEl.innerHTML = "";

  if (visibleSuggestions.length === 0) {
    productTypeSuggestionsEl.innerHTML = `<li class="px-4 py-2 text-gray-400 italic">Click Enter to insert a type</li>`;
  } else {
    visibleSuggestions.forEach((type) => {
      const li = document.createElement("li");
      li.textContent = type;
      li.className = "px-4 py-2 hover:bg-gray-100 cursor-pointer";
      li.onclick = () => {
        addProductTypeTag(type);
        productTypeInputEl.value = "";
        productTypeSuggestionsEl.classList.add("hidden");
      };
      productTypeSuggestionsEl.appendChild(li);
    });
  }
  productTypeSuggestionsEl.classList.remove("hidden");
}

// Update the event listener for the input event
productTypeInputEl.removeEventListener("input", showMatchingProductTypes); // Remove the direct listener
productTypeInputEl.addEventListener("input", handleProductTypeInput); // Add the debounced listener
productTypeInputEl.addEventListener("keydown", handleProductTypeKeydown);
productTypeInputEl.addEventListener("focus", handleProductTypeInput); // Keep focus triggering suggestions (with debounce)
// ============================ Delete Product Module ============================
/**
 * Handles the deletion of a product, including confirmation and server requests.
 */

if (deleteButton) {
  deleteButton.addEventListener("click", async () => {
    const productIdToDelete = window.location.pathname.split("/").pop();

    if (productIdToDelete === "add-product") {
      return Swal.fire({
        icon: "warning",
        title: "Cannot Delete",
        text: "You can only delete existing products.",
      });
    }

    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          Swal.fire({
            title: "Deleting...",
            text: "Please wait while we delete the product.",
            allowOutsideClick: false,
            showConfirmButton: false,
            didOpen: () => {
              Swal.showLoading();
            },
          });

          const cloudinaryResponse = await fetch(
            `/admin/products/delete-cloudinary/${productIdToDelete}`,
            { method: "DELETE" }
          );
          if (!cloudinaryResponse.ok)
            throw new Error(
              `Cloudinary delete failed: ${cloudinaryResponse.statusText}`
            );

          const firestoreResponse = await fetch(
            `/admin/products/delete-firestore/${productIdToDelete}`,
            { method: "DELETE" }
          );
          if (!firestoreResponse.ok)
            throw new Error(
              `Firestore delete failed: ${firestoreResponse.statusText}`
            );

          Swal.close();
          Swal.fire({
            icon: "success",
            title: "Product Deleted!",
            text: "The product has been deleted.",
            confirmButtonText: "OK",
          }).then((result) => {
            if (result.isConfirmed) window.location.href = "/admin/products";
          });
        } catch (error) {
          console.error("Delete error:", error);
          Swal.close();
          Swal.fire(
            "Error!",
            error.message || "An error occurred during deletion.",
            "error"
          );
        }
      }
    });
  });
}

// ============================ Event Listeners ============================
// -------- Image Handling Event Listeners --------
addImageButton.addEventListener("click", () => imageUpload.click());
imageUpload.addEventListener(
  "change",
  (event) =>
    Array.from(event.target.files).forEach(handleImageUpload) &&
    (imageUpload.value = "")
);
productImages.addEventListener(
  "click",
  (event) =>
    event.target.classList.contains("deleteImage") &&
    handleDeleteImage(event.target)
);

// -------- Variation Handling Event Listeners --------
variationsContainer.addEventListener("input", updatePreview);
variationsContainer.addEventListener("click", (event) => {
  if (event.target.classList.contains("deleteVariation"))
    handleDeleteVariation(event.target);
  else if (event.target.classList.contains("addOption"))
    handleAddOption(event.target);
  else if (event.target.classList.contains("deleteOption"))
    handleDeleteOption(event.target);
});
addVariationButton.addEventListener("click", handleAddVariation);

// -------- Product Type Event Listeners --------
productTypeInputEl.removeEventListener("input", showMatchingProductTypes); // Remove the direct listener
productTypeInputEl.addEventListener("input", handleProductTypeInput); // Add the debounced listener
productTypeInputEl.addEventListener("keydown", handleProductTypeKeydown);
productTypeInputEl.addEventListener("focus", handleProductTypeInput); // Keep focus triggering suggestions (with debounce)
document.addEventListener("click", (e) => {
  if (!productTypeTagWrapper.contains(e.target)) {
    productTypeSuggestionsEl.classList.add("hidden");
  }
});

// -------- Other Functionality Event Listeners --------
saveButton.addEventListener("click", handleSaveProduct);
designableToggle.addEventListener("change", updateDesignableStatusLabel);
featuredCheckbox.addEventListener("change", updateFeaturedLabel);

// -------- Initializations and Fetching --------
updateDesignableStatusLabel();
updateFeaturedLabel();
updatePreview(); // Ensure preview is initially rendered (if variations exist on load)
// formatPriceInput(); // Assuming this function exists and is correctly defined elsewhere
fetchProductData(productId).then(populateForm);

// This line will cause a deliberate error for demonstration purposes, but is otherwise invalid.
// ThisIsAnIntentionalErrorForDemonstration = 123;
