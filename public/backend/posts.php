<?php
if ($_SERVER['HTTP_HOST'] === 'localhost:8001') { // Only enable CORS in development
    header("Access-Control-Allow-Origin: *");
} else {
    if (isset($_SERVER['HTTP_ORIGIN'])) {
        header("Access-Control-Allow-Origin: {$_SERVER['HTTP_ORIGIN']}");;
    }
}
header("Access-Control-Allow-Methods: POST, OPTIONS, DELETE, PUT, GET");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");
$db = new PDO("sqlite:redact.db");
$db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

$method = $_SERVER['REQUEST_METHOD'];

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
    } else {
        // Fetch all posts
        $stmt = $db->query("SELECT * FROM posts ORDER BY created_at DESC");
        echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
    }
}

// 📌 Function to create/update a post
function createPost() {
    global $db;

    $data = json_decode(file_get_contents("php://input"), true);
    if (!isset($data["id"], $data["title"], $data["content"])) {
        echo json_encode(["error" => "Missing id, title, or content"]);
        return;
    }

    $id = $data["id"] ?? uniqid(); // Use provided ID or generate a new one
    $title = $data["title"];
    $content = $data["content"];
    $tags = isset($data["tags"]) ? implode(",", $data["tags"]) : "";

    // Insert or update the post
    $stmt = $db->prepare("
        INSERT INTO posts (id, title, content, tags) 
        VALUES (?, ?, ?, ?)
        ON CONFLICT(id) DO UPDATE SET 
            title = excluded.title,
            content = excluded.content,
            tags = excluded.tags
    ");
    $stmt->execute([$id, $title, $content, $tags]);

    echo json_encode(["success" => true, "id" => $id]);
}

// 📌 Function to delete a post
function deletePost() {
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
