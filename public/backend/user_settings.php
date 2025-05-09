<?php
session_start();

if ($_SERVER['HTTP_HOST'] === 'localhost:8001') { // Only enable CORS in development
    header("Access-Control-Allow-Origin: *");
} else {
    if (isset($_SERVER['HTTP_ORIGIN'])) {
        header("Access-Control-Allow-Origin: {$_SERVER['HTTP_ORIGIN']}");;
    }
}
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");
$db = new PDO("sqlite:redact.db");
$db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        getUserSettings();
        break;
    case 'POST':
        updateUserSettings();
        break;
    default:
        echo json_encode(["error" => "Invalid request"]);
        break;
}

// 📌 Function to fetch user settings
function getUserSettings() {
    global $db;

    $stmt = $db->query("SELECT user_settings_json FROM user_settings WHERE id = 1");
    $settings = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($settings && $settings['user_settings_json']) {
        echo $settings['user_settings_json']; 
    } else {
        echo json_encode(["error" => "Settings not found"]);
    }
}

// 📌 Function to update or create user settings
function updateUserSettings() {
    if (!isset($_SESSION['user'])) {
        http_response_code(401);
        echo json_encode(["error" => "Unauthorized"]);
        exit();
    }

    global $db;
    $data = json_decode(file_get_contents("php://input"), true);

    if (is_array($data)) {
        $userSettingsJson = json_encode($data);

        // Update or insert the settings
        $stmt = $db->prepare("INSERT INTO user_settings (id, user_settings_json) 
                              VALUES (1, ?) 
                              ON CONFLICT(id) DO UPDATE SET user_settings_json = excluded.user_settings_json");
        $stmt->execute([$userSettingsJson]);

        echo json_encode(["success" => true]);
    } else {
        echo json_encode(["error" => "Invalid input"]);
    }
}
?>