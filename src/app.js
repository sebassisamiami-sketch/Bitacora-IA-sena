// ============================================================================
//  Bitácora IA SENA — Lógica principal
//  - Guarda API key y modelo en localStorage
//  - Arma el prompt del usuario a partir del formulario
//  - Llama a la API de OpenAI (Chat Completions)
//  - Renderiza la respuesta (Markdown ligero) y permite copiar/descargar
// ============================================================================

import { SYSTEM_PROMPT } from "./prompt.js";

const LS_KEY = "bitacora_sena_apikey";
const LS_MODEL = "bitacora_sena_model";
const OPENAI_URL = "https://api.openai.com/v1/chat/completions";

// ---- Referencias al DOM --------------------------------------------------
const $ = (id) => document.getElementById(id);

const el = {
  fecha: $("fecha"),
  fase: $("fase"),
  ubicacion: $("ubicacion"),
  programa: $("programa"),
  notas: $("notas"),
  generarBtn: $("generarBtn"),
  statusMsg: $("statusMsg"),
  resultado: $("resultado"),
  copyBtn: $("copyBtn"),
  downloadBtn: $("downloadBtn"),
  // modal
  configBtn: $("configBtn"),
  configModal: $("configModal"),
  apiKey: $("apiKey"),
  modelo: $("modelo"),
  saveConfig: $("saveConfig"),
  cancelConfig: $("cancelConfig"),
};

let ultimaBitacora = ""; // texto markdown de la última bitácora generada

// ---- Utilidades ----------------------------------------------------------

function setStatus(msg, tipo = "") {
  el.statusMsg.textContent = msg;
  el.statusMsg.className = "status" + (tipo ? " " + tipo : "");
}

function fechaHoyISO() {
  const d = new Date();
  const off = d.getTimezoneOffset();
  return new Date(d.getTime() - off * 60000).toISOString().slice(0, 10);
}

function fechaLegible(iso) {
  if (!iso) return "[Espacio para rellenar]";
  const [y, m, d] = iso.split("-");
  const meses = ["enero","febrero","marzo","abril","mayo","junio","julio","agosto","septiembre","octubre","noviembre","diciembre"];
  return `${parseInt(d, 10)} de ${meses[parseInt(m, 10) - 1]} de ${y}`;
}

// ---- Config (API key + modelo) ------------------------------------------

function cargarConfig() {
  const key = localStorage.getItem(LS_KEY) || "";
  const model = localStorage.getItem(LS_MODEL) || "gpt-4o-mini";
  el.apiKey.value = key;
  el.modelo.value = model;
}

function abrirModal() {
  cargarConfig();
  el.configModal.hidden = false;
  el.apiKey.focus();
}

function cerrarModal() {
  el.configModal.hidden = true;
}

function guardarConfig() {
  const key = el.apiKey.value.trim();
  const model = el.modelo.value;
  if (key) localStorage.setItem(LS_KEY, key);
  else localStorage.removeItem(LS_KEY);
  localStorage.setItem(LS_MODEL, model);
  cerrarModal();
  setStatus("Configuración guardada correctamente.", "ok");
}

// ---- Construcción del mensaje de usuario --------------------------------

function construirPromptUsuario() {
  const fecha = fechaLegible(el.fecha.value);
  const fase = el.fase.value || "[Espacio para rellenar]";
  const ubicacion = el.ubicacion.value.trim() || "[Espacio para rellenar]";
  const programa = el.programa.value.trim() || "[Espacio para rellenar]";
  const notas = el.notas.value.trim();

  return `Genera la bitácora profesional del SENA usando la estructura obligatoria.

DATOS DEL ENCABEZADO:
- Fecha: ${fecha}
- Ubicación/Sede: ${ubicacion}
- Programa de Formación / Ficha: ${programa}
- Fase del Proyecto: ${fase}

NOTAS CRUDAS DEL APRENDIZ (transfórmalas en lenguaje técnico profesional, sin inventar datos que cambien el sentido):
"""
${notas}
"""`;
}

// ---- Render Markdown ligero (sin dependencias externas) ------------------

function escapeHtml(s) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function renderMarkdown(md) {
  const lines = md.split("\n");
  let html = "";
  let inList = false;

  const closeList = () => {
    if (inList) { html += "</ul>"; inList = false; }
  };

  const inline = (t) => {
    t = escapeHtml(t);
    t = t.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
    t = t.replace(/\*(.+?)\*/g, "<em>$1</em>");
    t = t.replace(/`(.+?)`/g, "<code>$1</code>");
    return t;
  };

  for (let raw of lines) {
    const line = raw.trimEnd();
    if (/^###\s+/.test(line)) { closeList(); html += `<h3>${inline(line.replace(/^###\s+/, ""))}</h3>`; }
    else if (/^##\s+/.test(line)) { closeList(); html += `<h2>${inline(line.replace(/^##\s+/, ""))}</h2>`; }
    else if (/^#\s+/.test(line)) { closeList(); html += `<h2>${inline(line.replace(/^#\s+/, ""))}</h2>`; }
    else if (/^\s*[-*]\s+/.test(line)) {
      if (!inList) { html += "<ul>"; inList = true; }
      html += `<li>${inline(line.replace(/^\s*[-*]\s+/, ""))}</li>`;
    }
    else if (line.trim() === "") { closeList(); }
    else { closeList(); html += `<p>${inline(line)}</p>`; }
  }
  closeList();
  return html;
}

// ---- Llamada a OpenAI ----------------------------------------------------

async function generarBitacora() {
  const apiKey = localStorage.getItem(LS_KEY);
  const model = localStorage.getItem(LS_MODEL) || "gpt-4o-mini";

  if (!apiKey) {
    setStatus("Primero configura tu API Key de OpenAI (⚙️ Configuración).", "error");
    abrirModal();
    return;
  }
  if (!el.notas.value.trim()) {
    setStatus("Escribe al menos unas notas del día para generar la bitácora.", "error");
    el.notas.focus();
    return;
  }

  el.generarBtn.disabled = true;
  setStatus("Redactando bitácora profesional… esto puede tardar unos segundos.", "loading");

  try {
    const resp = await fetch(OPENAI_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        temperature: 0.5,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: construirPromptUsuario() },
        ],
      }),
    });

    if (!resp.ok) {
      let detalle = `HTTP ${resp.status}`;
      try {
        const err = await resp.json();
        detalle = err?.error?.message || detalle;
      } catch (_) {}
      if (resp.status === 401) detalle = "API Key inválida o sin permisos. Revísala en ⚙️ Configuración.";
      if (resp.status === 429) detalle = "Límite de uso o cuota agotada en tu cuenta de OpenAI.";
      throw new Error(detalle);
    }

    const data = await resp.json();
    const contenido = data?.choices?.[0]?.message?.content?.trim();
    if (!contenido) throw new Error("La respuesta de la IA llegó vacía. Intenta nuevamente.");

    ultimaBitacora = contenido;
    el.resultado.innerHTML = renderMarkdown(contenido);
    el.copyBtn.disabled = false;
    el.downloadBtn.disabled = false;
    setStatus("Bitácora generada correctamente. Revisa, copia o descarga.", "ok");
  } catch (e) {
    setStatus("Error: " + e.message, "error");
  } finally {
    el.generarBtn.disabled = false;
  }
}

// ---- Copiar / Descargar --------------------------------------------------

async function copiar() {
  if (!ultimaBitacora) return;
  try {
    await navigator.clipboard.writeText(ultimaBitacora);
    setStatus("Bitácora copiada al portapapeles.", "ok");
  } catch (_) {
    setStatus("No se pudo copiar automáticamente. Selecciónala manualmente.", "error");
  }
}

function descargar() {
  if (!ultimaBitacora) return;
  const nombre = `bitacora_${el.fecha.value || fechaHoyISO()}.md`;
  const blob = new Blob([ultimaBitacora], { type: "text/markdown;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = nombre;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  setStatus(`Archivo "${nombre}" descargado.`, "ok");
}

// ---- Inicialización ------------------------------------------------------

function init() {
  el.fecha.value = fechaHoyISO();
  cargarConfig();

  el.generarBtn.addEventListener("click", generarBitacora);
  el.copyBtn.addEventListener("click", copiar);
  el.downloadBtn.addEventListener("click", descargar);

  el.configBtn.addEventListener("click", abrirModal);
  el.saveConfig.addEventListener("click", guardarConfig);
  el.cancelConfig.addEventListener("click", cerrarModal);
  el.configModal.addEventListener("click", (e) => {
    if (e.target === el.configModal) cerrarModal();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !el.configModal.hidden) cerrarModal();
  });

  // Si no hay API key guardada, invita a configurar.
  if (!localStorage.getItem(LS_KEY)) {
    setStatus("Configura tu API Key de OpenAI para comenzar (⚙️ Configuración).");
  }
}

document.addEventListener("DOMContentLoaded", init);
