const nodemailer = require('nodemailer');

class NodeMailer {
    constructor() {
        this.transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'solideye99@gmail.com',
                pass: 'oavahsxvbvvrqzfw'
            }
        })
    }
    sendMail(to, subject, htmlContent) {
        let mailOptions = {
            from: 'solideye99@gmail.com',
            to: to,
            subject: subject,
            html: htmlContent
        }
        this.transporter.sendMail(mailOptions, function(error, info){
            if (error) {
                console.error(error)
            } else {
                console.log('email sent successfully')
            }
        })
    };
}
module.exports = NodeMailer


/*


    html: `
        <body style="background-color: black;">
            <h1 style="color: green;">this is a header</h1> 
            <p style="color: red;">this is a paragraph woooooooooooooooooooooooooooooooooooow</p>
        </body>
    `
}

*/