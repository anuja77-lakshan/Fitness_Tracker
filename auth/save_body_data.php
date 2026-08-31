<?php
session_start();
header('Content-Type: application/json');
require_once '../includes/db.php';

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(["status" => "error", "message" => "Please login first"]);
    exit;
}

$userId = (int)$_SESSION['user_id'];
$rawInput = file_get_contents("php://input");
$data = json_decode($rawInput, true);

$height = isset($data['height']) ? floatval($data['height']) : 0;
$weight = isset($data['weight']) ? floatval($data['weight']) : 0;

if ($height > 0 && $weight > 0) {
    $heightM = $height / 100;
    $bmi = round($weight / ($heightM * $heightM), 1);
    $calorieTarget = round($weight * 30);
    $checkStmt = mysqli_prepare($conn, "SELECT id FROM user_body_data WHERE user_id = ?");
    mysqli_stmt_bind_param($checkStmt, "i", $userId);
    mysqli_stmt_execute($checkStmt);
    $exists = mysqli_stmt_get_result($checkStmt)->num_rows > 0;

    if ($exists) {
        $stmt = mysqli_prepare($conn, "UPDATE user_body_data SET height = ?, weight = ?, bmi = ?, calorie_target = ? WHERE user_id = ?");
        mysqli_stmt_bind_param($stmt, "ddidi", $height, $weight, $bmi, $calorieTarget, $userId);
    } else {
        $stmt = mysqli_prepare($conn, "INSERT INTO user_body_data (user_id, height, weight, bmi, calorie_target) VALUES (?, ?, ?, ?, ?)");
        mysqli_stmt_bind_param($stmt, "idddi", $userId, $height, $weight, $bmi, $calorieTarget);
    }

    if (mysqli_stmt_execute($stmt)) {
        echo json_encode(["status" => "success", "message" => "Body data saved successfully!"]);
    } else {
        http_response_code(500);
        echo json_encode(["status" => "error", "message" => "Failed to save data: " . mysqli_error($conn)]);
    }
} else {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Invalid height or weight values!"]);
}
?>