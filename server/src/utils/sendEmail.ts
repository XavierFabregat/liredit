import nodemailer from "nodemailer";

console.log("==========================");
console.log("process.env.NODEMAILER_EMAIL", process.env.NODEMAILER_EMAIL);
console.log("process.env.NODEMAILER_PASSWORD", process.env.NODEMAILER_PASSWORD);
console.log("==========================");

export async function sendEmail(to: string, html: string) {
  // const testAccount = await nodemailer.createTestAccount();
  // console.log("testAccount", testAccount);

  // create reusable transporter object using the default SMTP transport
  const transporter = nodemailer.createTransport({
    service: "gmail", //process.env.EMAIL_HOST,
    port: 587, //process.env.EMAIL_PORT,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.NODEMAILER_EMAIL, //process.env.EMAIL_USER, // generated ethereal user
      pass: process.env.NODEMAILER_PASSWORD, //process.env.EMAIL_PASS, // generated ethereal password
    },
  });

  // send mail with defined transport object
  const info = await transporter.sendMail({
    from: process.env.NODEMAILER_EMAIL, // sender address
    to,
    subject: "Change password",
    html,
  });

  console.log("Message sent: %s", info.messageId);
  console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
}
