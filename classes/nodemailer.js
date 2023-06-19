const nodemailer = require("nodemailer");

class NodeMailer {
  constructor() {
    this.transporter = nodemailer.createTransport({
      service: `${process.env.NODEMAILER_SERVICE}`,
      auth: {
        user: `${process.env.NODEMAILER_EMAIL}`,
        pass: `${process.env.NODEMAILER_PASSWORD}`,
      },
    });
  }
  sendMail(to, subject, htmlContent) {
    let mailOptions = {
      from: `${process.env.NODEMAILER_EMAIL}`,
      to: to,
      subject: subject,
      html: htmlContent,
    };
    this.transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.error(error);
      } else {
        console.log("email sent successfully");
      }
    });
  }
}
module.exports = NodeMailer;

/*


    html: `
        <body style="background-color: black;">
            <h1 style="color: green;">this is a header</h1> 
            <p style="color: red;">this is a paragraph woooooooooooooooooooooooooooooooooooow</p>
        </body>
    `
}

*/
