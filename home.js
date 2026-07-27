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