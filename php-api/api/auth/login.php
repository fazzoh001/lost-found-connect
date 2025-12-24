<?php
require_once '../../config/cors.php';
require_once '../../config/database.php';
require_once '../../config/jwt.php';
require_once '../../models/User.php';

$database = new Database();
$db = $database->getConnection();

$user = new User($db);

$data = json_decode(file_get_contents("php://input"));

if (empty($data->email) || empty($data->password)) {
    http_response_code(400);
    echo json_encode(["error" => "Email and password are required"]);
    exit;
}

$user->email = htmlspecialchars(strip_tags($data->email));
$user->password = $data->password;

$result = $user->login();

if ($result['success']) {
    // Check if user is admin
    $isAdmin = $user->hasRole($result['user']['id'], 'admin');
    
    // Generate JWT token
    $token = JWT::encode([
        'user_id' => $result['user']['id'],
        'email' => $result['user']['email'],
        'is_admin' => $isAdmin
    ]);

    http_response_code(200);
    echo json_encode([
        "message" => "Login successful",
        "user" => [
            "id" => $result['user']['id'],
            "email" => $result['user']['email'],
            "full_name" => $result['user']['full_name'],
            "is_admin" => $isAdmin
        ],
        "access_token" => $token
    ]);
} else {
    http_response_code(401);
    echo json_encode(["error" => $result['message']]);
}
?>
