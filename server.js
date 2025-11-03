import express from "express";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());


// ======================================================
// 📦 SERVER REALIZADO POR PABLITO TU PAPA 4EVER
// ======================================================
// ======================================================
// 📦 Almacenamiento en memoria (simulando base de datos)
// ======================================================
let sessions = {};  // 🔥 ESTA VARIABLE ES LA CLAVE
let lastId = 0;

// ======================================================
// 📩 Enviar mensaje (cliente o asesor)
// ======================================================
app.post("/api/send", (req, res) => {
  const { sender, text, sessionId } = req.body;

  if (!sender || !text || !sessionId) {
    return res.status(400).json({ success: false, message: "Faltan datos o sessionId" });
  }

  // Crear sesión si no existe
  if (!sessions[sessionId]) sessions[sessionId] = [];

  const newMessage = {
    id: ++lastId,
    sender,
    text,
    timestamp: new Date().toISOString(),
  };

  sessions[sessionId].push(newMessage);
  console.log(`💬 [${sessionId}] ${sender}: ${text}`);

  return res.json({ success: true });
});

// ======================================================
// 💬 Obtener mensajes de una sesión específica
// ======================================================
app.post("/api/messages", (req, res) => {
  const { sessionId } = req.body;
  if (!sessionId) {
    return res.status(400).json({ success: false, message: "Falta sessionId" });
  }

  const chatMessages = sessions[sessionId] || [];
  return res.json({ success: true, messages: chatMessages });
});

// ======================================================
// 🧩 Obtener lista de sesiones activas (opcional para panel futuro)
// ======================================================
app.get("/api/sessions", (req, res) => {
  const list = Object.keys(sessions).map(id => ({
    id,
    messageCount: sessions[id].length,
  }));
  return res.json({ success: true, sessions: list });
});

// ======================================================
// 🟢 Endpoint para evitar que Render se duerma
// ======================================================
app.get("/ping", (req, res) => {
  res.send("pong");
});
// Permitir GET temporal para debug
app.get("/api/messages", (req, res) => {
  res.json({
    success: true,
    message: "Usa POST con sessionId para obtener mensajes específicos."
  });
});

// ======================================================
// ✏️ Renombrar sesión
// ======================================================
app.post("/api/rename-session", (req, res) => {
  const { sessionId, newName } = req.body;
  if (!sessionId || !newName) {
    return res.status(400).json({ success: false, message: "Faltan datos" });
  }

  // Guardar el nombre dentro del objeto de sesión
  if (!sessions[sessionId]) {
    return res.status(404).json({ success: false, message: "Sesión no encontrada" });
  }

  if (!sessions[sessionId].meta) sessions[sessionId].meta = {};
  sessions[sessionId].meta.name = newName;
  console.log(`✏️ Sesión ${sessionId} renombrada a "${newName}"`);

  return res.json({ success: true, message: "Sesión renombrada correctamente" });
});

// ======================================================
// 🗑️ Eliminar sesión
// ======================================================
app.post("/api/delete-session", (req, res) => {
  const { sessionId } = req.body;
  if (!sessionId) {
    return res.status(400).json({ success: false, message: "Falta sessionId" });
  }

  if (!sessions[sessionId]) {
    return res.status(404).json({ success: false, message: "Sesión no encontrada" });
  }

  delete sessions[sessionId];
  console.log(`🗑️ Sesión eliminada: ${sessionId}`);

  return res.json({ success: true, message: "Sesión eliminada correctamente" });
});


// ======================================================
// 🚀 Inicializar servidor
// ======================================================
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`🚀 Servidor activo en puerto ${PORT}`));

// ======================================================
// 🔁 Mantener Render despierto (cada 4 minutos)
// ======================================================
if (process.env.RENDER === "true") {
  setInterval(async () => {
    try {
      const fetch = (await import("node-fetch")).default;
      await fetch(`https://${process.env.RENDER_EXTERNAL_URL || "avionesrusosmilitaresair.onrender.com"}/ping`);
      console.log("🔁 Ping enviado a Render");
    } catch (err) {
      console.log("Ping fallido:", err.message);
    }
  }, 240000);
}
