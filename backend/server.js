import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const app = express();

// --- Security & parsing
app.use(helmet());
app.use(express.json({ limit: "1mb" })); // смета не должна быть огромной

// --- CORS
const corsOrigin = process.env.CORS_ORIGIN?.split(",").map((s) => s.trim()).filter(Boolean) || [];
app.use(
    cors({
        origin: (origin, cb) => {
            // allow same-origin / server-to-server and local dev
            if (!origin) return cb(null, true);
            if (corsOrigin.length === 0) return cb(null, true);
            return corsOrigin.includes(origin) ? cb(null, true) : cb(new Error("CORS blocked"));
        },
        credentials: false,
    })
);

// --- Rate limiting (anti-spam)
app.use(
    "/api/lead",
    rateLimit({
        windowMs: 15 * 60 * 1000,
        max: 30, // 30 requests / 15 min per IP
        standardHeaders: true,
        legacyHeaders: false,
    })
);

const LeadSchema = z.object({
    // кто отправляет
    clientEmail: z.string().email().optional(), // если хочешь отправлять копию клиенту
    contact: z.string().min(3).max(120).optional(), // телега/телефон/email — одно поле

    // полезное
    title: z.string().min(1).max(120).optional(), // "Лендинг", "Интернет-магазин", etc.
    total: z.number().nonnegative().optional(),
    days: z.number().nonnegative().optional(),

    // контент
    estimateText: z.string().min(10).max(100000),
    estimateJson: z.any(), // JSON объект
});

function requiredEnv(name) {
    const v = process.env[name];
    if (!v) throw new Error(`Missing env: ${name}`);
    return v;
}

const transporter = nodemailer.createTransport({
    host: requiredEnv("SMTP_HOST"),
    port: Number(requiredEnv("SMTP_PORT")),
    secure: String(process.env.SMTP_SECURE || "true") === "true",
    auth: {
        user: requiredEnv("SMTP_USER"),
        pass: requiredEnv("SMTP_PASS"),
    },
});

app.get("/health", async (req, res) => {
    res.json({ ok: true });
});

app.post("/api/lead", async (req, res) => {
    try {
        const parsed = LeadSchema.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({
                ok: false,
                error: "VALIDATION_ERROR",
                details: parsed.error.flatten(),
            });
        }

        const data = parsed.data;

        const leadsTo = requiredEnv("LEADS_TO");
        const mailFrom = requiredEnv("MAIL_FROM");

        // тема письма
        const price = typeof data.total === "number" ? `${Math.round(data.total).toLocaleString("ru-RU")} ₽` : "—";
        const days = typeof data.days === "number" ? `~${Math.round(data.days)} дн.` : "—";
        const title = data.title ? ` — ${data.title}` : "";
        const subject = `Смета: ${price} (${days})${title}`;

        const contactLine =
            (data.contact && `Контакт: ${data.contact}`) ||
            (data.clientEmail && `Email клиента: ${data.clientEmail}`) ||
            "Контакт: (не указан)";

        const textBody =
            `${subject}\n` +
            `${contactLine}\n` +
            `\n---\n` +
            `Оценка ориентировочная. Итог уточняется после обсуждения.\n` +
            `---\n\n` +
            `${data.estimateText}\n`;

        const jsonBuffer = Buffer.from(JSON.stringify(data.estimateJson, null, 2), "utf-8");

        // Письмо тебе
        const toYou = {
            from: mailFrom,
            to: leadsTo,
            subject,
            text: textBody,
            attachments: [
                {
                    filename: "estimate.json",
                    content: jsonBuffer,
                    contentType: "application/json; charset=utf-8",
                },
            ],
        };

        // Письмо клиенту (если указан email)
        const toClient =
            data.clientEmail
                ? {
                    from: mailFrom,
                    to: data.clientEmail,
                    subject: `Ваша смета: ${price} (${days})${title}`,
                    text:
                        `Здравствуйте!\n\n` +
                        `Отправляю копию сметы.\n` +
                        `Стоимость ориентировочная — уточняется после обсуждения.\n\n` +
                        `Если остались вопросы — ответьте на это письмо или напишите в Telegram.\n\n` +
                        `---\n\n` +
                        `${data.estimateText}\n`,
                    attachments: [
                        {
                            filename: "estimate.json",
                            content: jsonBuffer,
                            contentType: "application/json; charset=utf-8",
                        },
                    ],
                }
                : null;

        // Проверка SMTP (один раз можно убрать в проде, но на старте полезно)
        // await transporter.verify();

        await transporter.sendMail(toYou);
        if (toClient) await transporter.sendMail(toClient);

        return res.json({ ok: true });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ ok: false, error: "SERVER_ERROR" });
    }
});

const port = Number(process.env.PORT || 3001);
app.listen(port, () => {
    console.log(`Mail backend running on http://localhost:${port}`);
});