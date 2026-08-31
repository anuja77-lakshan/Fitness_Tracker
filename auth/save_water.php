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
$glasses = (int)($data['glasses'] ?? 0);
$today = date('Y-m-d');

$stmt = mysqli_prepare($conn, "INSERT INTO water_logs (user_id, glasses, log_date) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE glasses = VALUES(glasses)");
mysqli_stmt_bind_param($stmt, "iis", $userId, $glasses, $today);
mysqli_stmt_execute($stmt);

echo json_encode(["status" => "success"]);
?>