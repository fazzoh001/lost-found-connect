<?php
require_once '../../config/cors.php';
require_once '../../config/database.php';
require_once '../../config/jwt.php';
require_once '../../models/User.php';

$authUser = JWT::getAuthUser();

if (!$authUser) {
    http_response_code(401);
    echo json_encode(["error" => "Unauthorized"]);
    exit;
}

$database = new Database();
$db = $database->getConnection();

$user = new User($db);
$userData = $user->getById($authUser['user_id']);

if ($userData) {
    $isAdmin = $user->hasRole($authUser['user_id'], 'admin');
    
    http_response_code(200);
    echo json_encode([
        "user" => [
            "id" => $userData['id'],
            "email" => $userData['email'],
            "full_name" => $userData['full_name'],
            "phone" => $userData['phone'],
            "avatar_url" => $userData['avatar_url'],
            "preferred_language" => $userData['preferred_language'],
            "is_admin" => $isAdmin
        ]
    ]);
} else {
    http_response_code(404);
    echo json_encode(["error" => "User not found"]);
}
?>
