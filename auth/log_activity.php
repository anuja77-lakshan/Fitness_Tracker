<?php
session_start();
header('Content-Type: application/json');
require_once '../includes/db.php';

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    exit;
}

$userId = (int)$_SESSION['user_id'];
$data = json_decode(file_get_contents("php://input"), true);
$activity = trim($data['activity'] ?? '');
$duration = (int)($data['duration'] ?? 0);
$calories = (int)($data['calories'] ?? 0);

if (!empty($activity) && $duration > 0) {
    $stmt = mysqli_prepare($conn, "INSERT INTO activity_logs (user_id, activity, duration, calories) VALUES (?, ?, ?, ?)");
    mysqli_stmt_bind_param($stmt, "isii", $userId, $activity, $duration, $calories);
    mysqli_stmt_execute($stmt);
    echo json_encode(["status" => "success"]);
} else {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Invalid log data"]);
}
?>