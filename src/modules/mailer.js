import nodemailer from 'nodemailer'

let smtp_user = process.env.SMTP_USER
let smtp_password = process.env.SMTP_PASSWORD

let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: smtp_user,
        pass: smtp_password
    }
});

export default transporter
