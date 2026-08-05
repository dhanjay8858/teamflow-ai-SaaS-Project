import nodemailer from 'nodemailer';
import { env } from '../config/env.config.js';
import { logger } from '../utils/logger.js';

export interface SendInvitationEmailPayload {
  toEmail: string;
  inviterName: string;
  workspaceName: string;
  organizationName: string;
  role: string;
  acceptUrl: string;
  expiresAt: Date;
}

export class EmailService {
  private transporter: nodemailer.Transporter | null = null;

  constructor() {
    this.initTransporter();
  }

  private initTransporter(): void {
    if (env.SMTP_HOST && env.SMTP_USER && env.SMTP_PASS) {
      try {
        this.transporter = nodemailer.createTransport({
          host: env.SMTP_HOST,
          port: env.SMTP_PORT || 587,
          secure: env.SMTP_PORT === 465,
          auth: {
            user: env.SMTP_USER,
            pass: env.SMTP_PASS,
          },
        });
        logger.info(`📧 [EmailService] SMTP transporter initialized (${env.SMTP_HOST})`);
      } catch (err: any) {
        logger.error(`❌ [EmailService] Failed to initialize SMTP transporter: ${err.message}`);
        this.transporter = null;
      }
    } else {
      logger.info('ℹ️ [EmailService] SMTP credentials not configured. Email links will be logged to stdout.');
    }
  }

  public async sendWorkspaceInvitation(payload: SendInvitationEmailPayload): Promise<boolean> {
    const { toEmail, inviterName, workspaceName, organizationName, role, acceptUrl, expiresAt } = payload;
    const formattedExpires = expiresAt.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Workspace Invitation — TeamFlow AI</title>
</head>
<body style="margin: 0; padding: 0; background-color: #070709; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #f4f4f5;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #070709; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" max-width="560px" border="0" cellspacing="0" cellpadding="0" style="max-width: 560px; background-color: #0e0e12; border: 1px solid #27272a; border-radius: 16px; overflow: hidden; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5);">
          <!-- Top Accent Bar -->
          <tr>
            <td style="height: 4px; background: linear-gradient(90deg, #6366f1, #a855f7, #ec4899);"></td>
          </tr>

          <!-- Header -->
          <tr>
            <td style="padding: 32px 32px 16px 32px; text-align: center;">
              <div style="display: inline-block; padding: 10px 18px; background: rgba(99, 102, 241, 0.1); border: 1px solid rgba(99, 102, 241, 0.2); border-radius: 12px; font-weight: 700; font-size: 18px; color: #818cf8;">
                ⚡ TeamFlow AI
              </div>
            </td>
          </tr>

          <!-- Body Content -->
          <tr>
            <td style="padding: 16px 32px 32px 32px;">
              <h1 style="margin: 0 0 12px 0; font-size: 22px; font-weight: 700; color: #ffffff; text-align: center;">
                You've been invited!
              </h1>
              <p style="margin: 0 0 24px 0; font-size: 14px; line-height: 1.6; color: #a1a1aa; text-align: center;">
                <strong style="color: #f4f4f5;">${inviterName}</strong> has invited you to join the <strong style="color: #818cf8;">${workspaceName}</strong> workspace in <strong style="color: #f4f4f5;">${organizationName}</strong>.
              </p>

              <!-- Workspace Info Card -->
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #18181b; border: 1px solid #27272a; border-radius: 12px; margin-bottom: 28px;">
                <tr>
                  <td style="padding: 16px 20px;">
                    <table width="100%" border="0" cellspacing="0" cellpadding="0">
                      <tr>
                        <td style="font-size: 13px; color: #71717a;">Workspace</td>
                        <td align="right" style="font-size: 13px; font-weight: 600; color: #f4f4f5;">${workspaceName}</td>
                      </tr>
                      <tr>
                        <td style="padding-top: 8px; font-size: 13px; color: #71717a;">Assigned Role</td>
                        <td align="right" style="padding-top: 8px; font-size: 12px; font-weight: 700; color: #a855f7; text-transform: uppercase;">${role}</td>
                      </tr>
                      <tr>
                        <td style="padding-top: 8px; font-size: 13px; color: #71717a;">Expires On</td>
                        <td align="right" style="padding-top: 8px; font-size: 13px; color: #a1a1aa;">${formattedExpires}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- CTA Button -->
              <div style="text-align: center; margin-bottom: 28px;">
                <a href="${acceptUrl}" target="_blank" style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #6366f1, #8b5cf6); color: #ffffff; font-size: 14px; font-weight: 600; text-decoration: none; border-radius: 10px; box-shadow: 0 4px 14px rgba(99, 102, 241, 0.4);">
                  Accept Invitation & Join Workspace →
                </a>
              </div>

              <p style="margin: 0; font-size: 12px; line-height: 1.5; color: #71717a; text-align: center;">
                If you don't have an account yet, clicking the button will guide you to set up your account and automatically add you to the workspace.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 20px 32px; background-color: #121217; border-top: 1px solid #27272a; text-align: center;">
              <p style="margin: 0; font-size: 11px; color: #52525b;">
                Need help? <a href="${acceptUrl}" style="color: #818cf8; text-decoration: underline;">${acceptUrl}</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `;

    // Log formatted output to logger for instant developer visibility
    logger.info(`✉️ [Invitation Email] To: ${toEmail} | Accept URL: ${acceptUrl}`);

    if (this.transporter) {
      try {
        await this.transporter.sendMail({
          from: env.SMTP_FROM,
          to: toEmail,
          subject: `You've been invited to join ${workspaceName} on TeamFlow AI`,
          html: htmlContent,
        });
        logger.info(`✅ [EmailService] Invitation email delivered successfully to ${toEmail}`);
        return true;
      } catch (err: any) {
        logger.error(`❌ [EmailService] Failed to send email to ${toEmail}: ${err.message}`);
        return false;
      }
    }

    return true;
  }
}

export const emailService = new EmailService();
