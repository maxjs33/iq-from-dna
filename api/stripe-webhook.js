/**
 * /api/stripe-webhook.js – Vercel serverless function
 * Env vars: STRIPE_SECRET, STRIPE_WEBHOOK_SECRET, SENDGRID_KEY
 */
import Stripe from "stripe";
import sgMail from "@sendgrid/mail";
import PDFDocument from "pdfkit";

const stripe = new Stripe(process.env.STRIPE_SECRET, { apiVersion: "2023-10-16" });
sgMail.setApiKey(process.env.SENDGRID_KEY);

/* Vercel: leave body unparsed so we can verify signature */
export const config = { api: { bodyParser: false } };

/* --------------------------------- helpers -------------------------------- */
function buildPdf(email, r) {
  return new Promise((resolve) => {
    const doc  = new PDFDocument();
    const bufs = [];
    doc.on("data", (d) => bufs.push(d));
    doc.on("end",  () => resolve(Buffer.concat(bufs)));

    doc.fontSize(22).text("ThinQ Cognitive Analysis", { align: "center" });
    doc.moveDown().fontSize(14).text(`Official report for: ${email}`, { align: "center" });
    doc.moveDown().fontSize(16).text(`Predicted FSIQ: ${r.predictedFSIQ}`, { align: "center" });
    doc.text(`95 % CI: ${r.ci_lower} – ${r.ci_upper}`, { align: "center" });
    doc.moveDown(2).fontSize(10)
       .text("Disclaimer: for informational & educational use only.", { align: "left" });
    doc.end();
  });
}

/* ↻ replace with Redis / DB / KV */
async function fetchPrediction(analysisId) {
  if (!global._memStore) global._memStore = {};
  return global._memStore[analysisId];
}
export async function savePrediction(analysisId, obj) {
  if (!global._memStore) global._memStore = {};
  global._memStore[analysisId] = obj;
}

/* ------------------------------- main handler ------------------------------ */
export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end("Method Not Allowed");

  const sig = req.headers["stripe-signature"];
  const raw = await rawBody(req);
  let event;
  try {
    event = stripe.webhooks.constructEvent(
      raw,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error("🛑  Signature verification failed", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  /* ACK fast so Stripe stops retrying */
  res.status(200).json({ received: true });

  if (event.type !== "checkout.session.completed") return;

  const session    = event.data.object;
  const email      = session.customer_email;
  const analysisId = session.metadata.analysisId;

  const prediction = await fetchPrediction(analysisId);
  if (!prediction) { console.error("No prediction for", analysisId); return; }

  const pdfBuf = await buildPdf(email, prediction);

  await sgMail.send({
    to: email,
    from: "no-reply@thinq.ai",
    subject: "Your ThinQ Cognitive Analysis Report",
    text: "Attached is your personal IQ report. Thank you for using ThinQ!",
    attachments: [{
      content:   pdfBuf.toString("base64"),
      filename:  "ThinQ_Report.pdf",
      type:      "application/pdf",
      disposition: "attachment",
    }],
  });

  console.log("✅  Report e-mailed to", email);
}

/* util: collect raw request body */
function rawBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", c => chunks.push(c));
    req.on("end", () => resolve(Buffer.concat(chunks)));
    req.on("error", reject);
  });
}
