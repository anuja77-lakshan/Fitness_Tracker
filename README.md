# FitCore - Interactive Fitness Tracker Web Application

![FitCore Logo](Images/logo1.png)

A modern, fully responsive web application designed for athletes and fitness enthusiasts to log daily activities, track workout progress, monitor BMI and calorie targets and manage water intake seamlessly.

---

## Project Details
* **Course**: ICT 1209 – Web Technologies
* **Batch**: 2023/24 Batch (First Year, Bachelor of ICT)
* **Department**: Department of ICT, Rajarata University of Sri Lanka
* **Group Number**: Group 27
* **Project Theme**: Fitness and Wellness-Activity logging,interactive charts,goal tracking

---

## Required Technology Stack
As specified in the course guidelines:
* **UI Design**: Figma
* **Frontend Structure**: HTML5, CSS3, Bootstrap 5
* **Client-side Logic**: JavaScript(Vanilla JS)
* **Backend**: PHP 8  
* **Database**: MySQL via XAMPP or WAMP 
* **Version Control**: Git & GitHub

---

## Implemented Features (Phase 2)

### 1.Interactive Digital Dashboard (`Dashboard.html`)
* **Real-time BMI Speedometer & Gauge**: Calculates BMI dynamically based on user height and weight input with visual active speedometer feedback.
* **Interactive Water Intake Tracker**: Allows users to increment or decrement water intake glasses with live visual fill-bar feedback and localStorage persistence.
* **Dynamic Activity & Calorie Log**: Custom table logging workout activities, durations and calories burned.
* **Weekly Workout & Meal Plan**: Structured daily workout matrix and Sri Lankan weekly nutrition meal plan tables.

### 2.Frontend and Responsive Layouts
* **Custom Responsive CSS**: Unified responsive layouts that cleanly adapt across Mobile, Tablet and Desktop viewports using media queries.
* **Navigation**: Uniform header with brand logo and navigation links (`Home`, `Dashboard`, `About Us`, `Contact Us`) present on all pages.
* **Bootstrap 5 Integration**: Utilized Bootstrap 5 for authentication tab toggling and forms (`Login.html`).

### 3.JavaScript Interactivity
* **Interactive Image Slider**: Hero section slider with manual previous/next controls, dot indicators and automatic timed sliding (`Home.html`).
* **Protected Navigation Modal**: JavaScript popup modal that prompts authentication warning before accessing protected routes (`Dashboard.html`).
* **Realtime Input Validation and Feedback**:Instant calculations for BMI metrics and dynamic UI state updates.
* **Local Storage Persistence**:Stores user body measurements and daily water tracking counts across browser sessions.

---

## Required Folder Structure
Folder layout:

```text
Fitness_Tracker/
├── css/
│   ├── about.css
│   ├── contact.css
│   ├── dashboard.css
│   ├── home.css
│   └── login.css
├── javascript/
│   ├── dashboard.js
│   └── home.js
├── Images/
│   ├── hero1.jpg
│   ├── hero2.jpg
│   ├── hero3.jpg
│   ├── logo1.png
│   ├── logo2.png
│   └── logo3.png
├── About.html
├── Contact.html
├── Dashboard.html
├── Home.html
├── Login.html
└── README.md

### Setup & Installation Instructions
Prerequisites
** Any modern web browser (Google Chrome, Microsoft Edge, Firefox).

** Git installed on your system.

Running Locally:
1. Clone the repository:
Bash
git clone [https://github.com/anuja77-lakshan/Fitness_Tracker.git](https://github.com/anuja77-lakshan/Fitness_Tracker.git)

2. Navigate to project folder:

Bash
cd Fitness_Tracker

3. Open in Browser:
Open Home.html directly in your browser or run via local web server (e.g. Live Server in VS Code or XAMPP htdocs).

## Group Members & Individual Contribution (Group 27)

H.M.S. Chethiya (ITT/2024/025) - Rajarata University of Sri Lanka
[Contribution: Frontend UI Design, Content Management, Interactive JavaScript Logic]

U.G.A. Lakshan (ITT/2024/059) - Rajarata University of Sri Lanka
[Contribution: Frontend Layout, Responsive CSS Architecture, Interactive JavaScript Logic]