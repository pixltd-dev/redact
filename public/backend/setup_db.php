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

try {
    $db = new PDO("sqlite:redact.db");
    $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Create the posts table if it does not exist
    $query = "CREATE TABLE IF NOT EXISTS posts (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        tags TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )";
    $db->exec($query);

    //Add categoryID integer nullable to posts table if it does not exist
    $query = "ALTER TABLE posts ADD COLUMN categoryID INTEGER NULL";
    try {
        $db->exec($query);
    } catch (PDOException $e) {
        // Ignore error if column already exists
        if ($e->getCode() !== 'HY000') {
            throw $e;
        }
    }

    // Create the user_settings table if it does not exist
    $query = "CREATE TABLE IF NOT EXISTS user_settings (
        id INTEGER PRIMARY KEY,
        user_settings_json TEXT
    )";
    $db->exec($query);

    $query = "CREATE TABLE IF NOT EXISTS category (
        id INTEGER PRIMARY KEY,
        title TEXT
    )";
    $db->exec($query);

    echo json_encode(["success" => true, "message" => "Database setup complete"]);
} catch (Exception $e) {
    echo json_encode(["success" => false, "error" => $e->getMessage()]);
}
?>
