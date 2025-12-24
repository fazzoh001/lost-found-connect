<?php
/**
 * Database Configuration
 * Update these values to match your XAMPP MySQL setup
 */

class Database {
    private $host = "localhost";
    private $database = "findit_db";
    private $username = "root";
    private $password = ""; // Default XAMPP MySQL has no password
    private $conn;

    public function getConnection() {
        $this->conn = null;

        try {
            $this->conn = new PDO(
                "mysql:host=" . $this->host . ";dbname=" . $this->database,
                $this->username,
                $this->password
            );
            $this->conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            $this->conn->exec("set names utf8");
        } catch(PDOException $e) {
            echo json_encode(["error" => "Database connection failed: " . $e->getMessage()]);
            exit;
        }

        return $this->conn;
    }
}
?>
