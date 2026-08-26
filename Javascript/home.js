//Image Sliding
const slides = [
    { src: "Images/hero1.jpg", label: "ENDURANCE GOALS" },
    { src: "Images/hero2.jpg", label: "STRENGTH TRAINING" },
    { src: "Images/hero3.jpg", label: "CARDIO TRACKING" }
];

let currentIndex = 0;
const sliderImage = document.getElementById("slider");
const previousButton = document.getElementById("prevBtn");
const nextButton = document.getElementById("nextBtn");
const sliderDots = document.querySelectorAll(".dot");
const imageLabel = document.getElementById("imageLabel");

function updateSlider(index) {
    if (sliderImage) sliderImage.src = slides[index].src;
    if (imageLabel) imageLabel.textContent = slides[index].label;
    sliderDots.forEach((dot, i) => {
        dot.classList.toggle("active", i === index);
    });
}

if (nextButton) {
    nextButton.addEventListener("click", () => {
        currentIndex = (currentIndex + 1) % slides.length;
        updateSlider(currentIndex);
    });
}

if (previousButton) {
    previousButton.addEventListener("click", () => {
        currentIndex = (currentIndex - 1 + slides.length) % slides.length;
        updateSlider(currentIndex);
    });
}

setInterval(() => {
    currentIndex = (currentIndex + 1) % slides.length;
    updateSlider(currentIndex);
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
const closeModalButton = document.getElementById("closeModal");
const goToLoginButton = document.getElementById("goToLogin");

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
        window.location.href = "Login.html"; // Navigate to login page
    });
}

//Direct Login Button
const headerLoginBtn = document.querySelector('.login');
if (headerLoginBtn) {
    headerLoginBtn.addEventListener("click", () => {
        window.location.href = "Login.html";
    });
}