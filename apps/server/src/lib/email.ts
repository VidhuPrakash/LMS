import nodemailer from 'nodemailer'
import type { Transporter } from 'nodemailer'
import { env } from '../config/env'
import { logger } from './logger'

let transporter: Transporter | null = null

function getTransporter(): Transporter {
  if (transporter) {
    return transporter
  }

  transporter = nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: Number(env.SMTP_PORT),
    secure: env.SMTP_PORT === '465',
    auth: {
      user: env.SMTP_USER,
      pass: env.SMTP_PASS,
    },
  })

  return transporter
}

export async function sendVerificationEmail(
  email: string,
  url: string,
  name?: string
) {
  const subject = 'Verify your email address'
const html = `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <title>Verify Your Email</title>
    <!--[if mso]>
    <style type="text/css">
      body, table, td {font-family: Arial, sans-serif !important;}
    </style>
    <![endif]-->
  </head>
  <body style="margin: 0; padding: 0; background-color: #f6f9fc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f6f9fc; padding: 20px 0;">
      <tr>
        <td align="center">
          <!-- Main Container -->
          <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="background-color: #ffffff; max-width: 600px; width: 100%; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
            
            <!-- Header -->
            <tr>
              <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 48px 40px; text-align: center;">
                <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 600; line-height: 1.3;">
                  ✉️ Verify Your Email
                </h1>
                <p style="margin: 12px 0 0 0; color: #f0f0f0; font-size: 16px; line-height: 1.5;">
                  Welcome to QubesAI
                </p>
              </td>
            </tr>

            <!-- Content -->
            <tr>
              <td style="padding: 48px 40px;">
                <p style="margin: 0 0 16px 0; color: #1a1a1a; font-size: 16px; line-height: 1.6;">
                  Hello <strong>${name || 'there'}</strong>,
                </p>
                <p style="margin: 0 0 24px 0; color: #4a5568; font-size: 16px; line-height: 1.6;">
                  Thank you for signing up! We're excited to have you on board. To complete your registration and access your account, please verify your email address by clicking the button below:
                </p>

                <!-- CTA Button -->
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 32px 0;">
                  <tr>
                    <td align="center">
                      <!--[if mso]>
                      <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="${url}" style="height:50px;v-text-anchor:middle;width:250px;" arcsize="10%" strokecolor="#667eea" fillcolor="#667eea">
                        <w:anchorlock/>
                        <center style="color:#ffffff;font-family:sans-serif;font-size:16px;font-weight:bold;">Verify Email Address</center>
                      </v:roundrect>
                      <![endif]-->
                      <!--[if !mso]><!-->
                      <a href="${url}" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; font-size: 16px; font-weight: 600; padding: 16px 48px; border-radius: 6px; box-shadow: 0 4px 6px rgba(102, 126, 234, 0.4);">
                        Verify Email Address
                      </a>
                      <!--<![endif]-->
                    </td>
                  </tr>
                </table>

                <!-- Info Box -->
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 32px 0; background-color: #fff3cd; border-left: 4px solid #ffc107; border-radius: 4px;">
                  <tr>
                    <td style="padding: 16px 20px;">
                      <p style="margin: 0; color: #856404; font-size: 14px; line-height: 1.5;">
                        <strong>⏱️ This link will expire in 10 minutes</strong> for security purposes. If you don't verify within this timeframe, you'll need to request a new verification email.
                      </p>
                    </td>
                  </tr>
                </table>

                <!-- Alternative Link -->
                <p style="margin: 24px 0 0 0; color: #718096; font-size: 14px; line-height: 1.6;">
                  If the button doesn't work, copy and paste this link into your browser:
                </p>
                <p style="margin: 8px 0 0 0; color: #667eea; font-size: 14px; line-height: 1.6; word-break: break-all;">
                  <a href="${url}" style="color: #667eea; text-decoration: underline;">${url}</a>
                </p>

                <!-- Security Notice -->
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 32px 0 0 0; padding-top: 32px; border-top: 1px solid #e2e8f0;">
                  <tr>
                    <td>
                      <p style="margin: 0 0 16px 0; color: #4a5568; font-size: 14px; line-height: 1.6;">
                        If you didn't create an account with QubesAI, you can safely ignore this email. No account will be created without verification.
                      </p>
                      <p style="margin: 0; color: #1a1a1a; font-size: 16px; line-height: 1.6;">
                        Best regards,<br>
                        <strong>The QubesAI Team</strong>
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td style="background-color: #f7fafc; padding: 32px 40px; border-top: 1px solid #e2e8f0;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                  <tr>
                    <td align="center">
                      <p style="margin: 0 0 8px 0; color: #718096; font-size: 13px; line-height: 1.5;">
                        This is an automated message, please do not reply to this email.
                      </p>
                      <p style="margin: 0 0 16px 0; color: #718096; font-size: 13px; line-height: 1.5;">
                        Need help? Contact us at <a href="mailto:support@qubesai.com" style="color: #667eea; text-decoration: none;">support@qubesai.com</a>
                      </p>
                      <p style="margin: 0; color: #a0aec0; font-size: 12px; line-height: 1.5;">
                        &copy; ${new Date().getFullYear()} QubesAI. All rights reserved.
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
`



  const text = `
Hello ${name || 'there'},

Thank you for signing up! To complete your registration, please verify your email address using the link below:

Verification Link: ${url}

This link will expire in 10 minutes.

If you didn't create an account with us, you can safely ignore this email.

Best regards,
The Team
  `

  try {
    if (env.NODE_ENV === 'development') {
      logger.info({ email, url, name }, 'Email verification url (dev mode)')
    }

    const transport = getTransporter()

    console.warn(transport)
    
    await transport.sendMail({
      from: `"LSM" <${env.EMAIL_FROM}>`,
      to: email,
      subject,
      text,
      html,
    })
  
  } catch (error) {
    logger.error({ error, email }, 'Failed to send verification email')
    throw error
  }
}

// Test email connection
export async function testEmailConnection() {
  try {
    if (env.NODE_ENV === 'development') {
      logger.info('Email connection test skipped in development mode')
      return true
    }

    const transport = getTransporter()
    await transport.verify()
    logger.info('Email server connection verified successfully')
    return true
  } catch (error) {
    logger.error({ error }, 'Email server connection failed')
    return false
  }
}