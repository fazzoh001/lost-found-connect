<?php
header("Content-Type: application/json");

require_once '../../config/cors.php';
require_once '../../config/database.php';
require_once '../../middleware/auth.php';

// Handle preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// Require authentication
$user = requireAuth();

if ($_SERVER['REQUEST_METHOD'] !== 'PUT' && $_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["error" => "Method not allowed"]);
    exit;
}

$database = new Database();
$db = $database->getConnection();

$data = json_decode(file_get_contents("php://input"));

if (!$data) {
    http_response_code(400);
    echo json_encode(["error" => "Invalid JSON data"]);
    exit;
}

try {
    $query = "UPDATE profiles SET 
              full_name = :full_name,
              phone = :phone,
              preferred_language = :preferred_language,
              updated_at = NOW()
              WHERE user_id = :user_id";
    
    $stmt = $db->prepare($query);
    
    $fullName = $data->full_name ?? null;
    $phone = $data->phone ?? null;
    $preferredLanguage = $data->preferred_language ?? 'en';
    $avatarUrl = $data->avatar_url ?? null;
    
    $stmt->bindParam(':full_name', $fullName);
    $stmt->bindParam(':phone', $phone);
    $stmt->bindParam(':preferred_language', $preferredLanguage);
    $stmt->bindParam(':user_id', $user['sub']);
    
    $stmt->execute();
    
    // Update avatar if provided
    if ($avatarUrl !== null) {
        $avatarQuery = "UPDATE profiles SET avatar_url = :avatar_url WHERE user_id = :user_id";
        $avatarStmt = $db->prepare($avatarQuery);
        $avatarStmt->bindParam(':avatar_url', $avatarUrl);
        $avatarStmt->bindParam(':user_id', $user['sub']);
        $avatarStmt->execute();
    }
    
    // Fetch updated profile
    $selectQuery = "SELECT u.id, u.email, p.full_name, p.phone, p.avatar_url, p.preferred_language
                    FROM users u
                    LEFT JOIN profiles p ON u.id = p.user_id
                    WHERE u.id = :user_id";
    
    $selectStmt = $db->prepare($selectQuery);
    $selectStmt->bindParam(':user_id', $user['sub']);
    $selectStmt->execute();
    
    $updatedUser = $selectStmt->fetch(PDO::FETCH_ASSOC);
    
    echo json_encode([
        "success" => true,
        "message" => "Profile updated successfully",
        "user" => $updatedUser
    ]);
    
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["error" => "Database error: " . $e->getMessage()]);
}
?>
