<?php
require_once __DIR__ . '/../services/NotificationService.php';

class ItemMatch {
    private $conn;
    private $table = "matches";
    private $notificationService;

    public $id;
    public $lost_item_id;
    public $found_item_id;
    public $match_score;
    public $status;
    public $created_at;

    public function __construct($db) {
        $this->conn = $db;
        $this->notificationService = new NotificationService($db);
    }

    // Get matches for user
    public function getByUser($userId) {
        $query = "SELECT m.*, 
                         li.title as lost_title, li.category as lost_category,
                         fi.title as found_title, fi.category as found_category
                  FROM " . $this->table . " m
                  JOIN items li ON m.lost_item_id = li.id
                  JOIN items fi ON m.found_item_id = fi.id
                  WHERE li.user_id = :user_id OR fi.user_id = :user_id
                  ORDER BY m.created_at DESC";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':user_id', $userId);
        $stmt->execute();

        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    // Get match by ID
    public function getById($matchId) {
        $query = "SELECT m.*, 
                         li.title as lost_title, li.description as lost_description,
                         li.location as lost_location, li.category as lost_category,
                         fi.title as found_title, fi.description as found_description,
                         fi.location as found_location, fi.category as found_category
                  FROM " . $this->table . " m
                  JOIN items li ON m.lost_item_id = li.id
                  JOIN items fi ON m.found_item_id = fi.id
                  WHERE m.id = :id";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':id', $matchId);
        $stmt->execute();

        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    // Create match with email notification
    public function create($sendNotification = true) {
        $this->id = $this->generateUUID();
        $this->status = 'pending';
        
        $query = "INSERT INTO " . $this->table . " 
                  (id, lost_item_id, found_item_id, match_score, status, created_at) 
                  VALUES (:id, :lost_item_id, :found_item_id, :match_score, :status, NOW())";

        $stmt = $this->conn->prepare($query);
        
        $stmt->bindParam(':id', $this->id);
        $stmt->bindParam(':lost_item_id', $this->lost_item_id);
        $stmt->bindParam(':found_item_id', $this->found_item_id);
        $stmt->bindParam(':match_score', $this->match_score);
        $stmt->bindParam(':status', $this->status);

        if ($stmt->execute()) {
            // Send email notification if enabled
            if ($sendNotification) {
                $this->sendMatchNotification();
            }
            return $this->id;
        }
        return false;
    }

    // Send email notification for a match
    private function sendMatchNotification() {
        try {
            // Get full item details
            $lostItem = $this->getItemById($this->lost_item_id);
            $foundItem = $this->getItemById($this->found_item_id);
            
            if ($lostItem && $foundItem) {
                $this->notificationService->sendMatchNotification(
                    $this->id,
                    $lostItem,
                    $foundItem,
                    $this->match_score
                );
            }
        } catch (Exception $e) {
            // Log error but don't fail the match creation
            error_log("Failed to send match notification: " . $e->getMessage());
        }
    }

    // Get item by ID for notifications
    private function getItemById($itemId) {
        $query = "SELECT * FROM items WHERE id = :id";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':id', $itemId);
        $stmt->execute();
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    // Update match status
    public function updateStatus($matchId, $status) {
        $query = "UPDATE " . $this->table . " SET status = :status WHERE id = :id";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':status', $status);
        $stmt->bindParam(':id', $matchId);

        return $stmt->execute();
    }

    // Get all matches (admin)
    public function getAll() {
        $query = "SELECT m.*, 
                         li.title as lost_title, fi.title as found_title
                  FROM " . $this->table . " m
                  JOIN items li ON m.lost_item_id = li.id
                  JOIN items fi ON m.found_item_id = fi.id
                  ORDER BY m.created_at DESC";
        
        $stmt = $this->conn->prepare($query);
        $stmt->execute();

        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    private function generateUUID() {
        return sprintf('%04x%04x-%04x-%04x-%04x-%04x%04x%04x',
            mt_rand(0, 0xffff), mt_rand(0, 0xffff),
            mt_rand(0, 0xffff),
            mt_rand(0, 0x0fff) | 0x4000,
            mt_rand(0, 0x3fff) | 0x8000,
            mt_rand(0, 0xffff), mt_rand(0, 0xffff), mt_rand(0, 0xffff)
        );
    }
}
?>
