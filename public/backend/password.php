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
header("Access-Control-Allow-Methods: POST, OPTIONS, DELETE, PUT, GET");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");
$db = new PDO("sqlite:redact.db");
$db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

$method = $_SERVER['REQUEST_METHOD'];

// Handle preflight (OPTIONS) requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

switch ($method) {
    case 'POST':
        requestPasswordReset();
        break;
    case 'PUT':
        resetPassword();
        break;
    default:
        http_response_code(405);
        echo json_encode(["error" => "Method not allowed"]);
}

// --- Functions ---

function requestPasswordReset() {
    global $db;

    $data = json_decode(file_get_contents("php://input"), true);
    $email = trim($data['email'] ?? '');

    if (!$email) {
        http_response_code(400);
        echo json_encode(["error" => "Email is required"]);
        return;
    }

    $stmt = $db->prepare("SELECT * FROM user WHERE email = ?");
    $stmt->execute([$email]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$user) {
        http_response_code(200); // ✅ Don't reveal if email exists
        echo json_encode(["message" => "If a user with that email exists, a reset link will be sent."]);
        return;
    }

    $token = bin2hex(random_bytes(32));
    $expires = time() + 60 * 30; // 30 minutes

    $stmt = $db->prepare("UPDATE user SET reset_token = ?, reset_expires = ? WHERE email = ?");
    $stmt->execute([$token, $expires, $email]);

    // SEND EMAIL (example output, you should use real email function like PHPMailer)
    $resetUrl = $_SERVER['HTTP_ORIGIN'] + "/reset-password?token=$token";

    // In production use mail() or a mail service
    file_put_contents("mail_log.txt", "Password reset for $email:\n$resetUrl\n");

    echo json_encode(["message" => "If a user with that email exists, a reset link has been sent."]);
}

function resetPassword() {
    global $db;

    $data = json_decode(file_get_contents("php://input"), true);
    $token = trim($data['token'] ?? '');
    $newPassword = trim($data['password'] ?? '');

    if (!$token || !$newPassword) {
        http_response_code(400);
        echo json_encode(["error" => "Missing token or password"]);
        return;
    }

    $stmt = $db->prepare("SELECT * FROM user WHERE reset_token = ?");
    $stmt->execute([$token]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$user || time() > (int)$user['reset_expires']) {
        http_response_code(401);
        echo json_encode(["error" => "Invalid or expired token"]);
        return;
    }

    $hashed = password_hash($newPassword, PASSWORD_DEFAULT);
    $stmt = $db->prepare("UPDATE user SET password = ?, reset_token = NULL, reset_expires = NULL WHERE id = ?");
    $stmt->execute([$hashed, $user['id']]);

    echo json_encode(["success" => true, "message" => "Password updated successfully"]);
}

?>
