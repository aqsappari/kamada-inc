document.addEventListener("DOMContentLoaded", () => {
  const urlParams = new URLSearchParams(window.location.search);
  const trackingId = urlParams.get("id");
  if (trackingId) {
    fetchOrderDetails(trackingId);
  } else {
    alert("Tracking ID is required.");
  }

  const detailedStepperSelect = document.getElementById(
    "detailed-stepper-select"
  );
  const timelineStepperSelect = document.getElementById(
    "timeline-stepper-select"
  );

  detailedStepperSelect.addEventListener("change", () => {
    updateDetailedStepper(detailedStepperSelect.value);
    updateTimelineStepper(
      parseInt(timelineStepperSelect.value),
      detailedStepperSelect.value
    );
  });

  timelineStepperSelect.addEventListener("change", () => {
    updateTimelineStepper(
      parseInt(timelineStepperSelect.value),
      detailedStepperSelect.value
    );
  });
});

async function fetchOrderDetails(trackingId) {
  try {
    const response = await fetch(`/track-order/data?id=${trackingId}`);
    if (!response.ok) {
      throw new Error("Failed to fetch order details.");
    }
    const orderData = await response.json();
    displayOrderDetails(orderData);
  } catch (error) {
    alert(error.message);
  }
}

function displayOrderDetails(orderData) {
  document.getElementById("tracking-id").textContent = orderData.trackingId;
  document.getElementById("product-name").textContent =
    orderData.productArray.name && orderData.productArray.name.length > 15
      ? orderData.productArray.name.substring(0, 15) + "..."
      : orderData.productArray.name || "N/A";
  document.getElementById("product-id").textContent =
    orderData.productArray.id || "N/A";
  document.getElementById("quantity").textContent =
    orderData.productArray.productOrder || "N/A";
  document.getElementById("price").textContent =
    orderData.totalAmount / orderData.productArray.productOrder + " PHP" || "0";
  document.getElementById("design-notes").textContent =
    orderData.designNotes || "N/A";
  document.getElementById("total-price").textContent =
    orderData.totalAmount || "0";

  // Update the steppers based on orderData.status
  updateSteppersFromStatus(orderData.status);
}

function updateSteppersFromStatus(status) {
  const detailedStepperSelect = document.getElementById(
    "detailed-stepper-select"
  );
  const timelineStepperSelect = document.getElementById(
    "timeline-stepper-select"
  );

  // Map status to timeline stepper value
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
    Shipped: 9, // Corrected: added quotes
    "Out for Delivery": 10,
    Delivered: 11, // Corrected: added quotes
  };

  console.log(status == "Order Received");
  console.log("Order Received");
  console.log(status);
  let statusString = status.trim();
  const timelineValue = statusMap[statusString];

  // Update the timeline stepper
  timelineStepperSelect.value = timelineValue;

  // Determine the detailed stepper based on timeline value
  let detailedValue;
  if (timelineValue <= 3) {
    detailedValue = "1"; // Order Placement & Initial Processing
  } else if (timelineValue <= 7) {
    detailedValue = "2"; // Production & Printing
  } else {
    detailedValue = "3"; // Shipping & Delivery
  }

  // Update the detailed stepper
  detailedStepperSelect.value = detailedValue;

  // Update the UI
  updateDetailedStepper(detailedValue);
  updateTimelineStepper(timelineValue, detailedValue);

  // Update the Pay Now button state
  updatePaymentButtonState(status);
}

function updatePaymentButtonState(status) {
  const paymentButton = document.getElementById("payment-button");

  if (status === "Design Approved") {
    paymentButton.textContent = "Pay Now";
    paymentButton.classList.remove("bg-gray-400");
    paymentButton.classList.add("bg-blue-500", "hover:bg-blue-700");
    paymentButton.disabled = false;
    paymentButton.dataset.state = "enabled";
  } else if (
    status === "Payment Confirmed" ||
    status === "In Production" ||
    status === "Printing Completed" ||
    status === "Finishing/Binding" ||
    status === "Quality Check" ||
    status === "Ready for Pickup/Shipping" ||
    status === "Shipped" ||
    status === "Out for Delivery" ||
    status === "Delivered"
  ) {
    paymentButton.textContent = "PAID";
    paymentButton.classList.remove("bg-blue-500", "hover:bg-blue-700");
    paymentButton.classList.add("bg-green-500");
    paymentButton.disabled = true;
    paymentButton.dataset.state = "paid";
  } else {
    paymentButton.textContent = "Pay Now";
    paymentButton.classList.remove(
      "bg-blue-500",
      "hover:bg-blue-700",
      "bg-green-500"
    );
    paymentButton.classList.add("bg-gray-400");
    paymentButton.disabled = true;
    paymentButton.dataset.state = "disabled";
  }
}

function getMilestones(detailedStep) {
  switch (detailedStep) {
    case "1": // Order Placement & Initial Processing
      return [
        {
          title: "Order Received",
          icon: `<svg class="w-3.5 h-3.5 text-green-500 dark:text-green-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 12"><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M1 5.917 5.724 10.5 15 1.5"/></svg>`,
          color: "green-200",
          description:
            "Your order has been successfully received and is being processed.",
        },
        {
          title: "Design Proofing/Review",
          icon: `<svg class="w-3.5 h-3.5 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 16"><path d="M18 0H2a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2ZM6.5 3a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5ZM3.014 13.021l.157-.625A3.427 3.427 0 0 1 6.5 9.571a3.426 3.426 0 0 1 3.322 2.805l.159.622-6.967.023ZM16 12h-3a1 1 0 0 1 0-2h3a1 1 0 0 1 0 2Zm0-3h-3a1 1 0 1 1 0-2h3a1 1 0 1 1 0 2Zm0-3h-3a1 1 0 1 1 0-2h3a1 1 0 1 1 0 2Z"/></svg>`,
          color: "gray-100",
          description:
            "We are reviewing your design and will send you a proof for approval.",
        },
        {
          title: "Design Approved",
          icon: `<svg class="w-3.5 h-3.5 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 18 20"><path d="M16 1h-3.278A1.992 1.992 0 0 0 11 0H7a1.993 1.993 0 0 0-1.722 1H2a2 2 0 0 0-2 2v15a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V3a2 2 0 0 0-2-2Zm7 9.481a1 1 0 0 1 .439 1.779l-4.162 4a1 1 0 0 1-1.447.025L6 11.856a.996.996 0 0 1 1.332-1.501l2.67 2.574 3.764-3.635a1 1 0 0 1 1.4-.372Z"/></svg>`,
          color: "gray-100",
          description:
            "Your design has been approved and is ready for production.",
        },
        {
          title: "Payment Confirmed",
          icon: `<svg class="w-3.5 h-3.5 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 16"><path d="M18 0H2a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2ZM6.5 3a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5ZM3.014 13.021l.157-.625A3.427 3.427 0 0 1 6.5 9.571a3.426 3.426 0 0 1 3.322 2.805l.159.622-6.967.023ZM16 12h-3a1 1 0 0 1 0-2h3a1 1 0 0 1 0 2Zm0-3h-3a1 1 0 1 1 0-2h3a1 1 0 1 1 0 2Zm0-3h-3a1 1 0 1 1 0-2h3a1 1 0 1 1 0 2Z"/></svg>`,
          color: "gray-100",
          description:
            "Your payment has been confirmed. We are now preparing your order for production.",
        },
      ];
    case "2": // Production & Printing
      return [
        {
          title: "In Production",
          icon: `<svg class="w-3.5 h-3.5 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 18 20"><path d="M16 1h-3.278A1.992 1.992 0 0 0 11 0H7a1.993 1.993 0 0 0-1.722 1H2a2 2 0 0 0-2 2v15a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V3a2 2 0 0 0-2-2Zm7 9.481a1 1 0 0 1 .439 1.779l-4.162 4a1 1 0 0 1-1.447.025L6 11.856a.996.996 0 0 1 1.332-1.501l2.67 2.574 3.764-3.635a1 1 0 0 1 1.4-.372Z"/></svg>`,
          color: "gray-100",
          description: "Your order is now in the production phase.",
        },
        {
          title: "Printing Completed",
          icon: `<svg class="w-3.5 h-3.5 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 18 20"><path d="M16 1h-3.278A1.992 1.992 0 0 0 11 0H7a1.993 1.993 0 0 0-1.722 1H2a2 2 0 0 0-2 2v15a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V3a2 2 0 0 0-2-2Zm7 9.481a1 1 0 0 1 .439 1.779l-4.162 4a1 1 0 0 1-1.447.025L6 11.856a.996.996 0 0 1 1.332-1.501l2.67 2.574 3.764-3.635a1 1 0 0 1 1.4-.372Z"/></svg>`,
          color: "gray-100",
          description:
            "Printing is complete. Your order is moving to the next stage.",
        },
        {
          title: "Finishing/Binding",
          icon: `<svg class="w-3.5 h-3.5 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 18 20"><path d="M16 1h-3.278A1.992 1.992 0 0 0 11 0H7a1.993 1.993 0 0 0-1.722 1H2a2 2 0 0 0-2 2v15a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V3a2 2 0 0 0-2-2Zm7 9.481a1 1 0 0 1 .439 1.779l-4.162 4a1 1 0 0 1-1.447.025L6 11.856a.996.996 0 0 1 1.332-1.501l2.67 2.574 3.764-3.635a1 1 0 0 1 1.4-.372Z"/></svg>`,
          color: "gray-100",
          description: "Your order is being finished and bound.",
        },
        {
          title: "Quality Check",
          icon: `<svg class="w-3.5 h-3.5 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 18 20"><path d="M16 1h-3.278A1.992 1.992 0 0 0 11 0H7a1.993 1.993 0 0 0-1.722 1H2a2 2 0 0 0-2 2v15a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V3a2 2 0 0 0-2-2Zm7 9.481a1 1 0 0 1 .439 1.779l-4.162 4a1 1 0 0 1-1.447.025L6 11.856a.996.996 0 0 1 1.332-1.501l2.67 2.574 3.764-3.635a1 1 0 0 1 1.4-.372Z"/></svg>`,
          color: "gray-100",
          description: "Your order is undergoing a final quality check.",
        },
      ];
    case "3": // Shipping & Delivery
      return [
        {
          title: "Ready for Pickup/Shipping",
          icon: `<svg class="w-3.5 h-3.5 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 16"><path d="M18 0H2a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2ZM6.5 3a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5ZM3.014 13.021l.157-.625A3.427 3.427 0 0 1 6.5 9.571a3.426 3.426 0 0 1 3.322 2.805l.159.622-6.967.023ZM16 12h-3a1 1 0 0 1 0-2h3a1 1 0 0 1 0 2Zm0-3h-3a1 1 0 1 1 0-2h3a1 1 0 1 1 0 2Zm0-3h-3a1 1 0 1 1 0-2h3a1 1 0 1 1 0 2Z"/></svg>`,
          color: "gray-100",
          description: "Your order is ready for pickup or shipping.",
        },
        {
          title: "Shipped",
          icon: `<svg class="w-3.5 h-3.5 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 18 20"><path d="M16 1h-3.278A1.992 1.992 0 0 0 11 0H7a1.993 1.993 0 0 0-1.722 1H2a2 2 0 0 0-2 2v15a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V3a2 2 0 0 0-2-2Zm7 9.481a1 1 0 0 1 .439 1.779l-4.162 4a1 1 0 0 1-1.447.025L6 11.856a.996.996 0 0 1 1.332-1.501l2.67 2.574 3.764-3.635a1 1 0 0 1 1.4-.372Z"/></svg>`,
          color: "gray-100",
          description: "Your order has been shipped.",
        },
        {
          title: "Out for Delivery",
          icon: `<svg class="w-3.5 h-3.5 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 18 20"><path d="M16 1h-3.278A1.992 1.992 0 0 0 11 0H7a1.993 1.993 0 0 0-1.722 1H2a2 2.0 0 0 0-2 2v15a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V3a2 2 0 0 0-2-2Zm7 9.481a1 1 0 0 1 .439 1.779l-4.162 4a1 1 0 0 1-1.447.025L6 11.856a.996.996 0 0 1 1.332-1.501l2.67 2.574 3.764-3.635a1 1 0 0 1 1.4-.372Z"/></svg>`,
          color: "gray-100",
          description: "Your order is out for delivery.",
        },
        {
          title: "Delivered",
          icon: `<svg class="w-3.5 h-3.5 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 18 20"><path d="M16 1h-3.278A1.992 1.992 0 0 0 11 0H7a1.993 1.993 0 0 0-1.722 1H2a2 2 0 0 0-2 2v15a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V3a2 2 0 0 0-2-2Zm7 9.481a1 1 0 0 1 .439 1.779l-4.162 4a1 1 0 0 1-1.447.025L6 11.856a.996.996 0 0 1 1.332-1.501l2.67 2.574 3.764-3.635a1 1 0 0 1 1.4-.372Z"/></svg>`,
          color: "gray-100",
          description: "Your order has been successfully delivered.",
        },
      ];
    default:
      return [];
  }
}

function updateDetailedStepper(step) {
  document
    .getElementById("step-1")
    .classList.remove("text-blue-600", "dark:text-blue-500");
  document
    .getElementById("step-2")
    .classList.remove("text-blue-600", "dark:text-blue-500");
  document
    .getElementById("step-3")
    .classList.remove("text-blue-600", "dark:text-blue-500");
  document
    .getElementById(`step-${step}`)
    .classList.add("text-blue-600", "dark:text-blue-500");
}

function updateTimelineStepper(step, detailedStep) {
  const desktopTimeline = document.getElementById("timeline-desktop");
  const mobileTimeline = document.getElementById("timeline-mobile");

  const milestones = getMilestones(detailedStep);

  desktopTimeline.innerHTML = "";
  mobileTimeline.innerHTML = "";

  milestones.forEach((milestone, index) => {
    const item = `<li class="mb-10 ms-6"><span class="absolute flex items-center justify-center w-8 h-8 ${milestone.color} rounded-full -start-4 ring-4 ring-white dark:ring-gray-900 dark:bg-gray-700">${milestone.icon}</span><h3 class="font-medium leading-tight">${milestone.title}</h3><p class="text-sm">${milestone.description}</p></li>`;
    desktopTimeline.innerHTML += item;
    mobileTimeline.innerHTML += item;
  });

  const listItemsDesktop = desktopTimeline.querySelectorAll("li");
  const listItemsMobile = mobileTimeline.querySelectorAll("li");

  listItemsDesktop.forEach((item, index) => {
    const span = item.querySelector("span");
    if (index <= step) {
      span.classList.remove("bg-gray-100", "dark:bg-gray-700");
      span.classList.add("bg-green-200", "dark:bg-green-900");
    } else {
      span.classList.remove("bg-green-200", "dark:bg-green-900");
      span.classList.add("bg-gray-100", "dark:bg-gray-700");
    }
  });

  listItemsMobile.forEach((item, index) => {
    const span = item.querySelector("span");
    if (index <= step) {
      span.classList.remove("bg-gray-100", "dark:bg-gray-700");
      span.classList.add("bg-green-200", "dark:bg-green-900");
    } else {
      span.classList.remove("bg-green-200", "dark:bg-green-900");
      span.classList.add("bg-gray-100", "dark:bg-gray-700");
    }
  });
}
