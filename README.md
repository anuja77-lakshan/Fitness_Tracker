# FitCore - Interactive Fitness Tracker Web Application

![FitCore Logo](Images/logo1.png)

A modern, fully responsive web application designed for athletes and fitness enthusiasts to log daily activities, track workout progress, monitor BMI and calorie targets and manage water intake seamlessly.

---

## Project Details
* **Course**: ICT 1209 – Web Technologies
* **Batch**: 2023/24 Batch (First Year, Bachelor of ICT)
* **Department**: Department of ICT, Rajarata University of Sri Lanka
* **Group Number**: Group 27
* **Project Theme**: Fitness Tracker - Activity logging,interactive charts,goal tracking

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

## Implemented Features

### 1. User Authentication & Session Management (`auth/`)
* **Secure Registration (`register.php`)**: Validates unique credentials and securely hashes passwords using `password_hash()` with `PASSWORD_BCRYPT`.
* **Login & Session Handling (`login.php`)**: Authenticates users with prepared statements, calls `session_regenerate_id()` on login and tracks active sessions.
* **Logout (`logout.php`)**: Cleanses and completely destroys active sessions.
* **Route Protection**: Session-based middleware checks via `includes/functions.php` preventing unauthenticated URL direct access to the dashboard.

### 2. Interactive Digital Dashboard (`dashboard.php`)
* **Real-time BMI Speedometer & Gauge**: Dynamically calculates BMI based on user height and weight with immediate visual feedback and MySQL database persistence.
* **Interactive Water Intake Tracker**: Allows logging daily glasses consumed with animated fill levels and database synchronization.
* **Workout & Activity Logging**: Logs workout activities,skill levels,durations and estimates calories burned,storing history dynamically into MySQL database tables.
* **Dynamic Charting & Analytics**: Dashboard charts populated in real time via asynchronous backend APIs (`auth/get_dashboard_data.php`).

### 3. Contact & Feedback System (`contact.php`)
* Integrated client-side form validation paired with server-side processing.
* Stores inquiries and inquiries directly into the database `contact_messages` table using secure prepared statements.

### 4. Responsive UI & Client-Side Interactivity
* **Mobile-First Layout**: Fully responsive interface using Bootstrap 5 and custom CSS media queries across desktop, tablet, and mobile viewports
* **Image Slider**: Custom automatic and manual image slider in the hero section (`Index.php`)
* **Input Validation**: Dual-layer validation enforcing sanitization and security before submission.

---

## Required Folder Structure
Organized strictly in compliance with the ICT 1209 project specification:

```text
Fitness_Tracker/
├── css/
│   ├── about.css
│   ├── contact.css
│   ├── dashboard.css
│   ├── home.css
│   └── login.css
├── js/
│   ├── dashboard.js
│   └── home.js
├── Images/
│   ├── hero1.jpg
│   ├── hero2.jpg
│   ├── hero3.jpg
│   ├── logo1.png
│   ├── logo2.png
│   └── logo3.png
├── includes/
│   ├── db.php
│   └── functions.php
├── auth/
│   ├── register.php
│   ├── login.php
│   ├── logout.php
│   ├── check_auth.php
│   ├── get_dashboard_data.php
│   ├── log_activity.php
│   ├── save_body_data.php
│   └── save_water.php
├── database/
│   └── fitcore_db.sql
├── About.php
├── contact.php
├── dashboard.php
├── Index.php
├── login.php
├── database.sql
└── README.md

### Setup & Installation Instructions
Prerequisites
** Any modern web browser (Google Chrome, Microsoft Edge, Firefox).

** Git installed on your system.

Running Locally:
1. Clone the repository:
Bash
git clone cd C:/xampp/htdocs/
git clone [https://github.com/anuja77-lakshan/Fitness_Tracker.git](https://github.com/anuja77-lakshan/Fitness_Tracker.git)

2. Navigate to project folder:

Bash
cd Fitness_Tracker

3. Open in Browser:
Open Index.php directly in your browser or run via local web server (http://localhost/Fitness_Tracker/Index.php).

## Group Members & Individual Contribution (Group 27)

H.M.S. Chethiya (ITT/2024/025) - Rajarata University of Sri Lanka
[Contribution: Frontend UI Design, Content Management, Interactive JavaScript Logic]

U.G.A. Lakshan (ITT/2024/059) - Rajarata University of Sri Lanka
[Contribution: Frontend Layout, Responsive CSS Architecture, Interactive JavaScript Logic]