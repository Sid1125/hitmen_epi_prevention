import emailjs from '@emailjs/browser';

// EmailJS configuration
const SERVICE_ID = 'service_hitmen'; // You'll need to set this up in EmailJS
const TEMPLATE_ID = 'template_8zjsoif'; // You'll need to create this template in EmailJS
const PUBLIC_KEY = 'qZtGBeQfeede1OK2j'; // You'll need to get this from EmailJS

interface EmailData {
  to_email: string;
  to_name: string;
  username: string;
  username_upper: string;
  email: string;
  role: string;
  clearance: string;
  created_at: string;
  subject: string;
}

class EmailService {
  private initialized = false;

  constructor() {
    this.init();
  }

  private init() {
    try {
      // Initialize EmailJS with your public key
      emailjs.init(PUBLIC_KEY);
      this.initialized = true;
    } catch (error) {
      console.error('Failed to initialize EmailJS:', error);
    }
  }

  async sendWelcomeEmail(emailData: EmailData): Promise<boolean> {
    if (!this.initialized) {
      return false;
    }

    try {
      // Template parameters for EmailJS
      const templateParams = {
        to_email: emailData.to_email,
        to_name: emailData.to_name,
        subject: emailData.subject,
        username: emailData.username,
        username_upper: emailData.username_upper,
        email: emailData.email,
        role: emailData.role,
        clearance: emailData.clearance,
        created_at: emailData.created_at,
        // Custom HTML content
        message_html: this.generateWelcomeEmailHTML(emailData)
      };

      await emailjs.send(
        SERVICE_ID,
        TEMPLATE_ID,
        templateParams
      );

      return true;
    } catch (error) {
      console.error('Failed to send welcome email:', error);
      return false;
    }
  }

  private generateWelcomeEmailHTML(data: EmailData): string {
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            background-color: #f5f5f5;
            color: #333;
            margin: 0;
            padding: 20px;
            line-height: 1.6;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border: 1px solid #ddd;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            padding: 0;
            overflow: hidden;
        }
        .header {
            background-color: #2c3e50;
            color: white;
            text-align: center;
            padding: 30px;
            margin-bottom: 0;
        }
        .logo {
            font-size: 28px;
            font-weight: bold;
            color: #ffffff;
            margin-bottom: 10px;
        }
        .classification {
            color: #e74c3c;
            font-size: 12px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        .content {
            padding: 30px;
            line-height: 1.6;
        }
        .info-box {
            background-color: #f8f9fa;
            border: 1px solid #e9ecef;
            border-radius: 6px;
            padding: 20px;
            margin: 20px 0;
        }
        .info-row {
            margin: 10px 0;
            display: flex;
            align-items: center;
        }
        .label {
            color: #2c3e50;
            font-weight: 600;
            display: inline-block;
            width: 120px;
            flex-shrink: 0;
        }
        .footer {
            background-color: #ecf0f1;
            border-top: 1px solid #bdc3c7;
            padding: 20px 30px;
            text-align: center;
            font-size: 12px;
            color: #7f8c8d;
            margin-top: 0;
        }
        .warning {
            background-color: #fff3cd;
            border: 1px solid #ffeaa7;
            border-radius: 6px;
            color: #856404;
            font-weight: 600;
            text-align: center;
            padding: 15px;
            margin: 20px 0;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">🕶️ HITMEN</div>
            <div class="classification">CLASSIFIED INTELLIGENCE NETWORK</div>
        </div>
        
        <div class="content">
            <h3>OPERATIVE REGISTRATION CONFIRMED</h3>
            
            <p>Greetings, Agent <strong>${data.username_upper}</strong>,</p>
            
            <p>Your registration with the HITMEN Intelligence Forum has been successfully processed. You have been granted <strong>${data.clearance} CLEARANCE</strong> to access classified community intelligence reports and coordinate operations against harmful content targeting minors.</p>
            
            <div class="info-box">
                <h4>🔐 OPERATIVE CREDENTIALS</h4>
                <div class="info-row">
                    <span class="label">USERNAME:</span> ${data.username}
                </div>
                <div class="info-row">
                    <span class="label">EMAIL:</span> ${data.email}
                </div>
                <div class="info-row">
                    <span class="label">CLEARANCE:</span> ${data.clearance}
                </div>
                <div class="info-row">
                    <span class="label">STATUS:</span> ACTIVE
                </div>
                <div class="info-row">
                    <span class="label">REGISTRATION:</span> ${data.created_at}
                </div>
            </div>
            
            <h4>🎯 MISSION BRIEFING</h4>
            <p>As a HITMEN operative, your primary objectives include:</p>
            <ul>
                <li><strong>INTELLIGENCE GATHERING:</strong> Monitor and identify accounts spreading inappropriate content to minors</li>
                <li><strong>COMMUNITY COORDINATION:</strong> Share findings with fellow operatives through secure forum channels</li>
                <li><strong>MASS REPORTING:</strong> Participate in coordinated takedown operations when targets are identified</li>
                <li><strong>OPERATIONAL SECURITY:</strong> Maintain discretion and follow established protocols</li>
            </ul>
            
            <h4>📡 ACCESS PROTOCOL</h4>
            <p>To access the classified intelligence forum:</p>
            <ol>
                <li>Navigate to the INTEL section on the HITMEN platform</li>
                <li>Use your registered credentials to authenticate</li>
                <li>Review active intelligence reports and community findings</li>
                <li>Submit new reports using the "NEW REPORT" function</li>
                <li>Participate in operative communications as needed</li>
            </ol>
            
            <div class="warning">
                ⚠️ SECURITY NOTICE ⚠️<br>
                Your account credentials are for authorized access only. Do not share your login information. Report any suspicious activity immediately.
            </div>
            
            <h4>🔗 IMPORTANT LINKS</h4>
            <p>
                • Instagram: <a href="https://instagram.com/you.are.a.hitman" style="color: #2c3e50; text-decoration: none; font-weight: 600;">@you.are.a.hitman</a><br>
                • Discord: <a href="https://discord.gg/htmn" style="color: #2c3e50; text-decoration: none; font-weight: 600;">discord.gg/htmn</a><br>
                • Forum: Access via INTEL section
            </p>
            
            <p>Welcome to the resistance, Agent ${data.username_upper}. Your mission begins now.</p>
            
            <p style="margin-top: 30px;">
                <strong>Remember:</strong> We don't miss. We don't stop. We protect the vulnerable.
            </p>
        </div>
        
        <div class="footer">
            HITMEN INTELLIGENCE NETWORK<br>
            CLASSIFICATION: CONFIDENTIAL<br>
            AUTHORIZED PERSONNEL ONLY<br><br>
            This message was generated automatically. Do not reply to this email.
        </div>
    </div>
</body>
</html>`;
  }

  // Check if EmailJS is properly configured
  isConfigured(): boolean {
    return SERVICE_ID && SERVICE_ID.trim() !== '' &&
           TEMPLATE_ID && TEMPLATE_ID.trim() !== '' &&
           PUBLIC_KEY && PUBLIC_KEY.trim() !== '' &&
           this.initialized;
  }

  // Get configuration status for debugging
  getConfigStatus(): { configured: boolean; message: string } {
    if (!this.initialized) {
      return { configured: false, message: 'EmailJS failed to initialize' };
    }
    
    if (!SERVICE_ID || SERVICE_ID.trim() === '' || 
        !TEMPLATE_ID || TEMPLATE_ID.trim() === '' || 
        !PUBLIC_KEY || PUBLIC_KEY.trim() === '') {
      return { 
        configured: false, 
        message: 'EmailJS not configured. Please set up SERVICE_ID, TEMPLATE_ID, and PUBLIC_KEY' 
      };
    }
    
    return { configured: true, message: 'EmailJS configured and ready' };
  }
}

export const emailService = new EmailService();
export type { EmailData };
