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
    case 'GET':
        getPosts();
        break;
    case 'POST':
        createPost();
        break;
    case 'DELETE':
        deletePost();
        break;
    default:
        echo json_encode(["error" => "Invalid request"]);
        break;
}

// 📌 Function to fetch all posts or a single post by ID
function getPosts() {
    global $db;

    $id = $_GET['id'] ?? null;
    $categoryID = $_GET['categoryID'] ?? null;

    if ($id) {
        // Fetch a single post
        $stmt = $db->prepare("SELECT * FROM posts WHERE id = ?");
        $stmt->execute([$id]);
        $post = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($post) {
            echo json_encode($post);
        } else {
            echo json_encode(["error" => "Post not found"]);
        }
    } else if($categoryID) {
        // Fetch posts by category ID
        $stmt = $db->prepare("SELECT * FROM posts WHERE categoryID = ? ORDER BY created_at DESC");
        $stmt->execute([$categoryID]);
        echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
    } else
    {
        // Fetch all posts
        $stmt = $db->query("SELECT * FROM posts ORDER BY created_at DESC");
        echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
    }
}

// 📌 Function to create/update a post
function createPost() {
    if (session_status() !== PHP_SESSION_ACTIVE) {
        session_start();
    }

    if (!isset($_SESSION['user'])) {
        http_response_code(401);
        echo json_encode(["error" => "Unauthorized"]);
        exit();
    }

    global $db;

    $data = json_decode(file_get_contents("php://input"), true);
    if (!isset($data["title"], $data["content"])) {
        echo json_encode(["error" => "Missing title, or content"]);
        return;
    }

    // Log the received data to the console (for debugging purposes)
    error_log("Received data: " . json_encode($data));

    $id = $data["id"] ?? uniqid(); // Use provided ID or generate a new one
    $title = $data["title"];
    $content = $data["content"];
    $tags = isset($data["tags"]) ? implode(",", $data["tags"]) : "";
    $categoryID = isset($data["categoryID"]) ? $data["categoryID"] : null;

    // Insert or update the post
    $stmt = $db->prepare("
        INSERT INTO posts (id, title, content, tags, categoryID) 
        VALUES (?, ?, ?, ?, ?)
        ON CONFLICT(id) DO UPDATE SET 
            title = excluded.title,
            content = excluded.content,
            tags = excluded.tags,
            categoryID = excluded.categoryID
    ");
    $stmt->execute([$id, $title, $content, $tags, $categoryID]);

    echo json_encode(["success" => true, "id" => $id]);
}

// 📌 Function to delete a post
function deletePost() {
    if (session_status() !== PHP_SESSION_ACTIVE) {
        session_start();
    }
    
    if (!isset($_SESSION['user'])) {
        http_response_code(401);
        echo json_encode(["error" => "Unauthorized"]);
        exit();
    }

    global $db;

    // Decode JSON input
    $data = json_decode(file_get_contents("php://input"), true);
    if (!isset($data["id"])) {
        echo json_encode(["error" => "Missing post ID"]);
        return;
    }

    $stmt = $db->prepare("DELETE FROM posts WHERE id = ?");
    $stmt->execute([$data["id"]]);

    echo json_encode(["success" => true]);
}
?>
