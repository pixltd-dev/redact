<?php
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
    global $db;
    $data = json_decode(file_get_contents("php://input"), true);

    if (isset($data["title"])) {
        $title = $data["title"];

        // Check if a category with the same title already exists
        $stmt = $db->prepare("SELECT id FROM category WHERE title = ?");
        $stmt->execute([$title]);
        $existingCategory = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($existingCategory) {
            // Update the existing category
            $id = $existingCategory["id"];
            $stmt = $db->prepare("UPDATE category SET title = ? WHERE id = ?");
            $stmt->execute([$title, $id]);
        } else {
            // Insert a new category
            $stmt = $db->prepare("INSERT INTO category (title) VALUES (?)");
            $stmt->execute([$title]);
        }

        echo json_encode(["success" => true]);
    } else {
        echo json_encode(["error" => "Invalid input"]);
    }
}

// 📌 Function to delete a category
function deleteCategory() {
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