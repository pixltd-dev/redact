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
        getCategories();
        break;
    case 'POST':
        updateCategory();
        break;
    case 'DELETE':
        deleteCategory();
        break;    
    default:
        echo json_encode(["error" => "Invalid request"]);
        break;
}

// 📌 Function to fetch all categories
function getCategories() {
    global $db;

    $stmt = $db->query("SELECT * FROM category ORDER BY title ASC");
    echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
}

// 📌 Function to update or create a category
function updateCategory() {
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

    if (isset($data["title"])) {
        $title = $data["title"];

        $sortIndex = isset($data["sort_index"]) ? (float)$data["sort_index"] : 10;

        if (isset($data["id"])) {
            // Update the existing category by ID
            $id = $data["id"];
            if ($sortIndex !== null) {
            $stmt = $db->prepare("UPDATE category SET title = ?, sort_index = ? WHERE id = ?");
            $stmt->execute([$title, $sortIndex, $id]);
            } else {
            $stmt = $db->prepare("UPDATE category SET title = ? WHERE id = ?");
            $stmt->execute([$title, $id]);
            }
        } else {
            // Check if a category with the same title already exists
            $stmt = $db->prepare("SELECT id FROM category WHERE title = ?");
            $stmt->execute([$title]);
            $existingCategory = $stmt->fetch(PDO::FETCH_ASSOC);

            if ($existingCategory) {
            // Category with the same title exists, return an error
            echo json_encode(["error" => "Category with the same title already exists"]);
            return;
            }

            // Insert a new category
            if ($sortIndex !== null) {
            $stmt = $db->prepare("INSERT INTO category (title, sort_index) VALUES (?, ?)");
            $stmt->execute([$title, $sortIndex]);
            } else {
            $stmt = $db->prepare("INSERT INTO category (title) VALUES (?)");
            $stmt->execute([$title]);
            }
        }

        echo json_encode(["success" => true]);
    } else {
        echo json_encode(["error" => "Invalid input"]);
    }
}

// 📌 Function to delete a category
function deleteCategory() {
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

    if (isset($data["id"])) {
        $id = $data["id"];

        // Delete the category
        $stmt = $db->prepare("DELETE FROM category WHERE id = ?");
        $stmt->execute([$id]);

        echo json_encode(["success" => true]);
    } else {
        echo json_encode(["error" => "Invalid input"]);
    }
}
?>