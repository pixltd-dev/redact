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
        getPosts();
        break;
    case 'POST':
        createPost();
        break;
    case 'PUT':
        updatePost();
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

// 📌 Function to create a new post
function createPost() {
    global $db;

    $data = json_decode(file_get_contents("php://input"), true);
    if (!isset($data["title"], $data["content"])) {
        echo json_encode(["error" => "Missing title or content"]);
        return;
    }

    $id = uniqid();
    $title = $data["title"];
    $content = $data["content"];
    $tags = isset($data["tags"]) ? implode(",", $data["tags"]) : "";

    $stmt = $db->prepare("INSERT INTO posts (id, title, content, tags) VALUES (?, ?, ?, ?)");
    $stmt->execute([$id, $title, $content, $tags]);

    echo json_encode(["success" => true, "id" => $id]);
}

// 📌 Function to update a post
function updatePost() {
    global $db;

    $data = json_decode(file_get_contents("php://input"), true);
    if (!isset($data["id"], $data["title"], $data["content"])) {
        echo json_encode(["error" => "Missing fields"]);
        return;
    }

    $stmt = $db->prepare("UPDATE posts SET title = ?, content = ?, tags = ? WHERE id = ?");
    $stmt->execute([$data["title"], $data["content"], implode(",", $data["tags"] ?? []), $data["id"]]);

    echo json_encode(["success" => true]);
}

// 📌 Function to delete a post
function deletePost() {
    global $db;

    parse_str(file_get_contents("php://input"), $data);
    if (!isset($data["id"])) {
        echo json_encode(["error" => "Missing post ID"]);
        return;
    }

    $stmt = $db->prepare("DELETE FROM posts WHERE id = ?");
    $stmt->execute([$data["id"]]);

    echo json_encode(["success" => true]);
}
?>
