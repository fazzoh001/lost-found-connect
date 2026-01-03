<?php
/**
 * Run Auto-Matching for All Active Items
 * This endpoint runs matching for all active lost items against found items
 * Useful for batch processing or scheduled tasks
 */

require_once '../../config/cors.php';
require_once '../../config/database.php';
require_once '../../config/jwt.php';
require_once '../../models/Match.php';
require_once '../../models/Item.php';

$authUser = JWT::getAuthUser();

if (!$authUser) {
    http_response_code(401);
    echo json_encode(["error" => "Unauthorized"]);
    exit;
}

$database = new Database();
$db = $database->getConnection();

$method = $_SERVER['REQUEST_METHOD'];

if ($method !== 'POST') {
    http_response_code(405);
    echo json_encode(["error" => "Method not allowed"]);
    exit;
}

$item = new Item($db);
$matchModel = new ItemMatch($db);

// Get all active lost items
$lostItems = $item->getAll(['type' => 'lost', 'status' => 'active']);
$foundItems = $item->getAll(['type' => 'found', 'status' => 'active']);

$totalMatchesCreated = 0;
$processedItems = 0;

foreach ($lostItems as $lostItem) {
    foreach ($foundItems as $foundItem) {
        $score = calculateMatchScore($lostItem, $foundItem);
        
        // Only create matches with score >= 50
        if ($score >= 50) {
            // Check if match already exists
            if (!matchExists($db, $lostItem['id'], $foundItem['id'])) {
                $matchModel->lost_item_id = $lostItem['id'];
                $matchModel->found_item_id = $foundItem['id'];
                $matchModel->match_score = $score;
                
                if ($matchModel->create()) {
                    $totalMatchesCreated++;
                }
            }
        }
    }
    $processedItems++;
}

http_response_code(200);
echo json_encode([
    "message" => "Batch matching complete",
    "lost_items_processed" => $processedItems,
    "found_items_compared" => count($foundItems),
    "new_matches_created" => $totalMatchesCreated
]);

/**
 * Calculate match score between two items
 */
function calculateMatchScore($item1, $item2) {
    $score = 0;
    
    // Category match (40 points)
    if (strtolower($item1['category']) === strtolower($item2['category'])) {
        $score += 40;
    }
    
    // Location similarity (up to 30 points)
    $locationScore = calculateLocationSimilarity($item1['location'], $item2['location']);
    $score += round($locationScore * 30);
    
    // Date proximity (up to 30 points)
    $dateScore = calculateDateProximity($item1['date_occurred'], $item2['date_occurred']);
    $score += round($dateScore * 30);
    
    return min($score, 100);
}

function calculateLocationSimilarity($loc1, $loc2) {
    $loc1 = strtolower(trim($loc1));
    $loc2 = strtolower(trim($loc2));
    
    if ($loc1 === $loc2) return 1.0;
    if (strpos($loc1, $loc2) !== false || strpos($loc2, $loc1) !== false) return 0.8;
    
    $words1 = array_filter(explode(' ', preg_replace('/[^a-z0-9\s]/', '', $loc1)));
    $words2 = array_filter(explode(' ', preg_replace('/[^a-z0-9\s]/', '', $loc2)));
    
    if (empty($words1) || empty($words2)) return 0;
    
    $commonWords = array_intersect($words1, $words2);
    $totalWords = count(array_unique(array_merge($words1, $words2)));
    
    return $totalWords > 0 ? count($commonWords) / $totalWords : 0;
}

function calculateDateProximity($date1, $date2) {
    $timestamp1 = strtotime($date1);
    $timestamp2 = strtotime($date2);
    
    if ($timestamp1 === false || $timestamp2 === false) return 0;
    
    $daysDiff = abs(($timestamp1 - $timestamp2) / 86400);
    
    if ($daysDiff <= 0) return 1.0;
    if ($daysDiff >= 30) return 0;
    
    return 1 - ($daysDiff / 30);
}

function matchExists($db, $lostId, $foundId) {
    $query = "SELECT id FROM matches WHERE lost_item_id = :lost_id AND found_item_id = :found_id";
    $stmt = $db->prepare($query);
    $stmt->bindParam(':lost_id', $lostId);
    $stmt->bindParam(':found_id', $foundId);
    $stmt->execute();
    return $stmt->fetch(PDO::FETCH_ASSOC) !== false;
}
?>
