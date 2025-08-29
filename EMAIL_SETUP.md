# Email Setup Guide

## Quick Setup for Gmail

1. **Enable 2-Factor Authentication** on your Gmail account
2. **Generate an App Password**:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate a password for "Mail"
3. **Update your .env file**:

```env
# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-16-digit-app-password
```

## Alternative: Use a Free Email Service

### Option 1: Ethereal Email (for testing)

```env
SMTP_HOST=smtp.ethereal.email
SMTP_PORT=587
SMTP_USER=your-ethereal-email
SMTP_PASS=your-ethereal-password
```

### Option 2: Mailtrap (for testing)

```env
SMTP_HOST=smtp.mailtrap.io
SMTP_PORT=2525
SMTP_USER=your-mailtrap-user
SMTP_PASS=your-mailtrap-password
```

## Testing the Email Service

1. Start the backend server: `npm run start:dev`
2. The verification codes will be logged to the console
3. Check your email inbox for verification emails

## Troubleshooting

- **"Authentication failed"**: Check your SMTP credentials
- **"Connection timeout"**: Verify SMTP host and port
- **"Invalid credentials"**: Ensure you're using an app password, not your regular password
