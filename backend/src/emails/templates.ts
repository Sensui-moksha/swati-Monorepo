/**
 * Email Templates
 * HTML and text templates for all authentication-related emails
 */

interface EmailTemplateData {
  name?: string;
  email?: string;
  otp?: string;
  verificationUrl?: string;
  resetUrl?: string;
  loginUrl?: string;
  expiryMinutes?: number;
  deviceInfo?: string;
  location?: string;
  ipAddress?: string;
  timestamp?: string;
  backupCodes?: string[];
  supportEmail?: string;
  appName?: string;
  appUrl?: string;
  purpose?: string;
  event?: string;
  oldEmail?: string;
  newEmail?: string;
  reason?: string;
  reactivateUrl?: string;
}

const APP_NAME = process.env.APP_NAME || "Prototype v0";
const APP_URL = process.env.APP_URL || "http://localhost:3000";
const SUPPORT_EMAIL = process.env.SUPPORT_EMAIL || "support@example.com";

/**
 * Base email layout wrapper
 */
function baseLayout(content: string, data: EmailTemplateData): string {
  const { appName = APP_NAME, appUrl = APP_URL } = data;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${appName}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif; line-height: 1.6; color: #1a1a2e; background-color: #f4f4f4; }
    .email-wrapper { max-width: 600px; margin: 0 auto; padding: 20px; }
    .email-container { background: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.07); overflow: hidden; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px 20px; text-align: center; }
    .header h1 { color: #ffffff; font-size: 28px; font-weight: 700; letter-spacing: -0.5px; }
    .content { padding: 40px 30px; }
    .content h2 { font-size: 24px; font-weight: 600; color: #1a1a2e; margin-bottom: 16px; }
    .content p { font-size: 16px; color: #4a4a6a; margin-bottom: 16px; }
    .content .highlight { background: #f0f4ff; border-left: 4px solid #667eea; padding: 16px; border-radius: 0 8px 8px 0; margin: 24px 0; }
    .button { display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff !important; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px; margin: 16px 0; transition: transform 0.2s, box-shadow 0.2s; }
    .button:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4); }
    .otp-code { font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Fira Mono', monospace; font-size: 32px; font-weight: 700; letter-spacing: 8px; color: #667eea; background: #f0f4ff; padding: 20px; border-radius: 12px; text-align: center; margin: 24px 0; word-break: break-all; }
    .footer { background: #f8f9fa; padding: 24px 30px; border-top: 1px solid #eaeaea; text-align: center; }
    .footer p { font-size: 13px; color: #888; margin-bottom: 8px; }
    .footer a { color: #667eea; text-decoration: none; }
    .footer a:hover { text-decoration: underline; }
    .divider { height: 1px; background: #eaeaea; margin: 24px 0; }
    .info-box { background: #fff8e1; border: 1px solid #ffe082; border-radius: 8px; padding: 16px; margin: 16px 0; }
    .info-box p { margin: 0; color: #5d4e00; font-size: 14px; }
    .security-alert { background: #fff0f0; border: 1px solid #ffcdd2; border-radius: 8px; padding: 16px; margin: 16px 0; }
    .security-alert p { margin: 0; color: #c62828; font-size: 14px; }
    .backup-codes { display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; margin: 16px 0; }
    .backup-code { background: #f5f5f5; border: 1px solid #e0e0e0; border-radius: 6px; padding: 12px; font-family: monospace; font-size: 14px; text-align: center; }
    @media only screen and (max-width: 480px) {
      .email-wrapper { padding: 10px; }
      .content { padding: 24px 20px; }
      .otp-code { font-size: 24px; letter-spacing: 4px; }
      .backup-codes { grid-template-columns: 1fr; }
    }
  </style>
</head>
<body>
  <div class="email-wrapper">
    <div class="email-container">
      <div class="header">
        <h1>${appName}</h1>
      </div>
      <div class="content">
        ${content}
      </div>
      <div class="footer">
        <p>© ${new Date().getFullYear()} ${appName}. All rights reserved.</p>
        <p><a href="${appUrl}">${appUrl}</a> | <a href="mailto:${SUPPORT_EMAIL}">${SUPPORT_EMAIL}</a></p>
        <p>If you didn't request this email, please ignore it or contact support.</p>
      </div>
    </div>
  </div>
</body>
</html>
`;
}

/**
 * Plain text version of base layout
 */
function baseLayoutText(content: string, data: EmailTemplateData): string {
  const { appName = APP_NAME, appUrl = APP_URL } = data;

  return `
${appName}
${"=".repeat(appName.length)}

${content}

---
© ${new Date().getFullYear()} ${appName}. All rights reserved.
${appUrl} | ${SUPPORT_EMAIL}

If you didn't request this email, please ignore it or contact support.
`;
}

/**
 * Email Verification Template
 */
export function emailVerificationTemplate(data: EmailTemplateData): {
  html: string;
  text: string;
} {
  const {
    name = "User",
    verificationUrl,
    expiryMinutes = 10,
    appName = APP_NAME,
  } = data;

  const htmlContent = `
    <h2>Verify Your Email Address</h2>
    <p>Hi ${name},</p>
    <p>Welcome to ${appName}! Please verify your email address to activate your account.</p>
    
    <div class="highlight">
      <p style="margin: 0;"><strong>Verification Link:</strong></p>
      <p style="margin: 8px 0 0;"><a href="${verificationUrl}" class="button">Verify Email Address</a></p>
      <p style="margin: 16px 0 0; font-size: 13px; color: #888;">This link expires in ${expiryMinutes} minutes.</p>
    </div>
    
    <p>If the button above doesn't work, copy and paste this link into your browser:</p>
    <p style="word-break: break-all; color: #667eea; font-size: 14px;">${verificationUrl}</p>
    
    <div class="divider"></div>
    
    <p>If you didn't create an account with ${appName}, you can safely ignore this email.</p>
  `;

  const textContent = `
Verify Your Email Address

Hi ${name},

Welcome to ${appName}! Please verify your email address to activate your account.

Verification Link: ${verificationUrl}
This link expires in ${expiryMinutes} minutes.

If you didn't create an account with ${appName}, you can safely ignore this email.
  `;

  return {
    html: baseLayout(htmlContent, data),
    text: baseLayoutText(textContent, data),
  };
}

/**
 * Password Reset Template
 */
export function passwordResetTemplate(data: EmailTemplateData): {
  html: string;
  text: string;
} {
  const {
    name = "User",
    resetUrl,
    expiryMinutes = 15,
    appName = APP_NAME,
  } = data;

  const htmlContent = `
    <h2>Reset Your Password</h2>
    <p>Hi ${name},</p>
    <p>We received a request to reset your password for your ${appName} account.</p>
    
    <div class="highlight">
      <p style="margin: 0;"><strong>Reset Link:</strong></p>
      <p style="margin: 8px 0 0;"><a href="${resetUrl}" class="button">Reset Password</a></p>
      <p style="margin: 16px 0 0; font-size: 13px; color: #888;">This link expires in ${expiryMinutes} minutes.</p>
    </div>
    
    <p>If the button above doesn't work, copy and paste this link into your browser:</p>
    <p style="word-break: break-all; color: #667eea; font-size: 14px;">${resetUrl}</p>
    
    <div class="divider"></div>
    
    <div class="security-alert">
      <p><strong>Security Notice:</strong> If you didn't request a password reset, please ignore this email. Your password will not be changed unless you click the link above.</p>
    </div>
  `;

  const textContent = `
Reset Your Password

Hi ${name},

We received a request to reset your password for your ${appName} account.

Reset Link: ${resetUrl}
This link expires in ${expiryMinutes} minutes.

Security Notice: If you didn't request a password reset, please ignore this email. Your password will not be changed unless you click the link above.
  `;

  return {
    html: baseLayout(htmlContent, data),
    text: baseLayoutText(textContent, data),
  };
}

/**
 * OTP Verification Template
 */
export function otpVerificationTemplate(data: EmailTemplateData): {
  html: string;
  text: string;
} {
  const {
    name = "User",
    otp,
    expiryMinutes = 10,
    purpose = "verification",
  } = data;

  const purposeText =
    {
      verification: "verify your email address",
      password_reset: "reset your password",
      "2fa": "complete two-factor authentication",
    }[purpose] || "verify your identity";

  const htmlContent = `
    <h2>Your Verification Code</h2>
    <p>Hi ${name},</p>
    <p>Here is your one-time verification code to ${purposeText}:</p>
    
    <div class="otp-code">${otp}</div>
    
    <div class="info-box">
      <p><strong>Important:</strong> This code expires in ${expiryMinutes} minutes. Do not share this code with anyone.</p>
    </div>
    
    <div class="divider"></div>
    
    <p>If you didn't request this code, please ignore this email or contact support if you're concerned about your account security.</p>
  `;

  const textContent = `
Your Verification Code

Hi ${name},

Here is your one-time verification code to ${purposeText}:

${otp}

Important: This code expires in ${expiryMinutes} minutes. Do not share this code with anyone.

If you didn't request this code, please ignore this email or contact support if you're concerned about your account security.
  `;

  return {
    html: baseLayout(htmlContent, data),
    text: baseLayoutText(textContent, data),
  };
}

/**
 * Welcome Email Template
 */
export function welcomeTemplate(data: EmailTemplateData): {
  html: string;
  text: string;
} {
  const { name = "User", loginUrl, appName = APP_NAME } = data;

  const htmlContent = `
    <h2>Welcome to ${appName}! 🎉</h2>
    <p>Hi ${name},</p>
    <p>Thank you for joining ${appName}! Your account has been successfully created and verified.</p>
    
    <div class="highlight">
      <p style="margin: 0;"><strong>Get Started:</strong></p>
      <p style="margin: 8px 0 0;"><a href="${loginUrl}" class="button">Sign In to Your Account</a></p>
    </div>
    
    <p>Here are a few things you can do now:</p>
    <ul style="margin: 16px 0; padding-left: 20px; color: #4a4a6a;">
      <li style="margin-bottom: 8px;">Complete your profile</li>
      <li style="margin-bottom: 8px;">Explore the dashboard</li>
      <li style="margin-bottom: 8px;">Set up two-factor authentication for added security</li>
      <li style="margin-bottom: 8px;">Check out our documentation</li>
    </ul>
    
    <div class="divider"></div>
    
    <p>If you have any questions, feel free to reach out to our support team at <a href="mailto:${SUPPORT_EMAIL}">${SUPPORT_EMAIL}</a>.</p>
    
    <p>Welcome aboard!<br>The ${appName} Team</p>
  `;

  const textContent = `
Welcome to ${appName}! 🎉

Hi ${name},

Thank you for joining ${appName}! Your account has been successfully created and verified.

Get Started: ${loginUrl}

Here are a few things you can do now:
- Complete your profile
- Explore the dashboard
- Set up two-factor authentication for added security
- Check out our documentation

If you have any questions, feel free to reach out to our support team at ${SUPPORT_EMAIL}.

Welcome aboard!
The ${appName} Team
  `;

  return {
    html: baseLayout(htmlContent, data),
    text: baseLayoutText(textContent, data),
  };
}

/**
 * Security Alert Template (new login, password change, etc.)
 */
export function securityAlertTemplate(data: EmailTemplateData): {
  html: string;
  text: string;
} {
  const {
    name = "User",
    event = "New Login",
    deviceInfo = "Unknown Device",
    location = "Unknown Location",
    ipAddress = "Unknown IP",
    timestamp = new Date().toISOString(),
    loginUrl,
    appName = APP_NAME,
  } = data;

  const htmlContent = `
    <h2>Security Alert: ${event}</h2>
    <p>Hi ${name},</p>
    <p>We detected a new security event on your ${appName} account.</p>
    
    <div class="security-alert">
      <p><strong>Event:</strong> ${event}</p>
      <p><strong>Device:</strong> ${deviceInfo}</p>
      <p><strong>Location:</strong> ${location}</p>
      <p><strong>IP Address:</strong> ${ipAddress}</p>
      <p><strong>Time:</strong> ${new Date(timestamp).toLocaleString()}</p>
    </div>
    
    <p>If this was you, no action is needed. If you don't recognize this activity, please secure your account immediately:</p>
    
    <div class="highlight">
      <p style="margin: 0;"><a href="${loginUrl}" class="button">Secure My Account</a></p>
    </div>
    
    <div class="divider"></div>
    
    <p>For your security, we recommend:</p>
    <ul style="margin: 16px 0; padding-left: 20px; color: #4a4a6a;">
      <li style="margin-bottom: 8px;">Changing your password immediately</li>
      <li style="margin-bottom: 8px;">Enabling two-factor authentication</li>
      <li style="margin-bottom: 8px;">Reviewing active sessions in your account settings</li>
    </ul>
  `;

  const textContent = `
Security Alert: ${event}

Hi ${name},

We detected a new security event on your ${appName} account.

Event: ${event}
Device: ${deviceInfo}
Location: ${location}
IP Address: ${ipAddress}
Time: ${new Date(timestamp).toLocaleString()}

If this was you, no action is needed. If you don't recognize this activity, please secure your account immediately: ${loginUrl}

For your security, we recommend:
- Changing your password immediately
- Enabling two-factor authentication
- Reviewing active sessions in your account settings
  `;

  return {
    html: baseLayout(htmlContent, data),
    text: baseLayoutText(textContent, data),
  };
}

/**
 * Password Changed Confirmation Template
 */
export function passwordChangedTemplate(data: EmailTemplateData): {
  html: string;
  text: string;
} {
  const {
    name = "User",
    timestamp = new Date().toISOString(),
    loginUrl,
    appName = APP_NAME,
  } = data;

  const htmlContent = `
    <h2>Password Changed Successfully</h2>
    <p>Hi ${name},</p>
    <p>Your password for ${appName} has been successfully changed.</p>
    
    <div class="info-box">
      <p><strong>Changed at:</strong> ${new Date(timestamp).toLocaleString()}</p>
    </div>
    
    <p>If you didn't make this change, please secure your account immediately:</p>
    
    <div class="highlight">
      <p style="margin: 0;"><a href="${loginUrl}" class="button">Secure My Account</a></p>
    </div>
    
    <div class="divider"></div>
    
    <p>For your security, we recommend enabling two-factor authentication in your account settings.</p>
  `;

  const textContent = `
Password Changed Successfully

Hi ${name},

Your password for ${appName} has been successfully changed.

Changed at: ${new Date(timestamp).toLocaleString()}

If you didn't make this change, please secure your account immediately: ${loginUrl}

For your security, we recommend enabling two-factor authentication in your account settings.
  `;

  return {
    html: baseLayout(htmlContent, data),
    text: baseLayoutText(textContent, data),
  };
}

/**
 * Email Changed Confirmation Template
 */
export function emailChangedTemplate(data: EmailTemplateData): {
  html: string;
  text: string;
} {
  const {
    name = "User",
    oldEmail,
    newEmail,
    timestamp = new Date().toISOString(),
    loginUrl,
    appName = APP_NAME,
  } = data;

  const htmlContent = `
    <h2>Email Address Changed</h2>
    <p>Hi ${name},</p>
    <p>Your email address for ${appName} has been successfully updated.</p>
    
    <div class="info-box">
      <p><strong>Previous Email:</strong> ${oldEmail}</p>
      <p><strong>New Email:</strong> ${newEmail}</p>
      <p><strong>Changed at:</strong> ${new Date(timestamp).toLocaleString()}</p>
    </div>
    
    <p>If you didn't make this change, please secure your account immediately:</p>
    
    <div class="highlight">
      <p style="margin: 0;"><a href="${loginUrl}" class="button">Secure My Account</a></p>
    </div>
  `;

  const textContent = `
Email Address Changed

Hi ${name},

Your email address for ${appName} has been successfully updated.

Previous Email: ${oldEmail}
New Email: ${newEmail}
Changed at: ${new Date(timestamp).toLocaleString()}

If you didn't make this change, please secure your account immediately: ${loginUrl}
  `;

  return {
    html: baseLayout(htmlContent, data),
    text: baseLayoutText(textContent, data),
  };
}

/**
 * Two-Factor Authentication Enabled Template
 */
export function twoFactorEnabledTemplate(data: EmailTemplateData): {
  html: string;
  text: string;
} {
  const { name = "User", backupCodes, appName = APP_NAME } = data;

  const htmlContent = `
    <h2>Two-Factor Authentication Enabled</h2>
    <p>Hi ${name},</p>
    <p>Two-factor authentication (2FA) has been successfully enabled on your ${appName} account. Your account is now more secure!</p>
    
    <div class="info-box">
      <p><strong>What this means:</strong> When you sign in, you'll need to enter a verification code from your authenticator app in addition to your password.</p>
    </div>
    
    <h3>Your Backup Codes</h3>
    <p>Save these backup codes in a secure place. Each code can be used once if you lose access to your authenticator app.</p>
    
    <div class="backup-codes">
      ${backupCodes?.map((code) => `<div class="backup-code">${code}</div>`).join("") || ""}
    </div>
    
    <div class="divider"></div>
    
    <p><strong>Important:</strong> Store these codes safely. You won't be able to see them again. If you lose both your authenticator app and backup codes, you'll need to contact support to recover your account.</p>
  `;

  const textContent = `
Two-Factor Authentication Enabled

Hi ${name},

Two-factor authentication (2FA) has been successfully enabled on your ${appName} account. Your account is now more secure!

What this means: When you sign in, you'll need to enter a verification code from your authenticator app in addition to your password.

Your Backup Codes:
${backupCodes?.join("\n") || "None provided"}

Important: Store these codes safely. You won't be able to see them again. If you lose both your authenticator app and backup codes, you'll need to contact support to recover your account.
  `;

  return {
    html: baseLayout(htmlContent, data),
    text: baseLayoutText(textContent, data),
  };
}

/**
 * Two-Factor Authentication Disabled Template
 */
export function twoFactorDisabledTemplate(data: EmailTemplateData): {
  html: string;
  text: string;
} {
  const {
    name = "User",
    timestamp = new Date().toISOString(),
    loginUrl,
    appName = APP_NAME,
  } = data;

  const htmlContent = `
    <h2>Two-Factor Authentication Disabled</h2>
    <p>Hi ${name},</p>
    <p>Two-factor authentication (2FA) has been disabled on your ${appName} account.</p>
    
    <div class="info-box">
      <p><strong>Disabled at:</strong> ${new Date(timestamp).toLocaleString()}</p>
    </div>
    
    <p>If you didn't make this change, please secure your account immediately:</p>
    
    <div class="highlight">
      <p style="margin: 0;"><a href="${loginUrl}" class="button">Secure My Account</a></p>
    </div>
    
    <div class="divider"></div>
    
    <p>We strongly recommend re-enabling two-factor authentication in your account settings for better security.</p>
  `;

  const textContent = `
Two-Factor Authentication Disabled

Hi ${name},

Two-factor authentication (2FA) has been disabled on your ${appName} account.

Disabled at: ${new Date(timestamp).toLocaleString()}

If you didn't make this change, please secure your account immediately: ${loginUrl}

We strongly recommend re-enabling two-factor authentication in your account settings for better security.
  `;

  return {
    html: baseLayout(htmlContent, data),
    text: baseLayoutText(textContent, data),
  };
}

/**
 * Account Deactivated Template
 */
export function accountDeactivatedTemplate(data: EmailTemplateData): {
  html: string;
  text: string;
} {
  const { name = "User", reason, reactivateUrl, appName = APP_NAME } = data;

  const htmlContent = `
    <h2>Account Deactivated</h2>
    <p>Hi ${name},</p>
    <p>Your ${appName} account has been deactivated.</p>
    
    ${
      reason
        ? `
    <div class="info-box">
      <p><strong>Reason:</strong> ${reason}</p>
    </div>
    `
        : ""
    }
    
    <p>If you'd like to reactivate your account, you can do so by clicking the button below:</p>
    
    <div class="highlight">
      <p style="margin: 0;"><a href="${reactivateUrl}" class="button">Reactivate Account</a></p>
    </div>
    
    <div class="divider"></div>
    
    <p>If you have any questions, please contact our support team at <a href="mailto:${SUPPORT_EMAIL}">${SUPPORT_EMAIL}</a>.</p>
  `;

  const textContent = `
Account Deactivated

Hi ${name},

Your ${appName} account has been deactivated.

${reason ? `Reason: ${reason}` : ""}

If you'd like to reactivate your account, you can do so here: ${reactivateUrl}

If you have any questions, please contact our support team at ${SUPPORT_EMAIL}.
  `;

  return {
    html: baseLayout(htmlContent, data),
    text: baseLayoutText(textContent, data),
  };
}

/**
 * Account Deletion Confirmation Template
 */
export function accountDeletionTemplate(data: EmailTemplateData): {
  html: string;
  text: string;
} {
  const { name = "User", appName = APP_NAME } = data;

  const htmlContent = `
    <h2>Account Deleted</h2>
    <p>Hi ${name},</p>
    <p>Your ${appName} account has been permanently deleted.</p>
    
    <div class="info-box">
      <p>All your data has been removed from our systems in accordance with our data retention policy.</p>
    </div>
    
    <p>If you'd like to use ${appName} in the future, you'll need to create a new account.</p>
    
    <div class="divider"></div>
    
    <p>Thank you for using ${appName}. We wish you all the best!</p>
  `;

  const textContent = `
Account Deleted

Hi ${name},

Your ${appName} account has been permanently deleted.

All your data has been removed from our systems in accordance with our data retention policy.

If you'd like to use ${appName} in the future, you'll need to create a new account.

Thank you for using ${appName}. We wish you all the best!
  `;

  return {
    html: baseLayout(htmlContent, data),
    text: baseLayoutText(textContent, data),
  };
}

/**
 * Magic Link Login Template
 */
export function magicLinkTemplate(data: EmailTemplateData): {
  html: string;
  text: string;
} {
  const {
    name = "User",
    loginUrl,
    expiryMinutes = 15,
    appName = APP_NAME,
  } = data;

  const htmlContent = `
    <h2>Sign In to ${appName}</h2>
    <p>Hi ${name},</p>
    <p>Click the button below to sign in to your ${appName} account. No password needed!</p>
    
    <div class="highlight">
      <p style="margin: 0;"><a href="${loginUrl}" class="button">Sign In</a></p>
      <p style="margin: 16px 0 0; font-size: 13px; color: #888;">This link expires in ${expiryMinutes} minutes.</p>
    </div>
    
    <p>If the button doesn't work, copy and paste this link:</p>
    <p style="word-break: break-all; color: #667eea; font-size: 14px;">${loginUrl}</p>
    
    <div class="divider"></div>
    
    <p>If you didn't request this sign-in link, you can safely ignore this email.</p>
  `;

  const textContent = `
Sign In to ${appName}

Hi ${name},

Click the link below to sign in to your ${appName} account. No password needed!

Sign In Link: ${loginUrl}
This link expires in ${expiryMinutes} minutes.

If you didn't request this sign-in link, you can safely ignore this email.
  `;

  return {
    html: baseLayout(htmlContent, data),
    text: baseLayoutText(textContent, data),
  };
}

/**
 * Export all templates as a map for easy access
 */
export const emailTemplates = {
  emailVerification: emailVerificationTemplate,
  passwordReset: passwordResetTemplate,
  otpVerification: otpVerificationTemplate,
  welcome: welcomeTemplate,
  securityAlert: securityAlertTemplate,
  passwordChanged: passwordChangedTemplate,
  emailChanged: emailChangedTemplate,
  twoFactorEnabled: twoFactorEnabledTemplate,
  twoFactorDisabled: twoFactorDisabledTemplate,
  accountDeactivated: accountDeactivatedTemplate,
  accountDeletion: accountDeletionTemplate,
  magicLink: magicLinkTemplate,
} as const;

export type EmailTemplateKey = keyof typeof emailTemplates;
export type EmailTemplateFunction = (typeof emailTemplates)[EmailTemplateKey];
