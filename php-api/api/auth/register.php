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
$user->full_name = isset($data->full_name) ? htmlspecialchars(strip_tags($data->full_name)) : '';

$result = $user->register();

if ($result['success']) {
    // Generate JWT token
    $token = JWT::encode([
        'user_id' => $result['user_id'],
        'email' => $user->email
    ]);

    http_response_code(201);
    echo json_encode([
        "message" => "User registered successfully",
        "user" => [
            "id" => $result['user_id'],
            "email" => $user->email,
            "full_name" => $user->full_name
        ],
        "access_token" => $token
    ]);
} else {
    http_response_code(400);
    echo json_encode(["error" => $result['message']]);
}
?>
