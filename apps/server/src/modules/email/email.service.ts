import { Injectable } from '@nestjs/common';
import sgMail from '@sendgrid/mail';
import { User } from '../../entities';
import { createJsonWebToken } from '../../utils';
import jwt from 'jsonwebtoken';

@Injectable()
export class EmailService {
  constructor() {
    sgMail.setApiKey(process.env.SENDGRID_KEY);
  }
  async sendSignerInvite({
    containerId,
    email,
  }: {
    containerId: string;
    email: string;
  }) {
    const logoPath = new URL(
      '/images/Logo.png',
      process.env.PUBLIC_CLIENT_URI,
    ).toString();
    const token = jwt.sign(
      {
        scope: 'email-signer',
        context: 'external',
        email,
        containerId,
      },
      process.env.SESSION_SECRET,
      {
        expiresIn: '7d',
      },
    );
    const verificationLink = `
      ${process.env.PUBLIC_CLIENT_URI}/sign?token=${token}
    `;
    const message = {
      from: 'Syner <no-reply@auvo.io>',
      to: email,
      subject: `Document Signing Request from Syner`,
      html: `
      <html>
      <body>
      <div style="background: #f2f2f2; padding: 20px; font-family: sans-serif; text-align: center">
        <div style="text-align: center; padding: 20px;">
          <img src="${logoPath}" style="height: 150px; width: 150px; object-fit: cover; border-radius: 5px;" />
        </div>
        <p>Please sign document by clicking the link below!</p>
        <table width="100%" border="0" cellspacing="0" cellpadding="0">
          <tr>
            <td style="text-align: center;">
              <center>
                <a href="${verificationLink}" style="text-decoration: none">
                  <button style="padding: 12px 25px; display: block; text-decoration: none; color: #3d3d3d; background: #afd47e; width: fit-content; border-radius: 5px; border: none;">Sign Document</button>
                </a>
              </center>
            </td>
          </tr>
        </table>
        <p>If the button does not work, please click on the link below</p>
        <p>${verificationLink}</p>
      </div>
      </body>
      </html>
      `,
    };
    await sgMail.send(message);
  }

  async docSignedNotif({
    containerId,
    emails,
  }: {
    containerId: string;
    emails: string[];
  }) {
    const logoPath = new URL(
      '/images/Logo.png',
      process.env.PUBLIC_CLIENT_URI,
    ).toString();
    emails.forEach(async (email) => {
      const token = jwt.sign(
        {
          scope: 'signer-viewer',
          context: 'external',
          email,
          containerId,
        },
        process.env.SESSION_SECRET,
        {
          expiresIn: '73050d',
        },
      );
      const viewerLink = `
        ${process.env.PUBLIC_CLIENT_URI}/sign?token=${token}
      `;
      const message = {
        from: 'Syner <no-reply@auvo.io>',
        to: email,
        subject: `Syner Document Signed!`,
        html: `
        <html>
        <body>
        <div style="background: #f2f2f2; padding: 20px; font-family: sans-serif; text-align: center">
          <div style="text-align: center; padding: 20px;">
            <img src="${logoPath}" style="height: 150px; width: 150px; object-fit: cover; border-radius: 5px;" />
          </div>
          <h1>Hello!</h1>
          <p>All people have signed the Document!</p>
          <table width="100%" border="0" cellspacing="0" cellpadding="0">
            <tr>
              <td style="text-align: center;">
                <center>
                  We wanted to notify you that Document ID: ${containerId} has been signed by all relevant authorities! 
                </center>
              </td>
            </tr>
          </table>
          <p>Please ciew document by clicking the button below!</p>
          <table width="100%" border="0" cellspacing="0" cellpadding="0">
            <tr>
              <td style="text-align: center;">
                <center>
                  <a href="${viewerLink}" style="text-decoration: none">
                    <button style="padding: 12px 25px; display: block; text-decoration: none; color: #3d3d3d; background: #afd47e; width: fit-content; border-radius: 5px; border: none;">View Document</button>
                  </a>
                </center>
              </td>
            </tr>
          </table>
          <p>If the button does not work, please click on the link below</p>
          <p>${viewerLink}</p>
        </div>
        </body>
        </html>
        `,
      };
      await sgMail.send(message);
    });
  }
}
