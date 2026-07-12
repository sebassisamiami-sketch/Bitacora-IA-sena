// ============================================================================
//  Bitácora IA SENA — Lógica principal
//  - Guarda API key y modelo en localStorage
//  - Pide a OpenAI una respuesta JSON estructurada (response_format)
//  - Renderiza el JSON en la plantilla de bitácora
//  - Exporta a Word (.docx) con docxtemplater conservando el formato original
//  - Copiar / descargar en Markdown
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
  downloadWordBtn: $("downloadWordBtn"),
  plantilla: $("plantilla"),
  // modal
  configBtn: $("configBtn"),
  configModal: $("configModal"),
  apiKey: $("apiKey"),
  modelo: $("modelo"),
  saveConfig: $("saveConfig"),
  cancelConfig: $("cancelConfig"),
};

let ultimoJson = null;      // objeto JSON devuelto por la IA
let ultimaBitacoraMd = "";  // versión Markdown para copiar/descargar

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

function escapeHtml(s) {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function asArray(v) {
  if (Array.isArray(v)) return v;
  if (v === undefined || v === null || v === "") return [];
  return [v];
}

// ---- Config (API key + modelo) ------------------------------------------

function cargarConfig() {
  el.apiKey.value = localStorage.getItem(LS_KEY) || "";
  el.modelo.value = localStorage.getItem(LS_MODEL) || "gpt-4o-mini";
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
  if (key) localStorage.setItem(LS_KEY, key);
  else localStorage.removeItem(LS_KEY);
  localStorage.setItem(LS_MODEL, el.modelo.value);
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

  return `Genera la bitácora profesional del SENA respondiendo ÚNICAMENTE con el objeto JSON especificado.

CONTEXTO DEL ENCABEZADO (usa estos valores en datos_jornada):
- Fecha: ${fecha}
- Ubicación/Sede: ${ubicacion}
- Programa de Formación / Ficha: ${programa}
- Fase del Proyecto: ${fase}

NOTAS CRUDAS DEL APRENDIZ (transfórmalas en lenguaje técnico profesional, sin inventar datos que cambien el sentido):
"""
${notas}
"""`;
}

// ---- Normalización del JSON de la IA ------------------------------------

function normalizar(json) {
  const dj = json.datos_jornada || {};
  return {
    datos_jornada: {
      fecha: dj.fecha || "[Espacio para rellenar]",
      ubicacion: dj.ubicacion || "[Espacio para rellenar]",
      programa_ficha: dj.programa_ficha || "[Espacio para rellenar]",
      fase_proyecto: dj.fase_proyecto || "[Espacio para rellenar]",
    },
    objetivo_tecnico: json.objetivo_tecnico || "",
    actividades_realizadas: asArray(json.actividades_realizadas),
    integracion_automatizacion: json.integracion_automatizacion || "",
    hallazgos_soluciones: asArray(json.hallazgos_soluciones),
    recursos_utilizados: asArray(json.recursos_utilizados),
    plan_proxima_jornada: json.plan_proxima_jornada || "",
    sugerencias_evidencia_fotografica: asArray(json.sugerencias_evidencia_fotografica),
  };
}

// ---- Render HTML de la bitácora -----------------------------------------

function renderBitacora(b) {
  const li = (arr) => arr.map((x) => `<li>${escapeHtml(x)}</li>`).join("");
  const dj = b.datos_jornada;

  return `
    <h2>1. Encabezado Técnico</h2>
    <ul class="meta">
      <li><strong>Fecha:</strong> ${escapeHtml(dj.fecha)}</li>
      <li><strong>Ubicación/Sede:</strong> ${escapeHtml(dj.ubicacion)}</li>
      <li><strong>Programa / Ficha:</strong> ${escapeHtml(dj.programa_ficha)}</li>
      <li><strong>Fase del Proyecto:</strong> ${escapeHtml(dj.fase_proyecto)}</li>
    </ul>

    <h2>2. Objetivo Técnico de la Jornada</h2>
    <p>${escapeHtml(b.objetivo_tecnico)}</p>

    <h2>3. Descripción de Actividades Realizadas</h2>
    <ul>${li(b.actividades_realizadas)}</ul>

    <h2>4. Integración y Automatización</h2>
    <p>${escapeHtml(b.integracion_automatizacion)}</p>

    <h2>5. Hallazgos, Inconvenientes y Soluciones</h2>
    <ul>${li(b.hallazgos_soluciones)}</ul>

    <h2>6. Recursos e Insumos Utilizados</h2>
    <ul>${li(b.recursos_utilizados)}</ul>

    <h2>7. Plan de Acción para la Próxima Jornada</h2>
    <p>${escapeHtml(b.plan_proxima_jornada)}</p>

    <h2>8. Registro Fotográfico / Evidencia</h2>
    <ul>${li(b.sugerencias_evidencia_fotografica.map((s) => `[Insertar Evidencia: ${s}]`))}</ul>
  `;
}

// ---- Markdown (para copiar / descargar) ---------------------------------

function buildMarkdown(b) {
  const dj = b.datos_jornada;
  const bullets = (arr) => arr.map((x) => `- ${x}`).join("\n");
  return `# Bitácora de Proyecto / Obra

## 1. Encabezado Técnico
- **Fecha:** ${dj.fecha}
- **Ubicación/Sede:** ${dj.ubicacion}
- **Programa / Ficha:** ${dj.programa_ficha}
- **Fase del Proyecto:** ${dj.fase_proyecto}

## 2. Objetivo Técnico de la Jornada
${b.objetivo_tecnico}

## 3. Descripción de Actividades Realizadas
${bullets(b.actividades_realizadas)}

## 4. Integración y Automatización
${b.integracion_automatizacion}

## 5. Hallazgos, Inconvenientes y Soluciones
${bullets(b.hallazgos_soluciones)}

## 6. Recursos e Insumos Utilizados
${bullets(b.recursos_utilizados)}

## 7. Plan de Acción para la Próxima Jornada
${b.plan_proxima_jornada}

## 8. Registro Fotográfico / Evidencia
${bullets(b.sugerencias_evidencia_fotografica.map((s) => `[Insertar Evidencia: ${s}]`))}
`;
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
        response_format: { type: "json_object" },
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

    let parsed;
    try {
      parsed = JSON.parse(contenido);
    } catch (_) {
      throw new Error("La IA no devolvió un JSON válido. Intenta nuevamente.");
    }

    ultimoJson = normalizar(parsed);
    ultimaBitacoraMd = buildMarkdown(ultimoJson);
    el.resultado.innerHTML = renderBitacora(ultimoJson);

    el.copyBtn.disabled = false;
    el.downloadBtn.disabled = false;
    el.downloadWordBtn.disabled = false;
    setStatus("Bitácora generada. Revisa, copia o descárgala en Word/Markdown.", "ok");
  } catch (e) {
    setStatus("Error: " + e.message, "error");
  } finally {
    el.generarBtn.disabled = false;
  }
}

// ---- Exportar a Word (.docx) --------------------------------------------

async function generarWord() {
  if (!ultimoJson) return;

  if (!window.PizZip || !window.docxtemplater || !window.saveAs) {
    setStatus("No se pudieron cargar las librerías de Word (revisa tu conexión).", "error");
    return;
  }

  const urlPlantilla = el.plantilla.value;
  setStatus("Generando documento de Word…", "loading");

  try {
    const response = await fetch(urlPlantilla);
    if (!response.ok) throw new Error("No se encontró la plantilla seleccionada.");
    const arrayBuffer = await response.arrayBuffer();

    const zip = new window.PizZip(arrayBuffer);
    const Docxtemplater = window.docxtemplater;
    const doc = new Docxtemplater(zip, { paragraphLoop: true, linebreaks: true });

    const dj = ultimoJson.datos_jornada;
    doc.render({
      fecha: dj.fecha,
      ubicacion: dj.ubicacion,
      programa_ficha: dj.programa_ficha,
      fase_proyecto: dj.fase_proyecto,
      objetivo_tecnico: ultimoJson.objetivo_tecnico,
      actividades_realizadas: ultimoJson.actividades_realizadas,
      integracion_automatizacion: ultimoJson.integracion_automatizacion,
      hallazgos_soluciones: ultimoJson.hallazgos_soluciones,
      recursos_utilizados: ultimoJson.recursos_utilizados,
      plan_proxima_jornada: ultimoJson.plan_proxima_jornada,
      sugerencias_evidencia_fotografica: ultimoJson.sugerencias_evidencia_fotografica,
    });

    const out = doc.getZip().generate({
      type: "blob",
      mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    });

    const fechaArchivo = el.fecha.value || fechaHoyISO();
    window.saveAs(out, `Bitacora_SENA_${fechaArchivo}.docx`);
    setStatus("Documento de Word generado y descargado.", "ok");
  } catch (error) {
    console.error("Error al generar el documento:", error);
    setStatus("Error al generar el Word: " + (error?.message || error), "error");
  }
}

// ---- Copiar / Descargar Markdown ----------------------------------------

async function copiar() {
  if (!ultimaBitacoraMd) return;
  try {
    await navigator.clipboard.writeText(ultimaBitacoraMd);
    setStatus("Bitácora copiada al portapapeles.", "ok");
  } catch (_) {
    setStatus("No se pudo copiar automáticamente. Selecciónala manualmente.", "error");
  }
}

function descargarMd() {
  if (!ultimaBitacoraMd) return;
  const nombre = `bitacora_${el.fecha.value || fechaHoyISO()}.md`;
  const blob = new Blob([ultimaBitacoraMd], { type: "text/markdown;charset=utf-8" });
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
  el.downloadBtn.addEventListener("click", descargarMd);
  el.downloadWordBtn.addEventListener("click", generarWord);

  el.configBtn.addEventListener("click", abrirModal);
  el.saveConfig.addEventListener("click", guardarConfig);
  el.cancelConfig.addEventListener("click", cerrarModal);
  el.configModal.addEventListener("click", (e) => {
    if (e.target === el.configModal) cerrarModal();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !el.configModal.hidden) cerrarModal();
  });

  if (!localStorage.getItem(LS_KEY)) {
    setStatus("Configura tu API Key de OpenAI para comenzar (⚙️ Configuración).");
  }
}

document.addEventListener("DOMContentLoaded", init);
