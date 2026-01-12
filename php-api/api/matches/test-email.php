<?php
/**
 * Test email configuration
 * GET /api/matches/test-email.php
 */

require_once '../../config/cors.php';
require_once '../../config/database.php';
require_once '../../config/jwt.php';
require_once '../../config/mail.php';
require_once '../../services/Mailer.php';

$authUser = JWT::getAuthUser();

if (!$authUser) {
    http_response_code(401);
    echo json_encode(["error" => "Unauthorized"]);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["error" => "Method not allowed. Use POST."]);
    exit;
}

// Check if email is configured
if (!MailConfig::isConfigured()) {
    http_response_code(400);
    echo json_encode([
        "error" => "Email not configured",
        "message" => "Please update php-api/config/mail.php with your Gmail credentials",
        "instructions" => [
            "1. Open php-api/config/mail.php",
            "2. Set your Gmail address in \$username and \$fromEmail",
            "3. Generate an App Password at https://myaccount.google.com/apppasswords",
            "4. Set the App Password in \$password",
            "5. Make sure 2FA is enabled on your Gmail account"
        ]
    ]);
    exit;
}

// Get user email from database
$database = new Database();
$db = $database->getConnection();

$query = "SELECT email, full_name FROM users WHERE id = :id";
$stmt = $db->prepare($query);
$stmt->bindParam(':id', $authUser['user_id']);
$stmt->execute();
$user = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$user) {
    http_response_code(404);
    echo json_encode(["error" => "User not found"]);
    exit;
}

// Send test email
$mailer = new Mailer();
$result = $mailer->send(
    $user['email'],
    $user['full_name'] ?: 'User',
    "🧪 FindIt Email Test",
    "<h1>Email Configuration Working!</h1>
    <p>If you received this email, your FindIt email notifications are properly configured.</p>
    <p>You will now receive email notifications when:</p>
    <ul>
        <li>Your lost item has a potential match</li>
        <li>An item you found matches someone's lost item</li>
    </ul>
    <p>Best regards,<br>FindIt Team</p>"
);

if ($result) {
    http_response_code(200);
    echo json_encode([
        "success" => true,
        "message" => "Test email sent successfully to " . $user['email']
    ]);
} else {
    http_response_code(500);
    echo json_encode([
        "error" => "Failed to send test email",
        "details" => $mailer->getError(),
        "troubleshooting" => [
            "1. Check your Gmail credentials in config/mail.php",
            "2. Make sure you're using an App Password, not your regular password",
            "3. Ensure 2FA is enabled on your Gmail account",
            "4. Check if 'Less secure app access' needs to be enabled"
        ]
    ]);
}
?>
