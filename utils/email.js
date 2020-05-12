const nodemailer = require('nodemailer');
const htmlToText = require('html-to-text');
const pug = require('pug');

module.exports = class Email {
  constructor(user, url) {
    this.to = user.email;
    this.firstName = user.name.split(' ')[0];
    this.url = url;
    this.from = `Vivek Chetia <${process.env.EMAIL_FROM}>`;
  }

  newTransport() {
    if (process.env.NODE_ENV === 'production') {
      // Sendgrid
      return nodemailer.createTransport({
        service: 'SendGrid',
        auth: {
          user: process.env.SEND_GRID_USERNAME,
          pass: process.env.SEND_GRID_PASSWORD
        }
      });
    }

    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD
      }
    });
  }

  // send the actual email
  async send(template, subject) {
    // render HTML based on a pug templete
    const html = pug.renderFile(`${__dirname}/../views/email/${template}.pug`, {
      firstName: this.firstName,
      url: this.url,
      subject
    });

    // define the email option
    const emailOptions = {
      from: 'Vivek Chetia <vikichet@gmail.com>',
      to: this.to,
      subject: subject,
      text: htmlToText.fromString(html),
      html
    };

    // check if the transport is setup with working crenditials
    // this.newTransport().verify(function(error, success) {
    //   if (error) {
    //     console.log(error);
    //   } else {
    //     console.log('Server is ready to take our messages');
    //   }
    // });

    // create a transport and send email
    await this.newTransport().sendMail(emailOptions);
  }

  async sendWelcome() {
    await this.send('welcome', 'Welcome to the Natours family!');
  }

  async sendPasswordReset() {
    await this.send(
      'passwordReset',
      'Your password reset token is only valid for 10 minutes!'
    );
  }
};
