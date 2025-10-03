const axios = require("axios");

exports.handler = async (event) => {
  // 🔐 Clave privada que vos definís
  const API_KEY = "sofia1234";

  // 🔑 Token personal de GitHub (con permisos de repo)
  const GITHUB_TOKEN = "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";

  // 📦 Repositorio y archivo a actualizar
  const REPO = "DeadFire-app/sofymdn";
  const FILE_PATH = "data.json";

  // 🛑 Solo aceptar POST
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Método no permitido" };
  }

  // 🔐 Validar API key
  if (event.headers["x-api-key"] !== API_KEY) {
    return { statusCode: 403, body: "API key inválida" };
  }

  try {
    // 📥 Extraer datos del cuerpo
    const { imagen, descripcion } = JSON.parse(event.body);
    if (!imagen || !descripcion) {
      return { statusCode: 400, body: "Faltan campos: imagen o descripcion" };
    }

    // 📄 Obtener contenido actual de data.json
    const fileRes = await axios.get(
      `https://api.github.com/repos/${REPO}/contents/${FILE_PATH}`,
      { headers: { Authorization: `token ${GITHUB_TOKEN}` } }
    );

    const sha = fileRes.data.sha;
    const contenido = Buffer.from(fileRes.data.content, "base64").toString("utf8");
    const productos = JSON.parse(contenido);

    // ➕ Agregar nuevo producto
    productos.push({ imagen, descripcion });

    // 📤 Subir nuevo contenido a GitHub
    const nuevoContenido = Buffer.from(JSON.stringify(productos, null, 2)).toString("base64");

    await axios.put(
      `https://api.github.com/repos/${REPO}/contents/${FILE_PATH}`,
      {
        message: "Agregar producto desde Telegram",
        content: nuevoContenido,
        sha
      },
      { headers: { Authorization: `token ${GITHUB_TOKEN}` } }
    );

    // ✅ Respuesta exitosa
    return {
      statusCode: 200,
      body: JSON.stringify({ ok: true, msg: "✅ Producto agregado" })
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: "Error interno: " + err.message
    };
  }
};