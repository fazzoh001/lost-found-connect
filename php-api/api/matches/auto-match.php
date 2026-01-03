<?php
/**
 * Auto-Matching API Endpoint
 * Finds potential matches between lost and found items based on:
 * - Category (exact match: 40 points)
 * - Location (text similarity: up to 30 points)
 * - Date proximity (within range: up to 30 points)
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

$data = json_decode(file_get_contents("php://input"));
$itemId = $data->item_id ?? null;

if (!$itemId) {
    http_response_code(400);
    echo json_encode(["error" => "item_id is required"]);
    exit;
}

// Get the source item
$item = new Item($db);
$sourceItem = $item->getById($itemId);

if (!$sourceItem) {
    http_response_code(404);
    echo json_encode(["error" => "Item not found"]);
    exit;
}

// Determine what type to match against
$matchType = $sourceItem['type'] === 'lost' ? 'found' : 'lost';

// Get all potential matching items
$potentialMatches = $item->getAll([
    'type' => $matchType,
    'status' => 'active'
]);

$matches = [];
$matchModel = new ItemMatch($db);

foreach ($potentialMatches as $candidate) {
    $score = calculateMatchScore($sourceItem, $candidate);
    
    // Only consider matches with score >= 50
    if ($score >= 50) {
        $matches[] = [
            'item' => $candidate,
            'score' => $score
        ];
    }
}

// Sort by score descending
usort($matches, function($a, $b) {
    return $b['score'] - $a['score'];
});

// Take top 10 matches
$topMatches = array_slice($matches, 0, 10);

// Store matches in database
$createdMatches = [];
foreach ($topMatches as $matchData) {
    // Check if match already exists
    $existingMatch = checkExistingMatch(
        $db,
        $sourceItem['id'],
        $matchData['item']['id'],
        $sourceItem['type']
    );
    
    if (!$existingMatch) {
        $matchModel->lost_item_id = $sourceItem['type'] === 'lost' 
            ? $sourceItem['id'] 
            : $matchData['item']['id'];
        $matchModel->found_item_id = $sourceItem['type'] === 'found' 
            ? $sourceItem['id'] 
            : $matchData['item']['id'];
        $matchModel->match_score = $matchData['score'];
        
        $newMatchId = $matchModel->create();
        if ($newMatchId) {
            $createdMatches[] = [
                'id' => $newMatchId,
                'matched_item' => $matchData['item'],
                'score' => $matchData['score']
            ];
        }
    }
}

http_response_code(200);
echo json_encode([
    "message" => "Auto-matching complete",
    "matches_found" => count($topMatches),
    "new_matches_created" => count($createdMatches),
    "matches" => $topMatches
]);

/**
 * Calculate match score between two items
 * @param array $item1 Source item
 * @param array $item2 Candidate item
 * @return int Score from 0-100
 */
function calculateMatchScore($item1, $item2) {
    $score = 0;
    
    // Category match (40 points for exact match)
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

/**
 * Calculate text similarity between two locations
 * @param string $loc1 First location
 * @param string $loc2 Second location
 * @return float Similarity score from 0 to 1
 */
function calculateLocationSimilarity($loc1, $loc2) {
    $loc1 = strtolower(trim($loc1));
    $loc2 = strtolower(trim($loc2));
    
    // Exact match
    if ($loc1 === $loc2) {
        return 1.0;
    }
    
    // Check if one contains the other
    if (strpos($loc1, $loc2) !== false || strpos($loc2, $loc1) !== false) {
        return 0.8;
    }
    
    // Word-based similarity
    $words1 = array_filter(explode(' ', preg_replace('/[^a-z0-9\s]/', '', $loc1)));
    $words2 = array_filter(explode(' ', preg_replace('/[^a-z0-9\s]/', '', $loc2)));
    
    if (empty($words1) || empty($words2)) {
        return 0;
    }
    
    $commonWords = array_intersect($words1, $words2);
    $totalWords = count(array_unique(array_merge($words1, $words2)));
    
    if ($totalWords === 0) {
        return 0;
    }
    
    return count($commonWords) / $totalWords;
}

/**
 * Calculate date proximity score
 * @param string $date1 First date (YYYY-MM-DD)
 * @param string $date2 Second date (YYYY-MM-DD)
 * @return float Score from 0 to 1 (1 = same day, 0 = more than 30 days apart)
 */
function calculateDateProximity($date1, $date2) {
    $timestamp1 = strtotime($date1);
    $timestamp2 = strtotime($date2);
    
    if ($timestamp1 === false || $timestamp2 === false) {
        return 0;
    }
    
    $daysDiff = abs(($timestamp1 - $timestamp2) / 86400);
    
    // Same day = 100%, 30+ days apart = 0%
    if ($daysDiff <= 0) {
        return 1.0;
    } elseif ($daysDiff >= 30) {
        return 0;
    }
    
    return 1 - ($daysDiff / 30);
}

/**
 * Check if a match already exists between two items
 */
function checkExistingMatch($db, $itemId1, $itemId2, $sourceType) {
    $lostId = $sourceType === 'lost' ? $itemId1 : $itemId2;
    $foundId = $sourceType === 'found' ? $itemId1 : $itemId2;
    
    $query = "SELECT id FROM matches 
              WHERE lost_item_id = :lost_id AND found_item_id = :found_id";
    
    $stmt = $db->prepare($query);
    $stmt->bindParam(':lost_id', $lostId);
    $stmt->bindParam(':found_id', $foundId);
    $stmt->execute();
    
    return $stmt->fetch(PDO::FETCH_ASSOC);
}
?>
