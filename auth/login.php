<?php
session_start();
require_once '../includes/db.php';
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $username = trim($_POST['username'] ?? '');
    $password = trim($_POST['password'] ?? '');

    //Check the empty fields
    if (empty($username) || empty($password)) {
        echo json_encode(["status" => "error", "message" => "Please enter username and password!"]);
        exit;
    }

    //check the user names include in database or not
    $query = "SELECT id, full_name, password FROM users WHERE username = '$username'";
    $result = mysqli_query($conn, $query);

    if (mysqli_num_rows($result) === 1) {
        $user = mysqli_fetch_assoc($result);

        //If the match Encrypt password or not
        if (password_verify($password, $user['password'])) {
            $_SESSION['user_id'] = $user['id'];
            $_SESSION['user_name'] = $user['full_name'];

            echo json_encode([
                "status" => "success", 
                "userName" => $user['full_name'],
                "message" => "Login successful!"
            ]);
            exit;
        }
    }

    echo json_encode(["status" => "error", "message" => "Invalid username or password!"]);
}
?>