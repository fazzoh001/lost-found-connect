<?php
class User {
    private $conn;
    private $table = "users";
    private $profiles_table = "profiles";
    private $roles_table = "user_roles";

    public $id;
    public $email;
    public $password;
    public $full_name;
    public $created_at;

    public function __construct($db) {
        $this->conn = $db;
    }

    // Register new user
    public function register() {
        // Check if email exists
        $checkQuery = "SELECT id FROM " . $this->table . " WHERE email = :email";
        $checkStmt = $this->conn->prepare($checkQuery);
        $checkStmt->bindParam(':email', $this->email);
        $checkStmt->execute();
        
        if ($checkStmt->rowCount() > 0) {
            return ["success" => false, "message" => "Email already registered"];
        }

        // Start transaction
        $this->conn->beginTransaction();

        try {
            // Create user
            $this->id = $this->generateUUID();
            $hashedPassword = password_hash($this->password, PASSWORD_BCRYPT);
            
            $userQuery = "INSERT INTO " . $this->table . " 
                          (id, email, password, created_at) 
                          VALUES (:id, :email, :password, NOW())";
            
            $userStmt = $this->conn->prepare($userQuery);
            $userStmt->bindParam(':id', $this->id);
            $userStmt->bindParam(':email', $this->email);
            $userStmt->bindParam(':password', $hashedPassword);
            $userStmt->execute();

            // Create profile
            $profileId = $this->generateUUID();
            $profileQuery = "INSERT INTO " . $this->profiles_table . " 
                             (id, user_id, full_name, created_at, updated_at) 
                             VALUES (:id, :user_id, :full_name, NOW(), NOW())";
            
            $profileStmt = $this->conn->prepare($profileQuery);
            $profileStmt->bindParam(':id', $profileId);
            $profileStmt->bindParam(':user_id', $this->id);
            $profileStmt->bindParam(':full_name', $this->full_name);
            $profileStmt->execute();

            // Assign default role
            $roleId = $this->generateUUID();
            $roleQuery = "INSERT INTO " . $this->roles_table . " 
                          (id, user_id, role, created_at) 
                          VALUES (:id, :user_id, 'user', NOW())";
            
            $roleStmt = $this->conn->prepare($roleQuery);
            $roleStmt->bindParam(':id', $roleId);
            $roleStmt->bindParam(':user_id', $this->id);
            $roleStmt->execute();

            $this->conn->commit();
            return ["success" => true, "user_id" => $this->id];

        } catch (Exception $e) {
            $this->conn->rollBack();
            return ["success" => false, "message" => $e->getMessage()];
        }
    }

    // Login user
    public function login() {
        $query = "SELECT u.id, u.email, u.password, p.full_name 
                  FROM " . $this->table . " u
                  LEFT JOIN " . $this->profiles_table . " p ON u.id = p.user_id
                  WHERE u.email = :email";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':email', $this->email);
        $stmt->execute();

        if ($stmt->rowCount() === 0) {
            return ["success" => false, "message" => "Invalid credentials"];
        }

        $row = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!password_verify($this->password, $row['password'])) {
            return ["success" => false, "message" => "Invalid credentials"];
        }

        return [
            "success" => true,
            "user" => [
                "id" => $row['id'],
                "email" => $row['email'],
                "full_name" => $row['full_name']
            ]
        ];
    }

    // Get user by ID
    public function getById($userId) {
        $query = "SELECT u.id, u.email, p.full_name, p.phone, p.avatar_url, p.preferred_language
                  FROM " . $this->table . " u
                  LEFT JOIN " . $this->profiles_table . " p ON u.id = p.user_id
                  WHERE u.id = :id";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':id', $userId);
        $stmt->execute();

        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    // Check if user has role
    public function hasRole($userId, $role) {
        $query = "SELECT id FROM " . $this->roles_table . " 
                  WHERE user_id = :user_id AND role = :role";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':user_id', $userId);
        $stmt->bindParam(':role', $role);
        $stmt->execute();

        return $stmt->rowCount() > 0;
    }

    // Update profile
    public function updateProfile($userId, $data) {
        $query = "UPDATE " . $this->profiles_table . " 
                  SET full_name = :full_name, 
                      phone = :phone, 
                      preferred_language = :language,
                      updated_at = NOW()
                  WHERE user_id = :user_id";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':full_name', $data['full_name']);
        $stmt->bindParam(':phone', $data['phone']);
        $stmt->bindParam(':language', $data['preferred_language']);
        $stmt->bindParam(':user_id', $userId);

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
