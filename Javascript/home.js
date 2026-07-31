// Image Sliding
const images = [
    "Images/hero1.jpg",
    "Images/hero2.jpg",
    "Images/hero3.jpg"
];

let current = 0;

const slider = document.getElementById("slider");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");
const dots = document.querySelectorAll(".dot");

function updateSlider(index) {
    slider.src = images[index];
    dots.forEach((dot, i) => {
        dot.classList.toggle("active", i === index);
    });
}

// Next Button 
nextBtn.addEventListener("click", () => {
    current = (current + 1) % images.length;
    updateSlider(current);
});

// Previous Button
prevBtn.addEventListener("click", () => {
    current = (current - 1 + images.length) % images.length;
    updateSlider(current);
});

// Auto Slide
setInterval(() => {
    current = (current + 1) % images.length;
    updateSlider(current);
}, 4000);

// Menu 
const links = document.querySelectorAll("nav a");
links.forEach(link => {
    link.addEventListener("click", function() {
        links.forEach(l => l.classList.remove("active"));
        this.classList.add("active");
    });
});


const modal = document.getElementById("loginModal");
const closeModalBtn = document.getElementById("closeModal");
const goToLoginBtn = document.getElementById("goToLogin");

function handleProtectedNavigation(event) {
    event.preventDefault(); // 
    
    const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";

    if (!isLoggedIn) {
        modal.classList.add("active"); // Show warning modal
    } else {
        window.location.href = "Dashboard.html"; 
    }
}


const enterBtn = document.querySelector(".btn-enter");
if (enterBtn) {
    enterBtn.addEventListener("click", handleProtectedNavigation);
}


const dashboardNavLink = document.querySelector('nav ul li a[href="Dashboard.html"]');
if (dashboardNavLink) {
    dashboardNavLink.addEventListener("click", handleProtectedNavigation);
}

const learnMoreLinks = document.querySelectorAll('.learn-more');
learnMoreLinks.forEach(link => {
    link.addEventListener("click", handleProtectedNavigation);
});


if (closeModalBtn) {
    closeModalBtn.addEventListener("click", () => {
        modal.classList.remove("active");
    });
}

if (goToLoginBtn) {
    goToLoginBtn.addEventListener("click", () => {
        window.location.href = "login.html"; // Navigate to login page
    });
}

// 5. Direct Login Button
const headerLoginBtn = document.querySelector('.login');
if (headerLoginBtn) {
    headerLoginBtn.addEventListener("click", () => {
        window.location.href = "login.html";
    });
}