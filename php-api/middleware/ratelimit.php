<?php
/**
 * Rate Limiting Middleware
 * Simple IP-based rate limiting for PHP API endpoints
 */

class RateLimiter {
    private $cacheDir;
    private $maxRequests;
    private $windowSeconds;
    
    public function __construct($maxRequests = 100, $windowSeconds = 3600) {
        $this->maxRequests = $maxRequests;
        $this->windowSeconds = $windowSeconds;
        $this->cacheDir = sys_get_temp_dir() . '/rate_limit_cache/';
        
        if (!is_dir($this->cacheDir)) {
            mkdir($this->cacheDir, 0755, true);
        }
    }
    
    /**
     * Get client IP address
     */
    private function getClientIp() {
        $headers = ['HTTP_CF_CONNECTING_IP', 'HTTP_X_FORWARDED_FOR', 'HTTP_X_REAL_IP', 'REMOTE_ADDR'];
        
        foreach ($headers as $header) {
            if (!empty($_SERVER[$header])) {
                $ip = $_SERVER[$header];
                // Handle comma-separated list (X-Forwarded-For)
                if (strpos($ip, ',') !== false) {
                    $ip = trim(explode(',', $ip)[0]);
                }
                // Validate IP format
                if (filter_var($ip, FILTER_VALIDATE_IP)) {
                    return $ip;
                }
            }
        }
        
        return '127.0.0.1';
    }
    
    /**
     * Get rate limit data for an IP
     */
    private function getRateLimitData($ip, $endpoint) {
        $key = md5($ip . '_' . $endpoint);
        $file = $this->cacheDir . $key . '.json';
        
        if (file_exists($file)) {
            $data = json_decode(file_get_contents($file), true);
            
            // Check if window has expired
            if (time() > $data['reset_time']) {
                return [
                    'count' => 0,
                    'reset_time' => time() + $this->windowSeconds
                ];
            }
            
            return $data;
        }
        
        return [
            'count' => 0,
            'reset_time' => time() + $this->windowSeconds
        ];
    }
    
    /**
     * Save rate limit data for an IP
     */
    private function saveRateLimitData($ip, $endpoint, $data) {
        $key = md5($ip . '_' . $endpoint);
        $file = $this->cacheDir . $key . '.json';
        file_put_contents($file, json_encode($data));
    }
    
    /**
     * Check rate limit and increment counter
     * Returns true if request is allowed, false if rate limited
     */
    public function checkLimit($endpoint = 'default') {
        $ip = $this->getClientIp();
        $data = $this->getRateLimitData($ip, $endpoint);
        
        // Increment counter
        $data['count']++;
        
        // Save updated data
        $this->saveRateLimitData($ip, $endpoint, $data);
        
        // Set rate limit headers
        header('X-RateLimit-Limit: ' . $this->maxRequests);
        header('X-RateLimit-Remaining: ' . max(0, $this->maxRequests - $data['count']));
        header('X-RateLimit-Reset: ' . $data['reset_time']);
        
        // Check if over limit
        if ($data['count'] > $this->maxRequests) {
            return false;
        }
        
        return true;
    }
    
    /**
     * Enforce rate limit - exits with 429 if exceeded
     */
    public function enforce($endpoint = 'default') {
        if (!$this->checkLimit($endpoint)) {
            http_response_code(429);
            header('Retry-After: ' . $this->windowSeconds);
            echo json_encode([
                'error' => 'Rate limit exceeded. Please try again later.',
                'retry_after' => $this->windowSeconds
            ]);
            exit;
        }
    }
}

/**
 * Quick rate limit check function
 * @param int $maxRequests Maximum requests allowed
 * @param int $windowSeconds Time window in seconds
 * @param string $endpoint Endpoint identifier for separate limits
 */
function rateLimit($maxRequests = 100, $windowSeconds = 3600, $endpoint = 'default') {
    $limiter = new RateLimiter($maxRequests, $windowSeconds);
    $limiter->enforce($endpoint);
}
?>
