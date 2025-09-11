const nodemailer = require("nodemailer");

class Mailer {
    constructor(service, emailusername, emailpassword) {
        this.transporter = nodemailer.createTransport({
            service: service, // e.g., 'Gmail', 'Yahoo', etc.
            auth: {
                user: emailusername, // sender email
                pass: emailpassword, // sender password or app password
            },
        });
    }
    async sendMail(mailObj) {
        const mailOptions = {
            from: this.transporter.options.auth.user,
            to: mailObj.to,
            subject: mailObj.subject,
            text: mailObj.text,
        };
        try {
            const info = await this.transporter.sendMail(mailOptions);
            console.log("Email sent successfully:", info.messageId);
        } catch (error) {
            console.error("Error sending email:", error);
            throw error;
        }
    }
}
module.exports = Mailer
