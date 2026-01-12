<?php
/**
 * API endpoint to manually send match notification
 * POST /api/matches/send-notification.php
 * Body: { "match_id": "uuid" }
 */

require_once '../../config/cors.php';
require_once '../../config/database.php';
require_once '../../config/jwt.php';
require_once '../../models/Match.php';
require_once '../../services/NotificationService.php';

$authUser = JWT::getAuthUser();

if (!$authUser) {
    http_response_code(401);
    echo json_encode(["error" => "Unauthorized"]);
    exit;
}

$database = new Database();
$db = $database->getConnection();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["error" => "Method not allowed"]);
    exit;
}

$data = json_decode(file_get_contents("php://input"), true);

if (!isset($data['match_id'])) {
    http_response_code(400);
    echo json_encode(["error" => "match_id is required"]);
    exit;
}

$matchId = $data['match_id'];

// Get match details
$match = new ItemMatch($db);
$matchData = $match->getById($matchId);

if (!$matchData) {
    http_response_code(404);
    echo json_encode(["error" => "Match not found"]);
    exit;
}

// Get full item details
$lostItemQuery = "SELECT * FROM items WHERE id = :id";
$stmt = $db->prepare($lostItemQuery);
$stmt->bindParam(':id', $matchData['lost_item_id']);
$stmt->execute();
$lostItem = $stmt->fetch(PDO::FETCH_ASSOC);

$foundItemQuery = "SELECT * FROM items WHERE id = :id";
$stmt = $db->prepare($foundItemQuery);
$stmt->bindParam(':id', $matchData['found_item_id']);
$stmt->execute();
$foundItem = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$lostItem || !$foundItem) {
    http_response_code(404);
    echo json_encode(["error" => "Items not found"]);
    exit;
}

// Send notification
$notificationService = new NotificationService($db);
$result = $notificationService->sendMatchNotification(
    $matchId,
    $lostItem,
    $foundItem,
    $matchData['match_score']
);

if ($result) {
    http_response_code(200);
    echo json_encode([
        "success" => true,
        "message" => "Notification sent successfully"
    ]);
} else {
    http_response_code(500);
    echo json_encode([
        "error" => "Failed to send notification. Please check email configuration."
    ]);
}
?>
