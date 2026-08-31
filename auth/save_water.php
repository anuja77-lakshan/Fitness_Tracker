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

$glasses = isset($data['glasses']) ? (int)$data['glasses'] : 0;
$today = date('Y-m-d');

$stmt = mysqli_prepare($conn, "INSERT INTO water_intake (user_id, log_date, glasses) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE glasses = VALUES(glasses)");
mysqli_stmt_bind_param($stmt, "isi", $userId, $today, $glasses);

if (mysqli_stmt_execute($stmt)) {
    echo json_encode(["status" => "success"]);
} else {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => mysqli_error($conn)]);
}
?>