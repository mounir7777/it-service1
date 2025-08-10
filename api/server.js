import express from "express";
import cors from "cors";
import rateLimit from "express-rate-limit";
import nodemailer from "nodemailer";

const app = express();
app.use(express.json());
app.use(cors({ origin: "*"})); // falls du es einschränken willst, trage deine Domain ein

// simples Rate Limit gegen Spam
app.use("/contact", rateLimit({ windowMs: 60_000, max: 5 }));

app.get("/", (req,res)=>res.send("OK"));

app.post("/contact", async (req, res) => {
  try {
    const { name, email, message } = req.body || {};
    if(!name || !email || !message) {
      return res.status(400).json({ ok:false, error:"Missing fields" });
    }

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });

    const info = await transporter.sendMail({
      from: process.env.FROM_EMAIL || process.env.SMTP_USER,
      to: process.env.TO_EMAIL || process.env.SMTP_USER,
      replyTo: email,
      subject: `Kontaktformular: ${name}`,
      text: `Von: ${name} <${email}>\n\n${message}`,
      html: `<p><b>Von:</b> ${name} &lt;${email}&gt;</p><pre>${message}</pre>`
    });

    res.json({ ok:true, id: info.messageId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok:false, error:"Mail send failed" });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log("API listening on", port));
