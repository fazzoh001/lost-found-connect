<?php
/**
 * Email Configuration for PHPMailer with Gmail SMTP
 * 
 * IMPORTANT: To use Gmail SMTP, you need to:
 * 1. Enable 2-Factor Authentication on your Gmail account
 * 2. Generate an App Password at: https://myaccount.google.com/apppasswords
 * 3. Use the App Password (not your regular Gmail password) below
 */

class MailConfig {
    // Gmail SMTP Settings
    public static $host = 'smtp.gmail.com';
    public static $port = 587;
    public static $encryption = 'tls'; // Use 'ssl' for port 465
    
    // Your Gmail Credentials
    // CHANGE THESE TO YOUR GMAIL CREDENTIALS
    public static $username = 'your-email@gmail.com';  // Your Gmail address
    public static $password = 'your-app-password';      // Your Gmail App Password (16 characters)
    
    // Sender Information
    public static $fromEmail = 'your-email@gmail.com';  // Same as username
    public static $fromName = 'FindIt Lost & Found';
    
    // App Settings
    public static $appName = 'FindIt';
    public static $appUrl = 'http://localhost:5173';    // Change to your app URL
    
    /**
     * Check if mail is properly configured
     */
    public static function isConfigured() {
        return self::$username !== 'your-email@gmail.com' 
            && self::$password !== 'your-app-password';
    }
}
?>
