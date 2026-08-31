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
$today = date('Y-m-d');

// User details
$stmt = mysqli_prepare($conn, "SELECT full_name, gender, height, weight FROM users WHERE id = ?");
mysqli_stmt_bind_param($stmt, "i", $userId);
mysqli_stmt_execute($stmt);
$userData = mysqli_fetch_assoc(mysqli_stmt_get_result($stmt));

// Water intake
$stmt = mysqli_prepare($conn, "SELECT glasses FROM water_logs WHERE user_id = ? AND log_date = ?");
mysqli_stmt_bind_param($stmt, "is", $userId, $today);
mysqli_stmt_execute($stmt);
$waterData = mysqli_fetch_assoc(mysqli_stmt_get_result($stmt));

// Activities
$stmt = mysqli_prepare($conn, "SELECT activity, duration, calories FROM activity_logs WHERE user_id = ? AND DATE(created_at) = ? ORDER BY id DESC");
mysqli_stmt_bind_param($stmt, "is", $userId, $today);
mysqli_stmt_execute($stmt);
$actResult = mysqli_stmt_get_result($stmt);
$activities = [];
while ($row = mysqli_fetch_assoc($actResult)) {
    $activities[] = $row;
}

// Chart data
$stmt = mysqli_prepare($conn, "
    SELECT DATE(created_at) as log_date, SUM(calories) as total_cal 
    FROM activity_logs 
    WHERE user_id = ? AND created_at >= DATE_SUB(CURDATE(), INTERVAL 4 DAY)
    GROUP BY DATE(created_at)
");
mysqli_stmt_bind_param($stmt, "i", $userId);
mysqli_stmt_execute($stmt);
$chartResult = mysqli_stmt_get_result($stmt);
$chartDataMap = [];
while ($row = mysqli_fetch_assoc($chartResult)) {
    $chartDataMap[$row['log_date']] = (int)$row['total_cal'];
}

$last5Days = [];
for ($i = 0; $i < 5; $i++) {
    $d = date('Y-m-d', strtotime("-$i days"));
    $last5Days[] = $chartDataMap[$d] ?? 0;
}

echo json_encode([
    "status" => "success",
    "user" => [
        "name" => $userData['full_name'] ?? $_SESSION['user_name'] ?? 'User',
        "gender" => $userData['gender'] ?? 'male',
        "height" => $userData['height'] ?? 178,
        "weight" => $userData['weight'] ?? 74
    ],
    "water_glasses" => $waterData ? (int)$waterData['glasses'] : 0,
    "activities" => $activities,
    "chart_data" => $last5Days
]);
?>