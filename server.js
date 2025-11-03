import express from "express";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

let messages = [];
let lastId = 0;

// 🟢 Endpoint para recibir mensajes del cliente
app.post("/api/send", (req, res) => {
  const { sender, text } = req.body;
  if (!sender || !text) {
    return res.status(400).json({ success: false, message: "Faltan datos" });
  }

  const newMessage = {
    id: ++lastId,
    sender,
    text,
    timestamp: new Date(),
  };

  messages.push(newMessage);
  console.log("💬 Nuevo mensaje recibido:", newMessage);
  res.json({ success: true });
});

// 🟢 Endpoint para obtener todos los mensajes
app.get("/api/messages", (req, res) => {
  res.json({ success: true, messages });
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
