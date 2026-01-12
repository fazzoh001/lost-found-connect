<?php
/**
 * PHPMailer Service for sending emails
 * 
 * Download PHPMailer: https://github.com/PHPMailer/PHPMailer
 * Extract to: php-api/vendor/phpmailer/
 */

require_once __DIR__ . '/../config/mail.php';

// Include PHPMailer classes
// You need to download PHPMailer and place it in vendor/phpmailer/
require_once __DIR__ . '/../vendor/phpmailer/src/Exception.php';
require_once __DIR__ . '/../vendor/phpmailer/src/PHPMailer.php';
require_once __DIR__ . '/../vendor/phpmailer/src/SMTP.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;
use PHPMailer\PHPMailer\SMTP;

class Mailer {
    private $mail;
    
    public function __construct() {
        $this->mail = new PHPMailer(true);
        $this->configure();
    }
    
    /**
     * Configure PHPMailer with Gmail SMTP settings
     */
    private function configure() {
        try {
            // Server settings
            $this->mail->isSMTP();
            $this->mail->Host = MailConfig::$host;
            $this->mail->SMTPAuth = true;
            $this->mail->Username = MailConfig::$username;
            $this->mail->Password = MailConfig::$password;
            $this->mail->SMTPSecure = MailConfig::$encryption;
            $this->mail->Port = MailConfig::$port;
            
            // Sender
            $this->mail->setFrom(MailConfig::$fromEmail, MailConfig::$fromName);
            
            // Content settings
            $this->mail->isHTML(true);
            $this->mail->CharSet = 'UTF-8';
            
        } catch (Exception $e) {
            error_log("Mailer configuration error: " . $e->getMessage());
        }
    }
    
    /**
     * Send an email
     */
    public function send($to, $toName, $subject, $htmlBody, $textBody = '') {
        try {
            if (!MailConfig::isConfigured()) {
                error_log("Email not configured. Please update config/mail.php");
                return false;
            }
            
            $this->mail->clearAddresses();
            $this->mail->addAddress($to, $toName);
            
            $this->mail->Subject = $subject;
            $this->mail->Body = $htmlBody;
            $this->mail->AltBody = $textBody ?: strip_tags($htmlBody);
            
            $this->mail->send();
            return true;
            
        } catch (Exception $e) {
            error_log("Email sending failed: " . $this->mail->ErrorInfo);
            return false;
        }
    }
    
    /**
     * Get the last error message
     */
    public function getError() {
        return $this->mail->ErrorInfo;
    }
}
?>
