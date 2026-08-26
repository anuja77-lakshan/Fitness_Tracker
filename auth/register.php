<?php
require_once '../includes/db.php';
header('Content-Type: application/json');

//Get a data from form
$fullName = trim($_POST['full_name'] ?? '');
$username = trim($_POST['username'] ?? '');
$email    = trim($_POST['email'] ?? '');
$password = trim($_POST['password'] ?? '');

//Check the empty fields
if (empty($fullName) || empty($username) || empty($email) || empty($password)) {
    echo json_encode(["status" => "error", "message" => "All fields are required!"]);
    exit;
}

//Check the already given emails or usernames
$checkQuery = "SELECT id FROM users WHERE username = '$username' OR email = '$email'";
$checkResult = mysqli_query($conn, $checkQuery);

if (mysqli_num_rows($checkResult) > 0) {
    echo json_encode(["status" => "error", "message" => "Username or Email already exists!"]);
    exit;
}

//Hash the password securly
$hashedPassword = password_hash($password, PASSWORD_DEFAULT);

//Insert user into database
$insertQuery = "INSERT INTO users (full_name, username, email, password) 
                VALUES ('$fullName', '$username', '$email', '$hashedPassword')";

if (mysqli_query($conn, $insertQuery)) {
    echo json_encode(["status" => "success", "message" => "Account created successfully!"]);
} else {
    echo json_encode(["status" => "error", "message" => "Registration failed!"]);
}
?>