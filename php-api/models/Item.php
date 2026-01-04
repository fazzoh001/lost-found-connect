<?php
class Item {
    private $conn;
    private $table = "items";

    public $id;
    public $user_id;
    public $type;
    public $title;
    public $category;
    public $description;
    public $location;
    public $date_occurred;
    public $image_url;
    public $status;
    public $qr_code;
    public $created_at;
    public $updated_at;

    public function __construct($db) {
        $this->conn = $db;
    }

    // Get all items
    public function getAll($filters = []) {
        $query = "SELECT * FROM " . $this->table . " WHERE 1=1";
        $params = [];

        if (!empty($filters['type'])) {
            $query .= " AND type = :type";
            $params[':type'] = $filters['type'];
        }

        if (!empty($filters['category'])) {
            $query .= " AND category = :category";
            $params[':category'] = $filters['category'];
        }

        if (!empty($filters['status'])) {
            $query .= " AND status = :status";
            $params[':status'] = $filters['status'];
        }

        if (!empty($filters['search'])) {
            $query .= " AND (title LIKE :search OR description LIKE :search)";
            $params[':search'] = '%' . $filters['search'] . '%';
        }

        $query .= " ORDER BY created_at DESC";

        $stmt = $this->conn->prepare($query);
        
        foreach ($params as $key => $value) {
            $stmt->bindValue($key, $value);
        }

        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    // Get items by user
    public function getByUser($userId) {
        $query = "SELECT * FROM " . $this->table . " 
                  WHERE user_id = :user_id 
                  ORDER BY created_at DESC";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':user_id', $userId);
        $stmt->execute();

        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    // Get single item
    public function getById($itemId) {
        $query = "SELECT * FROM " . $this->table . " WHERE id = :id";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':id', $itemId);
        $stmt->execute();

        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    // Create item
    public function create() {
        $this->id = $this->generateUUID();
        $this->status = 'active';
        
        $query = "INSERT INTO " . $this->table . " 
                  (id, user_id, type, title, category, description, location, 
                   date_occurred, image_url, status, qr_code, created_at, updated_at) 
                  VALUES (:id, :user_id, :type, :title, :category, :description, :location,
                          :date_occurred, :image_url, :status, :qr_code, NOW(), NOW())";

        $stmt = $this->conn->prepare($query);
        
        $stmt->bindParam(':id', $this->id);
        $stmt->bindParam(':user_id', $this->user_id);
        $stmt->bindParam(':type', $this->type);
        $stmt->bindParam(':title', $this->title);
        $stmt->bindParam(':category', $this->category);
        $stmt->bindParam(':description', $this->description);
        $stmt->bindParam(':location', $this->location);
        $stmt->bindParam(':date_occurred', $this->date_occurred);
        $stmt->bindParam(':image_url', $this->image_url);
        $stmt->bindParam(':status', $this->status);
        $stmt->bindParam(':qr_code', $this->qr_code);

        if ($stmt->execute()) {
            return $this->id;
        }
        return false;
    }

    // Update item - owner only
    public function update($itemId, $data, $userId) {
        // Verify ownership
        $item = $this->getById($itemId);
        if (!$item || $item['user_id'] !== $userId) {
            return false;
        }

        $query = "UPDATE " . $this->table . " 
                  SET title = :title, 
                      description = :description, 
                      location = :location,
                      status = :status,
                      updated_at = NOW()
                  WHERE id = :id";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':title', $data['title']);
        $stmt->bindParam(':description', $data['description']);
        $stmt->bindParam(':location', $data['location']);
        $stmt->bindParam(':status', $data['status']);
        $stmt->bindParam(':id', $itemId);

        return $stmt->execute();
    }

    // Update item - admin bypass (no ownership check)
    // IMPORTANT: Only call this after verifying admin role from database
    public function updateAsAdmin($itemId, $data) {
        $item = $this->getById($itemId);
        if (!$item) {
            return false;
        }

        $query = "UPDATE " . $this->table . " 
                  SET title = COALESCE(:title, title), 
                      description = COALESCE(:description, description), 
                      location = COALESCE(:location, location),
                      status = COALESCE(:status, status),
                      updated_at = NOW()
                  WHERE id = :id";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':title', $data['title']);
        $stmt->bindParam(':description', $data['description']);
        $stmt->bindParam(':location', $data['location']);
        $stmt->bindParam(':status', $data['status']);
        $stmt->bindParam(':id', $itemId);

        return $stmt->execute();
    }

    // Delete item - owner only
    public function delete($itemId, $userId) {
        // Verify ownership
        $item = $this->getById($itemId);
        if (!$item || $item['user_id'] !== $userId) {
            return false;
        }

        $query = "DELETE FROM " . $this->table . " WHERE id = :id";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':id', $itemId);

        return $stmt->execute();
    }

    // Delete item - admin bypass (no ownership check)
    // IMPORTANT: Only call this after verifying admin role from database
    public function deleteAsAdmin($itemId) {
        $item = $this->getById($itemId);
        if (!$item) {
            return false;
        }

        $query = "DELETE FROM " . $this->table . " WHERE id = :id";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':id', $itemId);

        return $stmt->execute();
    }

    // Update QR code
    public function updateQRCode($itemId, $qrCode) {
        $query = "UPDATE " . $this->table . " SET qr_code = :qr_code WHERE id = :id";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':qr_code', $qrCode);
        $stmt->bindParam(':id', $itemId);

        return $stmt->execute();
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
