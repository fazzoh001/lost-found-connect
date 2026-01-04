<?php
/**
 * Authentication Middleware
 * Server-side authorization checks for PHP API endpoints
 */

require_once __DIR__ . '/../config/jwt.php';
require_once __DIR__ . '/../config/database.php';

/**
 * Get the authenticated user from JWT token
 * @return array|null User payload from JWT or null if not authenticated
 */
function getAuthenticatedUser() {
    return JWT::getAuthUser();
}

/**
 * Require authentication - exits with 401 if not authenticated
 * @return array The authenticated user payload
 */
function requireAuth() {
    $user = getAuthenticatedUser();
    
    if (!$user) {
        http_response_code(401);
        echo json_encode(["error" => "Authentication required"]);
        exit;
    }
    
    return $user;
}

/**
 * Check if a user has a specific role by querying the database
 * IMPORTANT: This queries the database directly, not trusting client claims
 * @param string $userId The user ID to check
 * @param string $role The role to check for
 * @return bool True if user has the role
 */
function userHasRole($userId, $role) {
    $database = new Database();
    $db = $database->getConnection();
    
    $query = "SELECT id FROM user_roles WHERE user_id = :user_id AND role = :role";
    $stmt = $db->prepare($query);
    $stmt->bindParam(':user_id', $userId);
    $stmt->bindParam(':role', $role);
    $stmt->execute();
    
    return $stmt->rowCount() > 0;
}

/**
 * Require admin role - exits with 403 if not admin
 * IMPORTANT: Always queries the database to verify admin status
 * Never trusts the JWT claims for admin role
 * @return array The authenticated user payload
 */
function requireAdmin() {
    $user = requireAuth();
    
    // CRITICAL: Query database directly for admin role verification
    // Never trust the is_admin claim from JWT token
    if (!userHasRole($user['user_id'], 'admin')) {
        http_response_code(403);
        echo json_encode(["error" => "Admin access required"]);
        exit;
    }
    
    return $user;
}

/**
 * Check if authenticated user is the owner of a resource OR is an admin
 * @param string $resourceUserId The user_id that owns the resource
 * @return bool True if user is owner or admin
 */
function isOwnerOrAdmin($resourceUserId) {
    $user = getAuthenticatedUser();
    
    if (!$user) {
        return false;
    }
    
    // Check if user is the owner
    if ($user['user_id'] === $resourceUserId) {
        return true;
    }
    
    // Check if user is admin (from database, not JWT)
    return userHasRole($user['user_id'], 'admin');
}

/**
 * Require owner or admin access - exits with 403 if neither
 * @param string $resourceUserId The user_id that owns the resource
 * @return array The authenticated user payload
 */
function requireOwnerOrAdmin($resourceUserId) {
    $user = requireAuth();
    
    if ($user['user_id'] !== $resourceUserId && !userHasRole($user['user_id'], 'admin')) {
        http_response_code(403);
        echo json_encode(["error" => "Access denied. You must be the owner or an admin."]);
        exit;
    }
    
    return $user;
}
?>
