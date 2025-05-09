<?php
ini_set('display_errors', 1);
error_reporting(E_ALL);
session_start();

if ($_SERVER['HTTP_HOST'] === 'localhost:8001') {
    header("Access-Control-Allow-Origin: http://localhost:4200");
} else {
    if (isset($_SERVER['HTTP_ORIGIN'])) {
        header("Access-Control-Allow-Origin: {$_SERVER['HTTP_ORIGIN']}");
    }
}
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: POST, OPTIONS, GET, DELETE");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

// Handle preflight (OPTIONS) requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

$db = new PDO("sqlite:redact.db");
$db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

$method = $_SERVER['REQUEST_METHOD'];

switch ($_SERVER['REQUEST_METHOD']) {
    case 'GET':
        checkStatus();
        break;
    case 'POST':
        loginOrCreateUser();
        break;
    case 'DELETE':
        logout();
        break;
    default:
        http_response_code(405);
        echo json_encode(["error" => "Method not allowed"]);
}

// === Functions ===

function checkStatus() {
    global $db;
    $stmt = $db->query("SELECT COUNT(*) as count FROM user");
    $count = $stmt->fetch(PDO::FETCH_ASSOC)['count'];

    if (isset($_SESSION['user'])) {
        echo json_encode(["authenticated" => true, "user" => $_SESSION['user']]);
        return;
    }

    echo json_encode(["authenticated" => false, "userExists" => $count > 0]);
}

function loginOrCreateUser() {
    global $db;
    $data = json_decode(file_get_contents("php://input"), true);
    $username = trim($data['username'] ?? '');
    $password = trim($data['password'] ?? '');

    if (!$username || !$password) {
        http_response_code(400);
        echo json_encode(["error" => "Missing username or password"]);
        return;
    }

    $stmt = $db->query("SELECT COUNT(*) as count FROM user");
    $count = $stmt->fetch(PDO::FETCH_ASSOC)['count'];

    if ($count === 0) {
        // First user registration
        $hashed = password_hash($password, PASSWORD_DEFAULT);
        $stmt = $db->prepare("INSERT INTO user (user, password) VALUES (?, ?)");
        $stmt->execute([$username, $hashed]);
        $_SESSION['user'] = $username;
        http_response_code(201);
        echo json_encode(["success" => true, "created" => true]);
        return;
    }

    // Login
    $stmt = $db->prepare("SELECT * FROM user WHERE user = ?");
    $stmt->execute([$username]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$user || !password_verify($password, $user['password'])) {
        http_response_code(401);
        echo json_encode(["error" => "Invalid credentials"]);
        return;
    }

    $_SESSION['user'] = $username;
    http_response_code(200);
    echo json_encode(["success" => true]);
}

function logout() {
    session_destroy();
    http_response_code(200);
    echo json_encode(["success" => true]);
}

?>