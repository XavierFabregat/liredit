import nodemailer from "nodemailer";

export async function sendEmail(to: string, html: string) {
  // const testAccount = await nodemailer.createTestAccount();
  // console.log("testAccount", testAccount);

  // create reusable transporter object using the default SMTP transport
  const transporter = nodemailer.createTransport({
    host: "smtp.ethereal.email", //process.env.EMAIL_HOST,
    port: 587, //process.env.EMAIL_PORT,
    secure: false, // true for 465, false for other ports
    auth: {
      user: "iuavl4q4zohirzgw@ethereal.email", //process.env.EMAIL_USER, // generated ethereal user
      pass: "dDAqs9jbAyjEBFHuCQ", //process.env.EMAIL_PASS, // generated ethereal password
    },
  });

  // send mail with defined transport object
  const info = await transporter.sendMail({
    from: '"Fred Foo 👻" <foo@example.com>"',
    to,
    subject: "Change password",
    html,
  });

  console.log("Message sent: %s", info.messageId);
  console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
}
