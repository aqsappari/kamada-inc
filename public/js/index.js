sessionStorage.clear();

// create unique id functionality
function uniqid(prefix = "", random = false) {
  const sec = Date.now() * 1000 + Math.random() * 1000;
  const id = sec.toString(16).replace(/\./g, "").padEnd(14, "0");
  return `${prefix}${id}${
    random ? `.${Math.trunc(Math.random() * 100000000)}` : ""
  }`;
}
sessionStorage.setItem("guestId", uniqid("guest_", true));

const navLinks = document.querySelectorAll(".nav-link");
const sections = document.querySelectorAll("section");

function updateActiveNavLink() {
  let currentSectionId = "";
  sections.forEach((section) => {
    const sectionTop = section.offsetTop;
    const sectionHeight = section.clientHeight;
    if (
      window.scrollY >= sectionTop - 100 &&
      window.scrollY < sectionTop + sectionHeight - 100
    ) {
      currentSectionId = section.getAttribute("id");
    }
  });

  navLinks.forEach((link) => {
    link.classList.remove("active");
    if (link.getAttribute("href").slice(1) === currentSectionId) {
      link.classList.add("active");
    }
  });
}

window.addEventListener("scroll", () => {
  updateActiveNavLink();
  const navbar = document.getElementById("navbar");
  const logo = document.querySelector(".italic-bold-logo");
  if (window.scrollY > 100) {
    navbar.classList.add("navbar-scrolled");
    logo.classList.remove("text-white");
    logo.classList.add("text-black");
  } else {
    navbar.classList.remove("navbar-scrolled");
    logo.classList.remove("text-black");
    logo.classList.add("text-white");
  }
});

document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", function (e) {
    e.preventDefault();

    document.querySelector(this.getAttribute("href")).scrollIntoView({
      behavior: "smooth",
    });
  });
});

const trackingIdInput = document.getElementById("trackingIdInput");
const trackOrderButton = document.getElementById("trackOrderButton");

trackOrderButton.addEventListener("click", () => {
  const trackingId = trackingIdInput.value.trim();
  if (trackingId) {
    window.location.href = `/track-order?id=${trackingId}`;
  } else {
    alert("Please enter your tracking ID.");
  }
});

// Mobile menu functionality
const mobileMenuButton = document.getElementById("mobile-menu-button");
const mobileMenu = document.getElementById("mobile-menu");

if (mobileMenuButton && mobileMenu) {
  mobileMenuButton.addEventListener("click", () => {
    mobileMenu.classList.toggle("hidden");
  });
}

// Close mobile menu when a link is clicked
if (mobileMenu) {
  const mobileLinks = mobileMenu.querySelectorAll("a");
  mobileLinks.forEach((link) => {
    link.addEventListener("click", () => {
      mobileMenu.classList.add("hidden");
    });
  });
}
