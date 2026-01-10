<?php
/**
 * Admin User Creation Script
 * Run this script to create or reset the admin user
 * 
 * Usage: php create-admin.php
 * Or access via browser: http://localhost/php-api/scripts/create-admin.php
 */

require_once __DIR__ . '/../config/database.php';

// Admin credentials
$adminEmail = 'admin@findit.local';
$adminPassword = 'F1nd!t@Adm1n#2024'; // Strong password - change after first login!
$adminName = 'System Admin';

try {
    $database = new Database();
    $db = $database->getConnection();
    
    // Generate proper bcrypt hash
    $hashedPassword = password_hash($adminPassword, PASSWORD_BCRYPT);
    
    echo "<pre>\n";
    echo "=== FindIt Admin Creation Script ===\n\n";
    
    // Check if admin exists
    $checkQuery = "SELECT id FROM users WHERE email = :email";
    $checkStmt = $db->prepare($checkQuery);
    $checkStmt->bindParam(':email', $adminEmail);
    $checkStmt->execute();
    
    if ($checkStmt->rowCount() > 0) {
        // Update existing admin password
        $row = $checkStmt->fetch(PDO::FETCH_ASSOC);
        $adminId = $row['id'];
        
        $updateQuery = "UPDATE users SET password = :password WHERE id = :id";
        $updateStmt = $db->prepare($updateQuery);
        $updateStmt->bindParam(':password', $hashedPassword);
        $updateStmt->bindParam(':id', $adminId);
        $updateStmt->execute();
        
        echo "✓ Admin user password updated!\n";
    } else {
        // Create new admin user
        $adminId = 'admin-uuid-0001';
        
        $db->beginTransaction();
        
        // Create user
        $userQuery = "INSERT INTO users (id, email, password, created_at) VALUES (:id, :email, :password, NOW())";
        $userStmt = $db->prepare($userQuery);
        $userStmt->bindParam(':id', $adminId);
        $userStmt->bindParam(':email', $adminEmail);
        $userStmt->bindParam(':password', $hashedPassword);
        $userStmt->execute();
        
        // Create profile
        $profileId = 'profile-uuid-0001';
        $profileQuery = "INSERT INTO profiles (id, user_id, full_name, created_at, updated_at) VALUES (:id, :user_id, :full_name, NOW(), NOW())";
        $profileStmt = $db->prepare($profileQuery);
        $profileStmt->bindParam(':id', $profileId);
        $profileStmt->bindParam(':user_id', $adminId);
        $profileStmt->bindParam(':full_name', $adminName);
        $profileStmt->execute();
        
        // Assign admin role
        $roleId = 'role-uuid-0001';
        $roleQuery = "INSERT INTO user_roles (id, user_id, role, created_at) VALUES (:id, :user_id, 'admin', NOW())";
        $roleStmt = $db->prepare($roleQuery);
        $roleStmt->bindParam(':id', $roleId);
        $roleStmt->bindParam(':user_id', $adminId);
        $roleStmt->execute();
        
        $db->commit();
        
        echo "✓ Admin user created!\n";
    }
    
    echo "\n=== Admin Credentials ===\n";
    echo "Email:    $adminEmail\n";
    echo "Password: $adminPassword\n";
    echo "\n⚠️  IMPORTANT: Change this password after first login!\n";
    echo "\nHash generated: " . substr($hashedPassword, 0, 30) . "...\n";
    echo "</pre>";
    
} catch (Exception $e) {
    echo "<pre>\n";
    echo "❌ Error: " . $e->getMessage() . "\n";
    echo "</pre>";
}
?>
