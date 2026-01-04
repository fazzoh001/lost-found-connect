<?php
require_once '../../config/cors.php';
require_once '../../config/database.php';
require_once '../../config/jwt.php';
require_once '../../middleware/auth.php';
require_once '../../middleware/ratelimit.php';
require_once '../../models/Item.php';

$database = new Database();
$db = $database->getConnection();

$item = new Item($db);
$method = $_SERVER['REQUEST_METHOD'];

// Get item ID from URL
$itemId = $_GET['id'] ?? null;

if (!$itemId) {
    http_response_code(400);
    echo json_encode(["error" => "Item ID is required"]);
    exit;
}

switch ($method) {
    case 'GET':
        // Rate limit for public endpoints: 200 requests per hour per IP
        rateLimit(200, 3600, 'items_single');
        
        $itemData = $item->getById($itemId);
        
        if ($itemData) {
            http_response_code(200);
            echo json_encode($itemData);
        } else {
            http_response_code(404);
            echo json_encode(["error" => "Item not found"]);
        }
        break;

    case 'PUT':
        // Stricter rate limit for write operations: 30 per hour
        rateLimit(30, 3600, 'items_update');
        
        // Require authentication
        $authUser = requireAuth();

        $data = json_decode(file_get_contents("php://input"));
        
        $updateData = [
            'title' => isset($data->title) ? htmlspecialchars(strip_tags($data->title)) : null,
            'description' => isset($data->description) ? htmlspecialchars(strip_tags($data->description)) : null,
            'location' => isset($data->location) ? htmlspecialchars(strip_tags($data->location)) : null,
            'status' => isset($data->status) ? htmlspecialchars(strip_tags($data->status)) : 'active'
        ];

        // Get the item to check ownership
        $existingItem = $item->getById($itemId);
        if (!$existingItem) {
            http_response_code(404);
            echo json_encode(["error" => "Item not found"]);
            exit;
        }

        // Check if user is owner OR admin (verified from database)
        $isOwner = $authUser['user_id'] === $existingItem['user_id'];
        $isAdmin = userHasRole($authUser['user_id'], 'admin');

        if (!$isOwner && !$isAdmin) {
            http_response_code(403);
            echo json_encode(["error" => "Access denied. You must be the owner or an admin."]);
            exit;
        }

        // Use appropriate method based on access level
        if ($isAdmin && !$isOwner) {
            // Admin updating someone else's item
            $success = $item->updateAsAdmin($itemId, $updateData);
        } else {
            // Owner updating their own item
            $success = $item->update($itemId, $updateData, $authUser['user_id']);
        }

        if ($success) {
            http_response_code(200);
            echo json_encode(["message" => "Item updated successfully"]);
        } else {
            http_response_code(500);
            echo json_encode(["error" => "Failed to update item"]);
        }
        break;

    case 'DELETE':
        // Stricter rate limit for delete operations: 20 per hour
        rateLimit(20, 3600, 'items_delete');
        
        // Require authentication
        $authUser = requireAuth();

        // Get the item to check ownership
        $existingItem = $item->getById($itemId);
        if (!$existingItem) {
            http_response_code(404);
            echo json_encode(["error" => "Item not found"]);
            exit;
        }

        // Check if user is owner OR admin (verified from database)
        $isOwner = $authUser['user_id'] === $existingItem['user_id'];
        $isAdmin = userHasRole($authUser['user_id'], 'admin');

        if (!$isOwner && !$isAdmin) {
            http_response_code(403);
            echo json_encode(["error" => "Access denied. You must be the owner or an admin."]);
            exit;
        }

        // Use appropriate method based on access level
        if ($isAdmin && !$isOwner) {
            // Admin deleting someone else's item
            $success = $item->deleteAsAdmin($itemId);
        } else {
            // Owner deleting their own item
            $success = $item->delete($itemId, $authUser['user_id']);
        }

        if ($success) {
            http_response_code(200);
            echo json_encode(["message" => "Item deleted successfully"]);
        } else {
            http_response_code(500);
            echo json_encode(["error" => "Failed to delete item"]);
        }
        break;

    default:
        http_response_code(405);
        echo json_encode(["error" => "Method not allowed"]);
        break;
}
?>
