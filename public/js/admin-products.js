const products = {
  "T-Shirt": {
    Cotton: {
      price: 15,
      sizes: {
        S: 'Chest: 34-36"',
        M: 'Chest: 38-40"',
        L: 'Chest: 42-44"',
        XL: 'Chest: 46-48"',
      },
      colors: ["Red", "Blue", "Green", "Black"],
    },
    Polyester: {
      price: 20,
      sizes: {
        M: 'Chest: 38-40"',
        L: 'Chest: 42-44"',
        XL: 'Chest: 46-48"',
        XXL: 'Chest: 50-52"',
      },
      colors: ["White", "Gray", "Navy"],
    },
  },
  Hoodie: {
    Fleece: {
      price: 30,
      sizes: {
        S: 'Chest: 36-38"',
        M: 'Chest: 40-42"',
        L: 'Chest: 44-46"',
      },
      colors: ["Black", "Charcoal", "Maroon"],
    },
    Wool: {
      price: 40,
      sizes: {
        M: 'Chest: 40-42"',
        L: 'Chest: 44-46"',
        XL: 'Chest: 48-50"',
      },
      colors: ["Beige", "Brown", "Cream"],
    },
  },
  "Polo Shirt": {
    "Pique Cotton": {
      price: 25,
      sizes: {
        S: 'Chest: 36-38"',
        M: 'Chest: 40-42"',
        L: 'Chest: 44-46"',
        XL: 'Chest: 48-50"',
      },
      colors: ["White", "Light Blue", "Dark Blue"],
    },
  },
};

const garmentsList = document.querySelector("#garmentsList");
const fabricsList = document.querySelector("#fabricsList");
const sizesList = document.querySelector("#sizesList");
const colorsList = document.querySelector("#colorsList");

const addGarmentButton = document.getElementById("addGarment");
const addFabricButton = document.getElementById("addFabric");
const addSizeButton = document.getElementById("addSize");
const addColorButton = document.getElementById("addColor");

let selectedGarment = null;
let selectedFabric = null;
let clickedGarment = null;
let clickedFabric = null;

// Populate Garments
for (const garment in products) {
  const garmentItem = document.createElement("li");
  garmentItem.innerHTML = `
        <span class="flex items-center justify-between p-2 border-b border-gray-200 group">
            ${garment}
            <div>
                <i class="fas fa-edit text-gray-500 hover:text-gray-700 mr-2"></i>
                <i class="fas fa-eye text-gray-500 hover:text-gray-700 mr-2"></i>
                <i class="fas fa-trash text-red-500 hover:text-red-700 mr-2"></i>
                <i class="fas fa-chevron-right arrow-button text-transparent group-hover:text-black"></i>
            </div>
        </span>
    `;
  garmentItem.classList.add("cursor-pointer");
  garmentItem.addEventListener("click", () => {
    if (selectedGarment == garment) {
      hideRelatedColumns(garmentItem);
      toggleArrow(garmentItem);
      clickedGarment = null;
      selectedGarment = null;
      clickedFabric = null;
      selectedFabric = null;
      addFabricButton.classList.add("hidden");
      addSizeButton.classList.add("hidden");
      addColorButton.classList.add("hidden");
      return;
    } else if (clickedGarment && selectedGarment != garment) {
      toggleArrow(clickedGarment);
      clickedFabric = null;
      selectedFabric = null;
      addSizeButton.classList.add("hidden");
      addColorButton.classList.add("hidden");
    }
    selectedGarment = garment;
    toggleArrow(garmentItem);
    populateFabrics(garment);
    addFabricButton.classList.remove("hidden");
    clickedGarment = garmentItem;
  });
  garmentsList.appendChild(garmentItem);
}

// Populate Fabrics
function populateFabrics(garment) {
  fabricsList.innerHTML = "";
  sizesList.innerHTML = "";
  colorsList.innerHTML = "";

  for (const fabric in products[garment]) {
    const fabricItem = document.createElement("li");
    fabricItem.innerHTML = `
            <span class="flex items-center justify-between p-2 border-b border-gray-200 group">
                ${fabric} ($${products[garment][fabric].price})
                <div>
                    <i class="fas fa-edit text-gray-500 hover:text-gray-700 mr-2"></i>
                    <i class="fas fa-eye text-gray-500 hover:text-gray-700 mr-2"></i>
                    <i class="fas fa-trash text-red-500 hover:text-red-700 mr-2"></i>
                <i class="fas fa-chevron-right arrow-button text-transparent group-hover:text-black"></i>
                </div>
            </span>
        `;
    fabricItem.classList.add("cursor-pointer");
    fabricItem.addEventListener("click", () => {
      if (selectedFabric == fabric) {
        hideRelatedColumns(fabricItem);
        toggleArrow(fabricItem);
        clickedFabric = null;
        selectedFabric = null;
        addSizeButton.classList.add("hidden");
        addColorButton.classList.add("hidden");
        return;
      } else if (clickedFabric && selectedFabric != fabric) {
        toggleArrow(clickedFabric);
        addSizeButton.classList.add("hidden");
        addColorButton.classList.add("hidden");
      }
      selectedFabric = fabric;
      toggleArrow(fabricItem);
      populateSizesColors(garment, fabric);
      addSizeButton.classList.remove("hidden");
      addColorButton.classList.remove("hidden");
      clickedFabric = fabricItem;
    });
    fabricsList.appendChild(fabricItem);
  }
}

// Populate Sizes and Colors
function populateSizesColors(garment, fabric) {
  sizesList.innerHTML = "";
  colorsList.innerHTML = "";

  for (const size in products[garment][fabric].sizes) {
    const sizeItem = document.createElement("li");
    sizeItem.innerHTML = `
            <span class="flex items-center justify-between p-2 border-b border-gray-200 group">
                ${size}
                <div>
                    <i class="fas fa-edit text-gray-500 hover:text-gray-700 mr-2"></i>
                    <i class="fas fa-eye text-gray-500 hover:text-gray-700 mr-2"></i>
                    <i class="fas fa-trash text-red-500 hover:text-red-700"></i>
                    <i class="fas fa-chevron-down arrow-button text-transparent group-hover:text-black"></i>
                </div>
            </span>
            <div class="ml-4 hidden" id="measurement-${size}">${products[garment][fabric].sizes[size]}</div>
        `;
    sizeItem.classList.add("cursor-pointer");
    sizeItem.addEventListener("click", () => {
      const measurementDiv = document.getElementById(`measurement-${size}`);
      toggleMeasurement(measurementDiv);
      toggleArrow(sizeItem);
    });
    sizesList.appendChild(sizeItem);
  }

  products[garment][fabric].colors.forEach((color) => {
    const colorItem = document.createElement("li");
    colorItem.innerHTML = `
            <span class="flex items-center justify-between p-2 border-b border-gray-200">
                ${color}
                <div>
                    <i class="fas fa-eye text-gray-500 hover:text-gray-700 mr-2"></i>
                    <i class="fas fa-trash text-red-500 hover:text-red-700"></i>
                </div>
            </span>
        `;
    colorsList.appendChild(colorItem);
  });
}

// Toggle Arrow Function (Using hidden class)
function toggleArrow(item) {
  const arrow = item.querySelector(".arrow-button");
  if (arrow.classList.contains("text-transparent")) {
    return arrow.classList.replace("text-transparent", "text-black");
  } else if (arrow.classList.contains("text-black")) {
    return arrow.classList.replace("text-black", "text-transparent");
  }
}

// Hide other Columns
function hideRelatedColumns(clickedItem) {
  const listId = clickedItem.parentElement.id;

  if (listId === "garmentsList") {
    fabricsList.innerHTML = "";
    sizesList.innerHTML = "";
    colorsList.innerHTML = "";
  } else if (listId === "fabricsList") {
    sizesList.innerHTML = "";
    colorsList.innerHTML = "";
  }
}

//Toggle measurement
function toggleMeasurement(measurementDiv) {
  const allMeasurements = document.querySelectorAll('[id^="measurement-"]');
  allMeasurements.forEach((m) => {
    if (m !== measurementDiv) {
      m.classList.add("hidden");
    }
  });
  measurementDiv.classList.toggle("hidden");
}

// Headless UI Dialogs

// Garment Modal Elements
const garmentModal = document.getElementById("garmentModal");
const cancelGarment = document.getElementById("cancelGarment");
const confirmGarment = document.getElementById("confirmGarment");
const newGarmentName = document.getElementById("newGarmentName");
const garmentError = document.getElementById("garmentError");

addGarmentButton.addEventListener("click", () => {
  showModal(garmentModal);
  newGarmentName.value = ""; // Clear previous input
  garmentError.classList.add("hidden"); // Hide previous errors
});

cancelGarment.addEventListener("click", () => {
  hideModal(garmentModal);
});

confirmGarment.addEventListener("click", () => {
  if (!newGarmentName.value.trim()) {
    garmentError.textContent = "Garment name is required.";
    garmentError.classList.remove("hidden");
    return;
  }

  // Simulate checking if garment already exists (replace with actual logic)
  if (products[newGarmentName.value.trim()]) {
    garmentError.textContent = "Garment already exists.";
    garmentError.classList.remove("hidden");
    return;
  }

  // Prepare data for backend (replace with actual backend endpoint)
  const garmentData = {
    name: newGarmentName.value.trim(),
  };

  fetch("/admin/garments", {
    // Removed :garment from URL
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ name: newGarmentName.value.trim() }), // Send name in body
  })
    .then((response) => response.json())
    .then((data) => {
      console.log("Success:", data);
      // Update UI with new garment
      hideModal(garmentModal);
    })
    .catch((error) => {
      console.error("Error:", error);
      garmentError.textContent = "An error occurred.";
      garmentError.classList.remove("hidden");
    });
});

// Fabric Modal Elements
const fabricModal = document.getElementById("fabricModal");
const cancelFabric = document.getElementById("cancelFabric");
const confirmFabric = document.getElementById("confirmFabric");
const fabricInputs = document.getElementById("fabricInputs");
const addFabricInputButton = document.getElementById("addFabricInput");
const fabricError = document.getElementById("fabricError");

addFabricButton.addEventListener("click", () => {
  showModal(fabricModal);
  fabricInputs.innerHTML = `
        <div class="flex space-x-2 mb-2">
            <input class="w-1/2 border p-2" placeholder="Fabric Name" required />
            <input type="number" class="w-1/2 border p-2" placeholder="Price" required />
            <button type="button" class="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded">Delete</button>
        </div>
    `;
  fabricError.classList.add("hidden");
});

cancelFabric.addEventListener("click", () => {
  hideModal(fabricModal);
});

confirmFabric.addEventListener("click", () => {
  const fabricData = [];
  const inputGroups = fabricInputs.querySelectorAll(".flex");

  for (const group of inputGroups) {
    const nameInput = group.querySelector("input:nth-child(1)");
    const priceInput = group.querySelector("input:nth-child(2)");

    if (!nameInput.value.trim() || !priceInput.value) {
      fabricError.textContent = "Fabric name and price are required.";
      fabricError.classList.remove("hidden");
      return;
    }

    fabricData.push({
      name: nameInput.value.trim(),
      price: parseFloat(priceInput.value),
      garment: selectedGarment,
    });
  }

  // Simulate sending data to backend (replace with actual fetch POST)
  console.log("Fabric Data to Send:", fabricData);
  fetch("/admin/fabrics", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ fabrics: fabricData }),
  })
    .then((response) => response.json())
    .then((data) => {
      console.log("Success:", data);
      hideModal(fabricModal);
    })
    .catch((error) => {
      console.error("Error:", error);
      fabricError.textContent = "An error occurred.";
      fabricError.classList.remove("hidden");
    });
});

addFabricInputButton.addEventListener("click", () => {
  const newInputGroup = document.createElement("div");
  newInputGroup.className = "flex space-x-2 mb-2";
  newInputGroup.innerHTML = `
        <input class="w-1/2 border p-2" placeholder="Fabric Name" required />
        <input type="number" class="w-1/2 border p-2" placeholder="Price" required />
        <button type="button" class="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded">Delete</button>
    `;

  newInputGroup.querySelector("button").addEventListener("click", () => {
    fabricInputs.removeChild(newInputGroup);
  });

  fabricInputs.appendChild(newInputGroup);
});

fabricInputs.addEventListener("click", (event) => {
  if (event.target.textContent === "Delete") {
    fabricInputs.removeChild(event.target.parentElement);
  }
});

// Size Modal Elements
const sizeModal = document.getElementById("sizeModal");
const cancelSize = document.getElementById("cancelSize");
const confirmSize = document.getElementById("confirmSize");
const sizeMeasurements = document.getElementById("sizeMeasurements");
const addMeasurementButton = document.getElementById("addMeasurement");
const sizeError = document.getElementById("sizeError");
const sizeInitials = document.getElementById("sizeInitials");

addSizeButton.addEventListener("click", () => {
  showModal(sizeModal);
  sizeMeasurements.innerHTML = `
        <div class="flex space-x-2 mb-2">
            <input class="w-1/2 border p-2" placeholder="Measurement Name (e.g., Chest)" required />
            <input class="w-1/2 border p-2" placeholder="Measurement Value (e.g., 37)" required />
            <button type="button" class="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded">Delete</button>
        </div>
    `;
  sizeError.classList.add("hidden");
  sizeInitials.value = "";
});

cancelSize.addEventListener("click", () => {
  hideModal(sizeModal);
});

confirmSize.addEventListener("click", () => {
  const measurements = {};
  const inputGroups = sizeMeasurements.querySelectorAll(".flex");

  for (const group of inputGroups) {
    const nameInput = group.querySelector("input:nth-child(1)");
    const valueInput = group.querySelector("input:nth-child(2)");

    if (!nameInput.value.trim() || !valueInput.value.trim()) {
      sizeError.textContent = "Measurement name and value are required.";
      sizeError.classList.remove("hidden");
      return;
    }

    measurements[nameInput.value.trim()] = valueInput.value.trim();
  }

  const initials = sizeInitials.value.trim();

  if (!initials) {
    sizeError.textContent = "Size initials are required.";
    sizeError.classList.remove("hidden");
    return;
  }

  // Simulate sending data to backend (replace with actual fetch POST)
  console.log("Size Data to Send:", { initials, measurements });
  fetch("/admin/sizes", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      garment: selectedGarment,
      fabric: selectedFabric,
      initials,
      measurements,
    }),
  })
    .then((response) => response.json())
    .then((data) => {
      console.log("Success:", data);
      hideModal(sizeModal);
    })
    .catch((error) => {
      console.error("Error:", error);
      sizeError.textContent = "An error occurred.";
      sizeError.classList.remove("hidden");
    });
});

addMeasurementButton.addEventListener("click", () => {
  const newInputGroup = document.createElement("div");
  newInputGroup.className = "flex space-x-2 mb-2";
  newInputGroup.innerHTML = `
        <input class="w-1/2 border p-2" placeholder="Measurement Name (e.g., Chest)" required />
        <input class="w-1/2 border p-2" placeholder="Measurement Value (e.g., 37)" required />
        <button type="button" class="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded">Delete0</button>
    `;

  newInputGroup.querySelector("button").addEventListener("click", () => {
    sizeMeasurements.removeChild(newInputGroup);
  });

  sizeMeasurements.appendChild(newInputGroup);
});

sizeMeasurements.addEventListener("click", (event) => {
  if (event.target.textContent === "Delete") {
    sizeMeasurements.removeChild(event.target.parentElement);
  }
});

// Overlay Element
const modalOverlay = document.getElementById("modalOverlay");

// Helper function to show modal and overlay
function showModal(modal) {
  modal.classList.remove("hidden");
  modalOverlay.classList.remove("hidden");
}

// Helper function to hide modal and overlay
function hideModal(modal) {
  modal.classList.add("hidden");
  modalOverlay.classList.add("hidden");
}
