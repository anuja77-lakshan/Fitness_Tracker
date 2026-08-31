<?php
// Database connect data
$host = "localhost";
$user = "root";
$pass = "";
$db   = "fitcore";

// MySQL connect database
$conn = mysqli_connect($host, $user, $pass, $db);

// Check the connection 
if (!$conn) {
    die(json_encode(["status" => "error", "message" => "Database connection failed!"]));
}
?>