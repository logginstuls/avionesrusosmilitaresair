import express from "express";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

let messages = [];
let lastId = 0;

// 🟢 Endpoint para recibir mensajes del cliente
// ✅ Enviar mensaje (de cliente o agente)
app.post("/api/send", (req, res) => {
  const { sender, text, sessionId } = req.body;
  if (!sender || !text || !sessionId) {
    return res.status(400).json({ success: false, message: "Faltan datos o sessionId" });
  }

  // Si la sesión no existe, se crea
  if (!sessions[sessionId]) sessions[sessionId] = [];

  const newMessage = {
    id: ++lastId,
    sender,
    text,
    timestamp: new Date().toISOString(),
  };

  sessions[sessionId].push(newMessage);
  console.log(`💬 [${sessionId}] ${sender}: ${text}`);

  res.json({ success: true });
});

// ✅ Obtener mensajes de una sesión específica
app.post("/api/messages", (req, res) => {
  const { sessionId } = req.body;
  if (!sessionId) return res.status(400).json({ success: false, message: "Falta sessionId" });

  const chatMessages = sessions[sessionId] || [];
  res.json({ success: true, messages: chatMessages });
});


// 🟢 Endpoint para obtener todos los mensajes
app.post("/api/messages", (req, res) => {
  const { sessionId } = req.body;
  if (!sessionId) return res.status(400).json({ success: false, message: "Falta sessionId" });

  const chatMessages = sessions[sessionId] || [];
  res.json({ success: true, messages: chatMessages });
});

// 🟢 Endpoint para evitar que Render se duerma
app.get("/ping", (req, res) => {
  res.send("pong");
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`🚀 Servidor activo en puerto ${PORT}`));
// 🕐 Mantener Render despierto (polling cada 4 minutos)
if (process.env.RENDER === "true") {
  setInterval(async () => {
    try {
      const fetch = (await import("node-fetch")).default;
      await fetch(`https://${process.env.RENDER_EXTERNAL_URL || "tuapp.onrender.com"}/ping`);
      console.log("🔁 Ping enviado a Render");
    } catch (err) {
      console.log("Ping fallido:", err.message);
    }
  }, 240000); // 4 minutos
}
