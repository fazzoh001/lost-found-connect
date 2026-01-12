<?php
/**
 * Notification Service for sending email notifications
 */

require_once __DIR__ . '/Mailer.php';
require_once __DIR__ . '/../config/mail.php';

class NotificationService {
    private $mailer;
    private $db;
    
    public function __construct($db) {
        $this->db = $db;
        $this->mailer = new Mailer();
    }
    
    /**
     * Send notification when items are matched
     */
    public function sendMatchNotification($matchId, $lostItem, $foundItem, $matchScore) {
        // Get user details for both items
        $lostItemUser = $this->getUserById($lostItem['user_id']);
        $foundItemUser = $this->getUserById($foundItem['user_id']);
        
        if (!$lostItemUser || !$foundItemUser) {
            error_log("Could not find users for match notification");
            return false;
        }
        
        // Send email to the person who lost the item
        $this->sendMatchEmailToLostItemOwner(
            $lostItemUser,
            $lostItem,
            $foundItem,
            $matchScore
        );
        
        // Send email to the person who found the item
        $this->sendMatchEmailToFoundItemOwner(
            $foundItemUser,
            $lostItem,
            $foundItem,
            $matchScore
        );
        
        return true;
    }
    
    /**
     * Send email to person who lost their item
     */
    private function sendMatchEmailToLostItemOwner($user, $lostItem, $foundItem, $matchScore) {
        $subject = "🎉 Good News! Potential Match Found for Your Lost " . $lostItem['title'];
        
        $html = $this->buildMatchEmailHtml([
            'recipientName' => $user['full_name'] ?: $user['email'],
            'recipientType' => 'lost',
            'lostItem' => $lostItem,
            'foundItem' => $foundItem,
            'matchScore' => $matchScore
        ]);
        
        return $this->mailer->send(
            $user['email'],
            $user['full_name'] ?: 'User',
            $subject,
            $html
        );
    }
    
    /**
     * Send email to person who found an item
     */
    private function sendMatchEmailToFoundItemOwner($user, $lostItem, $foundItem, $matchScore) {
        $subject = "🔔 Match Alert! Your Found " . $foundItem['title'] . " May Belong to Someone";
        
        $html = $this->buildMatchEmailHtml([
            'recipientName' => $user['full_name'] ?: $user['email'],
            'recipientType' => 'found',
            'lostItem' => $lostItem,
            'foundItem' => $foundItem,
            'matchScore' => $matchScore
        ]);
        
        return $this->mailer->send(
            $user['email'],
            $user['full_name'] ?: 'User',
            $subject,
            $html
        );
    }
    
    /**
     * Build the match notification email HTML
     */
    private function buildMatchEmailHtml($data) {
        $appUrl = MailConfig::$appUrl;
        $appName = MailConfig::$appName;
        $recipientName = htmlspecialchars($data['recipientName']);
        $lostItem = $data['lostItem'];
        $foundItem = $data['foundItem'];
        $matchScore = $data['matchScore'];
        $isLostOwner = $data['recipientType'] === 'lost';
        
        $matchPercentage = round($matchScore);
        $matchColor = $matchScore >= 80 ? '#22c55e' : ($matchScore >= 60 ? '#eab308' : '#f97316');
        
        $introText = $isLostOwner
            ? "Great news! We found a potential match for your lost item."
            : "Someone may be looking for the item you found!";
        
        $actionText = $isLostOwner
            ? "Check if this is your item and contact the finder to arrange a return."
            : "Review the details and help reunite this item with its owner.";
        
        return <<<HTML
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Match Found - {$appName}</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f5;">
    <table role="presentation" style="width: 100%; border-collapse: collapse;">
        <tr>
            <td align="center" style="padding: 40px 20px;">
                <table role="presentation" style="width: 100%; max-width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                    <!-- Header -->
                    <tr>
                        <td style="padding: 40px 40px 20px; text-align: center; background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%); border-radius: 12px 12px 0 0;">
                            <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">🎯 Match Found!</h1>
                            <p style="margin: 10px 0 0; color: rgba(255,255,255,0.9); font-size: 16px;">{$introText}</p>
                        </td>
                    </tr>
                    
                    <!-- Match Score -->
                    <tr>
                        <td style="padding: 30px 40px 20px; text-align: center;">
                            <div style="display: inline-block; padding: 15px 30px; background-color: {$matchColor}; border-radius: 50px;">
                                <span style="color: #ffffff; font-size: 24px; font-weight: 700;">{$matchPercentage}% Match</span>
                            </div>
                        </td>
                    </tr>
                    
                    <!-- Greeting -->
                    <tr>
                        <td style="padding: 20px 40px;">
                            <p style="margin: 0; color: #374151; font-size: 16px;">Hi {$recipientName},</p>
                            <p style="margin: 15px 0 0; color: #6b7280; font-size: 15px; line-height: 1.6;">{$actionText}</p>
                        </td>
                    </tr>
                    
                    <!-- Items Comparison -->
                    <tr>
                        <td style="padding: 20px 40px;">
                            <table role="presentation" style="width: 100%; border-collapse: collapse;">
                                <tr>
                                    <!-- Lost Item -->
                                    <td style="width: 48%; vertical-align: top; padding: 15px; background-color: #fef2f2; border-radius: 8px;">
                                        <h3 style="margin: 0 0 10px; color: #dc2626; font-size: 14px; text-transform: uppercase;">Lost Item</h3>
                                        <p style="margin: 0 0 5px; color: #374151; font-size: 16px; font-weight: 600;">{$lostItem['title']}</p>
                                        <p style="margin: 0 0 5px; color: #6b7280; font-size: 13px;">📂 {$lostItem['category']}</p>
                                        <p style="margin: 0 0 5px; color: #6b7280; font-size: 13px;">📍 {$lostItem['location']}</p>
                                        <p style="margin: 0; color: #6b7280; font-size: 13px;">📅 {$lostItem['date_occurred']}</p>
                                    </td>
                                    
                                    <!-- Spacer -->
                                    <td style="width: 4%;"></td>
                                    
                                    <!-- Found Item -->
                                    <td style="width: 48%; vertical-align: top; padding: 15px; background-color: #f0fdf4; border-radius: 8px;">
                                        <h3 style="margin: 0 0 10px; color: #16a34a; font-size: 14px; text-transform: uppercase;">Found Item</h3>
                                        <p style="margin: 0 0 5px; color: #374151; font-size: 16px; font-weight: 600;">{$foundItem['title']}</p>
                                        <p style="margin: 0 0 5px; color: #6b7280; font-size: 13px;">📂 {$foundItem['category']}</p>
                                        <p style="margin: 0 0 5px; color: #6b7280; font-size: 13px;">📍 {$foundItem['location']}</p>
                                        <p style="margin: 0; color: #6b7280; font-size: 13px;">📅 {$foundItem['date_occurred']}</p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    
                    <!-- CTA Button -->
                    <tr>
                        <td style="padding: 30px 40px; text-align: center;">
                            <a href="{$appUrl}/matching" style="display: inline-block; padding: 14px 35px; background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%); color: #ffffff; text-decoration: none; font-size: 16px; font-weight: 600; border-radius: 8px;">View Match Details</a>
                        </td>
                    </tr>
                    
                    <!-- Tips -->
                    <tr>
                        <td style="padding: 20px 40px; background-color: #f9fafb;">
                            <h4 style="margin: 0 0 10px; color: #374151; font-size: 14px;">💡 Tips for a Safe Exchange:</h4>
                            <ul style="margin: 0; padding-left: 20px; color: #6b7280; font-size: 13px; line-height: 1.8;">
                                <li>Meet in a public, well-lit place</li>
                                <li>Verify the item before completing the exchange</li>
                                <li>Ask for identifying details only the owner would know</li>
                            </ul>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="padding: 30px 40px; text-align: center; border-top: 1px solid #e5e7eb;">
                            <p style="margin: 0 0 10px; color: #9ca3af; font-size: 13px;">This email was sent by {$appName}</p>
                            <p style="margin: 0; color: #9ca3af; font-size: 12px;">© 2024 {$appName}. All rights reserved.</p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
HTML;
    }
    
    /**
     * Get user by ID
     */
    private function getUserById($userId) {
        try {
            $query = "SELECT id, email, full_name FROM users WHERE id = :id";
            $stmt = $this->db->prepare($query);
            $stmt->bindParam(':id', $userId);
            $stmt->execute();
            return $stmt->fetch(PDO::FETCH_ASSOC);
        } catch (Exception $e) {
            error_log("Error fetching user: " . $e->getMessage());
            return null;
        }
    }
}
?>
