<?php
/**
 * Reset Password Endpoint
 * Validates token and updates password
 */
require_once '../../config/cors.php';
require_once '../../config/database.php';
require_once '../../middleware/ratelimit.php';

// Strict rate limiting - 5 requests per 15 minutes per IP
rateLimit(5, 900, 'reset_password');

$database = new Database();
$db = $database->getConnection();

$data = json_decode(file_get_contents("php://input"));

if (empty($data->token) || empty($data->password)) {
    http_response_code(400);
    echo json_encode(["error" => "Token and new password are required"]);
    exit;
}

$token = htmlspecialchars(strip_tags($data->token));
$password = $data->password;

// Validate password strength
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

// Find valid reset token
$query = "SELECT pr.user_id, pr.expires_at, u.email 
          FROM password_resets pr
          JOIN users u ON pr.user_id = u.id
          WHERE pr.token = :token AND pr.used = 0";
$stmt = $db->prepare($query);
$stmt->bindParam(':token', $token);
$stmt->execute();

if ($stmt->rowCount() === 0) {
    http_response_code(400);
    echo json_encode(["error" => "Invalid or expired reset token"]);
    exit;
}

$resetData = $stmt->fetch(PDO::FETCH_ASSOC);

// Check if token is expired
if (strtotime($resetData['expires_at']) < time()) {
    http_response_code(400);
    echo json_encode(["error" => "Reset token has expired. Please request a new one."]);
    exit;
}

// Update password
$hashedPassword = password_hash($password, PASSWORD_BCRYPT);
$updateQuery = "UPDATE users SET password = :password WHERE id = :user_id";
$updateStmt = $db->prepare($updateQuery);
$updateStmt->bindParam(':password', $hashedPassword);
$updateStmt->bindParam(':user_id', $resetData['user_id']);
$updateStmt->execute();

// Mark token as used
$markUsedQuery = "UPDATE password_resets SET used = 1 WHERE token = :token";
$markUsedStmt = $db->prepare($markUsedQuery);
$markUsedStmt->bindParam(':token', $token);
$markUsedStmt->execute();

http_response_code(200);
echo json_encode([
    "message" => "Password has been reset successfully. You can now log in with your new password."
]);
?>
