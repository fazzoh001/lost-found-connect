<?php
require_once '../../config/cors.php';
require_once '../../config/database.php';
require_once '../../config/jwt.php';
require_once '../../middleware/ratelimit.php';
require_once '../../models/Item.php';

$database = new Database();
$db = $database->getConnection();

$item = new Item($db);
$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        // Rate limit for public endpoints: 100 requests per hour per IP
        rateLimit(100, 3600, 'items_list');
        
        // Get filters from query params
        $filters = [
            'type' => $_GET['type'] ?? null,
            'category' => $_GET['category'] ?? null,
            'status' => $_GET['status'] ?? 'active',
            'search' => $_GET['search'] ?? null
        ];

        // Pagination support
        $page = max(1, intval($_GET['page'] ?? 1));
        $limit = min(100, max(1, intval($_GET['limit'] ?? 50))); // Max 100 items per page
        $filters['page'] = $page;
        $filters['limit'] = $limit;

        $items = $item->getAll($filters);
        
        http_response_code(200);
        echo json_encode($items);
        break;

    case 'POST':
        // Stricter rate limit for write operations: 20 per hour
        rateLimit(20, 3600, 'items_create');
        
        // Require authentication
        $authUser = JWT::getAuthUser();
        if (!$authUser) {
            http_response_code(401);
            echo json_encode(["error" => "Unauthorized"]);
            exit;
        }

        $data = json_decode(file_get_contents("php://input"));

        if (empty($data->title) || empty($data->category) || empty($data->location)) {
            http_response_code(400);
            echo json_encode(["error" => "Title, category, and location are required"]);
            exit;
        }

        $item->user_id = $authUser['user_id'];
        $item->type = htmlspecialchars(strip_tags($data->type));
        $item->title = htmlspecialchars(strip_tags($data->title));
        $item->category = htmlspecialchars(strip_tags($data->category));
        $item->description = isset($data->description) ? htmlspecialchars(strip_tags($data->description)) : '';
        $item->location = htmlspecialchars(strip_tags($data->location));
        $item->date_occurred = $data->date_occurred ?? date('Y-m-d');
        $item->image_url = $data->image_url ?? null;
        $item->qr_code = null;

        $itemId = $item->create();

        if ($itemId) {
            http_response_code(201);
            echo json_encode([
                "message" => "Item created successfully",
                "id" => $itemId
            ]);
        } else {
            http_response_code(500);
            echo json_encode(["error" => "Failed to create item"]);
        }
        break;

    default:
        http_response_code(405);
        echo json_encode(["error" => "Method not allowed"]);
        break;
}
?>
