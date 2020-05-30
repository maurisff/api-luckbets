
const nodemailer = require('nodemailer');

let transporter = null;
if (process.env.EMAIL_SERVICE) {
  transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
} else {
  transporter = nodemailer.createTransport({
    host: process.env.EMAIL_SMTP_HOST,
    port: process.env.EMAIL_SMTP_PORT,
    secure: !!process.env.EMAIL_SMTP_SECURE,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
}


exports.sendEmail = async (email) => {
  try {
    const {
      from, to, cc, bcc, subject, body, htmlBody,
    } = email;
    if (!from) {
      throw new Error('from required!!');
    }
    if (!to) {
      throw new Error('to required!!');
    }
    if (!subject) {
      throw new Error('title required!!');
    }

    if (!body && !htmlBody) {
      throw new Error('body or htmlBody required!!');
    }

    const mailOptions = {
      sender: process.env.EMAIL_USER,
      from,
      to,
      subject,
    };
    if (cc) {
      mailOptions.cc = cc;
    }
    if (bcc) {
      mailOptions.bcc = bcc;
    }
    if (body) {
      mailOptions.text = body;
    }
    if (htmlBody) {
      mailOptions.html = htmlBody;
    }
    const info = await transporter.sendMail(mailOptions);
    console.log('Message sent: %s', info.messageId);
  } catch (error) {
    console.log('Firebase.sendNotification - Error: ', error);
  }
};
