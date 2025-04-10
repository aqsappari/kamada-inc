document.addEventListener("DOMContentLoaded", () => {
  const addImageButton = document.getElementById("addImageButton");
  const imageUpload = document.getElementById("imageUpload");
  const productImages = document.getElementById("productImages");
  const variationsContainer = document.getElementById("variationsContainer");
  const addVariationButton = document.getElementById("addVariationButton");
  const variationPreview = document.getElementById("variationPreview");
  const saveButton = document.getElementById("saveButton");

  let filesToUpload = [];
  let filesAlreadyUploaded = [];
  let filesRemoved = [];

  let productId = window.location.pathname.split("/").pop();

  async function fetchProductData(productId) {
    if (productId && productId !== "add-product") {
      try {
        const response = await fetch(`/admin/products/${productId}/retrieve`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const productData = await response.json();
        return productData;
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
    return null;
  }

  async function populateForm(productData) {
    if (productData) {
      document.getElementById("productName").value = productData.name || "";
      document.getElementById("productPrice").value = productData.price || "";
      document.getElementById("productDetails").value =
        productData.details || "";

      if (productData.variations && productData.variations.length > 0) {
        variationsContainer.innerHTML = "";
        productData.variations.forEach((variation) => {
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
                                        ${variation.options
                                          .map(
                                            (option) => `
                                            <div class="mb-2 flex items-center">
                                                <label class="block text-sm font-medium text-gray-700 mr-2">Option:</label>
                                                <input type="text" class="mt-1 p-2 border rounded-md w-full" value="${option}" placeholder="e.g., Small, Red, Cotton">
                                                <button type="button" class="bg-red-500 text-white p-2 rounded-md ml-2 deleteOption">Delete</button>
                                            </div>
                                        `
                                          )
                                          .join("")}
                                    </div>
                                    <div class="flex justify-end">
                                        <button type="button" class="bg-blue-500 text-white p-2 rounded-md addOption">Add Option</button>
                                    </div>
                                `;
          variationsContainer.appendChild(variationDiv);
        });
        updatePreview();
      }

      if (productData.images && productData.images.length > 0) {
        productImages.innerHTML = "";
        productData.images.forEach((image) => {
          const imgDiv = document.createElement("div");
          imgDiv.classList.add("relative", "flex-shrink-0");
          imgDiv.innerHTML = `
                                    <img src="${image.cloudinaryUrl}" class="w-auto h-full p-4 object-contain rounded-md border relative" alt="${image.filename}">
                                    <button type="button" class="absolute top-0 right-0 bg-red-500 text-white p-1 px-3 rounded-full deleteImage" data-publicId="${image.publicId}">X</button>
                                `;
          productImages.appendChild(imgDiv);
          filesAlreadyUploaded.push({
            cloudinaryUrl: image.cloudinaryUrl,
            publicId: image.publicId,
            filename: image.filename,
          });
        });
      }
    }
  }

  fetchProductData(productId).then((productData) => populateForm(productData));

  addImageButton.addEventListener("click", () => {
    imageUpload.click();
  });

  imageUpload.addEventListener("change", (event) => {
    Array.from(event.target.files).forEach((file) => {
      const imgDiv = document.createElement("div");
      imgDiv.classList.add("relative", "flex-shrink-0");
      imgDiv.innerHTML = `
                            <img src="${URL.createObjectURL(
                              file
                            )}" class="w-auto h-full p-4 object-contain rounded-md border relative" alt="${
        file.name
      }">
                            <button type="button" class="absolute top-0 right-0 bg-red-500 text-white p-1 px-3 rounded-full deleteImage" data-filename="${
                              file.name
                            }">X</button>
                        `;
      productImages.appendChild(imgDiv);
      filesToUpload.push(file); // Store the File object directly
    });
    imageUpload.value = "";
  });

  productImages.addEventListener("click", (event) => {
    if (event.target.classList.contains("deleteImage")) {
      const publicId = event.target.dataset.publicid;
      if (publicId) {
        const index = filesAlreadyUploaded.findIndex(
          (image) => image.publicId === publicId
        );
        if (index !== -1) {
          filesRemoved.push(filesAlreadyUploaded[index]);
          filesAlreadyUploaded.splice(index, 1);
        }
      } else {
        const filename = event.target.dataset.filename;
        const index = filesToUpload.findIndex((file) => file.name === filename);
        if (index !== -1) {
          filesToUpload.splice(index, 1);
        }
      }
      event.target.parentElement.remove();
    }
  });

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

  function updatePreview() {
    generatePreview();
  }

  variationsContainer.addEventListener("input", updatePreview);
  variationsContainer.addEventListener("click", (event) => {
    if (
      event.target.classList.contains("deleteVariation") ||
      event.target.classList.contains("deleteOption") ||
      event.target.classList.contains("addOption")
    ) {
      updatePreview();
    }
  });

  addVariationButton.addEventListener("click", () => {
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
  });

  variationsContainer.addEventListener("click", (event) => {
    if (event.target.classList.contains("deleteVariation")) {
      event.target.parentElement.parentElement.remove();
      updatePreview();
    } else if (event.target.classList.contains("addOption")) {
      const optionsDiv =
        event.target.parentElement.parentElement.querySelector(
          ".variation-options"
        );
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
    } else if (event.target.classList.contains("deleteOption")) {
      event.target.parentElement.remove();
      updatePreview();
    }
  });

  updatePreview();

  saveButton.addEventListener("click", async () => {
    const productName = document.getElementById("productName").value.trim();
    const productPrice = document.getElementById("productPrice").value.trim();
    const productDetails = document
      .getElementById("productDetails")
      .value.trim();

    if (!productName) {
      Swal.fire({
        icon: "error",
        title: "Product Name Required",
        text: "Please enter a product name.",
      });
      return;
    }
    if (!productPrice) {
      Swal.fire({
        icon: "error",
        title: "Product Price Required",
        text: "Please enter a product price.",
      });
      return;
    }
    if (!productDetails) {
      Swal.fire({
        icon: "error",
        title: "Product Details Required",
        text: "Please enter product details.",
      });
      return;
    }

    const variations = [];
    document.querySelectorAll(".variation-item").forEach((variationItem) => {
      const variationName =
        variationItem.querySelector("#variation-name").value;
      const options = Array.from(
        variationItem.querySelectorAll(".variation-options input")
      ).map((input) => input.value);
      variations.push({ name: variationName, options: options });
    });

    const formData = new FormData();
    formData.append("productName", productName);
    formData.append("productPrice", productPrice);
    formData.append("productDetails", productDetails);
    formData.append("variations", JSON.stringify(variations));
    formData.append("filesRemoved", JSON.stringify(filesRemoved));

    filesToUpload.forEach((file) => {
      formData.append("files", file);
    });

    let uploadCancelled = false;

    const uploadController = new AbortController();
    const saveController = new AbortController();

    try {
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
              if (!cancelResponse.ok) {
                console.error(
                  "Cancellation failed:",
                  cancelResponse.statusText
                );
                Swal.fire({
                  icon: "error",
                  title: "Cancellation Failed",
                  text: "Failed to cancel the upload.",
                });
              }
            } catch (error) {
              console.error("Cancellation error:", error);
              Swal.fire({
                icon: "error",
                title: "Cancellation Error",
                text: "An error occurred during cancellation.",
              });
            }
          }
        },
      });

      if (uploadCancelled) {
        Swal.close();
        Swal.fire({
          icon: "info",
          title: "Upload Cancelled",
          text: "The upload process was cancelled.",
        });
        return;
      }

      const uploadResponse = await fetch("upload", {
        method: "POST",
        body: formData,
        signal: uploadController.signal,
      });

      if (uploadCancelled) {
        Swal.close();
        Swal.fire({
          icon: "info",
          title: "Upload Cancelled",
          text: "The upload process was cancelled.",
        });
        return;
      }

      if (!uploadResponse.ok) {
        const errorData = await uploadResponse.json();
        if (uploadResponse.status === 413) {
          Swal.fire({
            icon: "error",
            title: "Upload Error",
            text: errorData.error,
          });
        } else if (uploadResponse.status === 400) {
          Swal.fire({
            icon: "error",
            title: "Upload Error",
            text: errorData.error,
          });
        } else {
          Swal.fire({
            icon: "error",
            title: "Upload Error",
            text: `HTTP error! status: ${uploadResponse.status}`,
          });
        }
        return;
      }

      const uploadResult = await uploadResponse.json();

      if (uploadCancelled) {
        Swal.close();
        Swal.fire({
          icon: "info",
          title: "Upload Cancelled",
          text: "The upload process was cancelled.",
        });
        return;
      }

      productId = productId == "add-product" ? null : productId;

      const firestoreData = {
        productId: productId,
        name: productName,
        price: productPrice,
        details: productDetails,
        variations: variations,
        images: filesAlreadyUploaded.concat(uploadResult.files),
        order: 0,
      };

      const saveResponse = await fetch("save-to-firestore", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(firestoreData),
        signal: saveController.signal,
      });

      if (uploadCancelled) {
        Swal.close();
        Swal.fire({
          icon: "info",
          title: "Upload Cancelled",
          text: "The upload process was cancelled.",
        });
        return;
      }

      if (!saveResponse.ok) {
        throw new Error(`HTTP error! status: ${saveResponse.status}`);
      }

      const saveResult = await saveResponse.json();

      Swal.close();
      Swal.fire({
        icon: "success",
        title: "Product Saved!",
        text: "Product and images saved successfully.",
        confirmButtonText: "OK",
      }).then((result) => {
        if (result.isConfirmed) {
          window.location.href = "/admin/products";
        }
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
  });

  const deleteButton = document.getElementById("deleteButton");

  deleteButton.addEventListener("click", async () => {
    const productId = window.location.pathname.split("/").pop();

    if (productId === "add-product") {
      Swal.fire({
        icon: "warning",
        title: "Cannot Delete",
        text: "You can only delete existing products.",
      });
      return;
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

          // 1. Delete files from Cloudinary
          const cloudinaryResponse = await fetch(
            `/admin/products/delete-cloudinary/${productId}`,
            {
              method: "DELETE",
            }
          );
          if (!cloudinaryResponse.ok) {
            throw new Error(
              `Cloudinary delete failed: ${cloudinaryResponse.statusText}`
            );
          }

          // 2. Delete data from Firestore
          const firestoreResponse = await fetch(
            `/admin/products/delete-firestore/${productId}`,
            {
              method: "DELETE",
            }
          );
          if (!firestoreResponse.ok) {
            throw new Error(
              `Firestore delete failed: ${firestoreResponse.statusText}`
            );
          }

          Swal.close();
          Swal.fire({
            icon: "success",
            title: "Product Deleted!",
            text: "The product has been deleted.",
            confirmButtonText: "OK", // Optional: Customize the button text
          }).then((result) => {
            if (result.isConfirmed) {
              window.location.href = "/admin/products";
            }
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
});
