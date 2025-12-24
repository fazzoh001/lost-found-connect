<?php
require_once '../../config/cors.php';
require_once '../../config/database.php';
require_once '../../config/jwt.php';
require_once '../../models/Item.php';

$authUser = JWT::getAuthUser();

if (!$authUser) {
    http_response_code(401);
    echo json_encode(["error" => "Unauthorized"]);
    exit;
}

$database = new Database();
$db = $database->getConnection();

$item = new Item($db);

$data = json_decode(file_get_contents("php://input"));
$itemId = $data->item_id ?? null;

if (!$itemId) {
    http_response_code(400);
    echo json_encode(["error" => "Item ID is required"]);
    exit;
}

// Verify item exists and belongs to user
$itemData = $item->getById($itemId);

if (!$itemData || $itemData['user_id'] !== $authUser['user_id']) {
    http_response_code(403);
    echo json_encode(["error" => "Unauthorized"]);
    exit;
}

// Generate QR code URL (frontend URL)
$baseUrl = $_SERVER['HTTP_ORIGIN'] ?? 'http://localhost:5173';
$qrUrl = $baseUrl . '/items/' . $itemId;

if ($item->updateQRCode($itemId, $qrUrl)) {
    http_response_code(200);
    echo json_encode([
        "message" => "QR code generated",
        "qr_url" => $qrUrl
    ]);
} else {
    http_response_code(500);
    echo json_encode(["error" => "Failed to generate QR code"]);
}
?>
