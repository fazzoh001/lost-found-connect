<?php
require_once '../../config/cors.php';
require_once '../../config/database.php';
require_once '../../config/jwt.php';
require_once '../../middleware/ratelimit.php';
require_once '../../models/User.php';

// Strict rate limiting for registration to prevent abuse
// 5 registration attempts per hour per IP
rateLimit(5, 3600, 'auth_register');

$database = new Database();
$db = $database->getConnection();

$user = new User($db);

$data = json_decode(file_get_contents("php://input"));

if (empty($data->email) || empty($data->password)) {
    http_response_code(400);
    echo json_encode(["error" => "Email and password are required"]);
    exit;
}

// Validate email format
if (!filter_var($data->email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(["error" => "Invalid email format"]);
    exit;
}

// Server-side password validation
// Must match client-side requirements: 8+ chars, uppercase, lowercase, number, special char
$password = $data->password;
$passwordErrors = [];

if (strlen($password) < 8) {
    $passwordErrors[] = "Password must be at least 8 characters";
}
if (!preg_match('/[A-Z]/', $password)) {
    $passwordErrors[] = "Password must contain at least one uppercase letter";
}
if (!preg_match('/[a-z]/', $password)) {
    $passwordErrors[] = "Password must contain at least one lowercase letter";
}
if (!preg_match('/[0-9]/', $password)) {
    $passwordErrors[] = "Password must contain at least one number";
}
if (!preg_match('/[!@#$%^&*(),.?":{}|<>_\-+=\[\]\\\\\/`~]/', $password)) {
    $passwordErrors[] = "Password must contain at least one special character";
}

if (!empty($passwordErrors)) {
    http_response_code(400);
    echo json_encode(["error" => implode(". ", $passwordErrors)]);
    exit;
}

// Validate full name length
$fullName = isset($data->full_name) ? trim($data->full_name) : '';
if (strlen($fullName) > 100) {
    http_response_code(400);
    echo json_encode(["error" => "Full name must be less than 100 characters"]);
    exit;
}

$user->email = htmlspecialchars(strip_tags($data->email));
$user->password = $password;
$user->full_name = htmlspecialchars(strip_tags($fullName));

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
            "full_name" => $user->full_name,
            "role" => "user"
        ],
        "access_token" => $token
    ]);
} else {
    http_response_code(400);
    // Generic error to prevent information disclosure
    echo json_encode(["error" => "Registration failed. Please try again."]);
}
?>
