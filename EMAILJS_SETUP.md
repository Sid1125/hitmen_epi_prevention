# EmailJS Setup Instructions

This project uses EmailJS to send welcome emails to new users. Follow these steps to set it up:

## 1. Create an EmailJS Account

1. Go to [EmailJS.com](https://www.emailjs.com/)
2. Sign up for a free account
3. Verify your email address

## 2. Set Up Email Service

1. In your EmailJS dashboard, go to **Email Services**
2. Click **Add New Service**
3. Choose your email provider (Gmail, Outlook, etc.)
4. Follow the setup instructions for your provider
5. Note down your **Service ID** (it will look like `service_xxxxxxx`)

## 3. Create Email Template

1. Go to **Email Templates** in your dashboard
2. Click **Create New Template**
3. Use this template content:

### Subject Line:
```
{{subject}}
```

### Email Body:
```html
{{{message_html}}}
```

### Template Variables:
The template should include these variables:
- `to_email`
- `to_name` 
- `subject`
- `username`
- `username_upper`
- `email`
- `role`
- `clearance`
- `created_at`
- `message_html`

4. Save the template and note down your **Template ID** (it will look like `template_xxxxxxx`)

## 4. Get Your Public Key

1. Go to **Account** → **General**
2. Find your **Public Key** (it will look like a random string)

## 5. Update Configuration

Update the configuration in `src/services/emailService.ts`:

```typescript
// EmailJS configuration
const SERVICE_ID = 'your_service_id_here'; // Replace with your Service ID
const TEMPLATE_ID = 'your_template_id_here'; // Replace with your Template ID  
const PUBLIC_KEY = 'your_public_key_here'; // Replace with your Public Key
```

## 6. Test the Setup

1. Try registering a new user
2. Check the browser console for any EmailJS errors
3. Check your email for the welcome message

## Security Notes

- The Public Key is safe to use in frontend code
- Your email service credentials are stored securely with EmailJS
- The template generates HTML content dynamically for each user

## Troubleshooting

### Common Issues:

1. **EmailJS not configured**: Make sure all three IDs are updated from their placeholder values
2. **Template not found**: Verify your Template ID is correct
3. **Service not found**: Verify your Service ID is correct
4. **Emails not sending**: Check your email service configuration in EmailJS dashboard

### Debug Information:

The `emailService.getConfigStatus()` method provides debugging information:

```javascript
import { emailService } from './services/emailService';
console.log(emailService.getConfigStatus());
```

## Email Template Features

The welcome email includes:
- HITMEN branding and styling
- User credentials (username, email, clearance level)
- Registration timestamp
- Mission briefing
- Access protocols
- Security notices
- Important links

The email is styled with a dark theme using green text on black background to match the HITMEN aesthetic.
