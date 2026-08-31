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

// 1. User & Body Data
$stmt = mysqli_prepare($conn, "
    SELECT u.full_name, b.height, b.weight, b.calorie_target 
    FROM users u 
    LEFT JOIN user_body_data b ON u.id = b.user_id 
    WHERE u.id = ?
");
mysqli_stmt_bind_param($stmt, "i", $userId);
mysqli_stmt_execute($stmt);
$userData = mysqli_fetch_assoc(mysqli_stmt_get_result($stmt));

// 2. Water Intake Today
$stmt = mysqli_prepare($conn, "SELECT glasses FROM water_intake WHERE user_id = ? AND log_date = ?");
mysqli_stmt_bind_param($stmt, "is", $userId, $today);
mysqli_stmt_execute($stmt);
$waterData = mysqli_fetch_assoc(mysqli_stmt_get_result($stmt));

// 3. Today's Workouts List
$stmt = mysqli_prepare($conn, "
    SELECT activity, duration_mins as duration, calories_burned as calories 
    FROM workout_logs 
    WHERE user_id = ? AND DATE(log_date) = ? 
    ORDER BY id DESC
");
mysqli_stmt_bind_param($stmt, "is", $userId, $today);
mysqli_stmt_execute($stmt);
$actResult = mysqli_stmt_get_result($stmt);
$activities = [];
while ($row = mysqli_fetch_assoc($actResult)) {
    $activities[] = $row;
}

// 4. Chart Data (Last 5 Days Calories)
$stmt = mysqli_prepare($conn, "
    SELECT DATE(log_date) as day_date, SUM(calories_burned) as total_cal 
    FROM workout_logs 
    WHERE user_id = ? AND log_date >= DATE_SUB(CURDATE(), INTERVAL 4 DAY)
    GROUP BY DATE(log_date)
");
mysqli_stmt_bind_param($stmt, "i", $userId);
mysqli_stmt_execute($stmt);
$chartResult = mysqli_stmt_get_result($stmt);
$chartDataMap = [];
while ($row = mysqli_fetch_assoc($chartResult)) {
    $chartDataMap[$row['day_date']] = (int)$row['total_cal'];
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
        "gender" => 'male',
        "height" => $userData['height'] ?? 178,
        "weight" => $userData['weight'] ?? 74
    ],
    "water_glasses" => $waterData ? (int)$waterData['glasses'] : 0,
    "activities" => $activities,
    "chart_data" => $last5Days
]);
?>