<?php
session_start();
header('Content-Type: application/json');
require_once '../includes/db.php';

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(["status" => "error", "message" => "Unauthorized"]);
    exit;
}

$userId = (int)$_SESSION['user_id'];
$rawInput = file_get_contents("php://input");
$data = json_decode($rawInput, true);

$activity = trim($data['activity'] ?? '');
$duration = (int)($data['duration'] ?? 0);
$calories = (int)($data['calories'] ?? 0);
$skill = 'Beginner';

if (!empty($activity) && $duration > 0) {
    $stmt = mysqli_prepare($conn, "INSERT INTO workout_logs (user_id, activity, skill_level, duration_mins, calories_burned) VALUES (?, ?, ?, ?, ?)");
    mysqli_stmt_bind_param($stmt, "issii", $userId, $activity, $skill, $duration, $calories);
    
    if (mysqli_stmt_execute($stmt)) {
        echo json_encode(["status" => "success"]);
    } else {
        http_response_code(500);
        echo json_encode(["status" => "error", "message" => mysqli_error($conn)]);
    }
} else {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Invalid log data"]);
}
?>