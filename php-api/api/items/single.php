<?php
require_once '../../config/cors.php';
require_once '../../config/database.php';
require_once '../../config/jwt.php';
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
        $authUser = JWT::getAuthUser();
        if (!$authUser) {
            http_response_code(401);
            echo json_encode(["error" => "Unauthorized"]);
            exit;
        }

        $data = json_decode(file_get_contents("php://input"));
        
        $updateData = [
            'title' => isset($data->title) ? htmlspecialchars(strip_tags($data->title)) : null,
            'description' => isset($data->description) ? htmlspecialchars(strip_tags($data->description)) : null,
            'location' => isset($data->location) ? htmlspecialchars(strip_tags($data->location)) : null,
            'status' => isset($data->status) ? htmlspecialchars(strip_tags($data->status)) : 'active'
        ];

        if ($item->update($itemId, $updateData, $authUser['user_id'])) {
            http_response_code(200);
            echo json_encode(["message" => "Item updated successfully"]);
        } else {
            http_response_code(403);
            echo json_encode(["error" => "Unauthorized or item not found"]);
        }
        break;

    case 'DELETE':
        $authUser = JWT::getAuthUser();
        if (!$authUser) {
            http_response_code(401);
            echo json_encode(["error" => "Unauthorized"]);
            exit;
        }

        if ($item->delete($itemId, $authUser['user_id'])) {
            http_response_code(200);
            echo json_encode(["message" => "Item deleted successfully"]);
        } else {
            http_response_code(403);
            echo json_encode(["error" => "Unauthorized or item not found"]);
        }
        break;

    default:
        http_response_code(405);
        echo json_encode(["error" => "Method not allowed"]);
        break;
}
?>
