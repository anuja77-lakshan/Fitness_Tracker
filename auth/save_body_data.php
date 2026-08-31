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
$height = floatval($data['height'] ?? 0);
$weight = floatval($data['weight'] ?? 0);
$gender = in_array($data['gender'] ?? '', ['male', 'female']) ? $data['gender'] : 'male';

if ($height > 0 && $weight > 0) {
    $stmt = mysqli_prepare($conn, "UPDATE users SET height = ?, weight = ?, gender = ? WHERE id = ?");
    mysqli_stmt_bind_param($stmt, "ddsi", $height, $weight, $gender, $userId);
    mysqli_stmt_execute($stmt);
    echo json_encode(["status" => "success"]);
} else {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Invalid inputs"]);
}
?>