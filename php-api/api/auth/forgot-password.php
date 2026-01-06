<?php
/**
 * Forgot Password Endpoint
 * Generates a password reset token and stores it
 * In production, this would send an email with the reset link
 */
require_once '../../config/cors.php';
require_once '../../config/database.php';
require_once '../../middleware/ratelimit.php';

// Strict rate limiting - 3 requests per hour per IP
rateLimit(3, 3600, 'forgot_password');

$database = new Database();
$db = $database->getConnection();

$data = json_decode(file_get_contents("php://input"));

if (empty($data->email)) {
    http_response_code(400);
    echo json_encode(["error" => "Email is required"]);
    exit;
}

$email = htmlspecialchars(strip_tags($data->email));

// Check if user exists
$checkQuery = "SELECT id FROM users WHERE email = :email";
$checkStmt = $db->prepare($checkQuery);
$checkStmt->bindParam(':email', $email);
$checkStmt->execute();

// Always return success to prevent email enumeration
if ($checkStmt->rowCount() === 0) {
    http_response_code(200);
    echo json_encode([
        "message" => "If an account with that email exists, we've sent password reset instructions."
    ]);
    exit;
}

$user = $checkStmt->fetch(PDO::FETCH_ASSOC);
$userId = $user['id'];

// Generate reset token
$resetToken = bin2hex(random_bytes(32));
$tokenExpiry = date('Y-m-d H:i:s', strtotime('+1 hour'));

// Check if password_resets table exists, create if not
try {
    $createTableQuery = "CREATE TABLE IF NOT EXISTS password_resets (
        id VARCHAR(36) PRIMARY KEY,
        user_id VARCHAR(36) NOT NULL,
        token VARCHAR(64) NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        used TINYINT(1) DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_token (token),
        INDEX idx_user_id (user_id)
    ) ENGINE=InnoDB";
    $db->exec($createTableQuery);
} catch (Exception $e) {
    // Table might already exist
}

// Delete any existing reset tokens for this user
$deleteQuery = "DELETE FROM password_resets WHERE user_id = :user_id";
$deleteStmt = $db->prepare($deleteQuery);
$deleteStmt->bindParam(':user_id', $userId);
$deleteStmt->execute();

// Insert new reset token
$resetId = sprintf('%04x%04x-%04x-%04x-%04x-%04x%04x%04x',
    mt_rand(0, 0xffff), mt_rand(0, 0xffff),
    mt_rand(0, 0xffff),
    mt_rand(0, 0x0fff) | 0x4000,
    mt_rand(0, 0x3fff) | 0x8000,
    mt_rand(0, 0xffff), mt_rand(0, 0xffff), mt_rand(0, 0xffff)
);

$insertQuery = "INSERT INTO password_resets (id, user_id, token, expires_at) VALUES (:id, :user_id, :token, :expires_at)";
$insertStmt = $db->prepare($insertQuery);
$insertStmt->bindParam(':id', $resetId);
$insertStmt->bindParam(':user_id', $userId);
$insertStmt->bindParam(':token', $resetToken);
$insertStmt->bindParam(':expires_at', $tokenExpiry);
$insertStmt->execute();

// In production, send email here with reset link
// For now, we'll just log the token (remove in production!)
error_log("Password reset token for $email: $resetToken");

http_response_code(200);
echo json_encode([
    "message" => "If an account with that email exists, we've sent password reset instructions.",
    // Remove this in production - only for local testing
    "debug_token" => $resetToken
]);
?>
