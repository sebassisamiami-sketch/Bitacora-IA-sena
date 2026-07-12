# 📐 Bitácora IA SENA

Aplicación web que convierte **notas crudas y desordenadas** de tu jornada de trabajo en una **Bitácora de Proyecto/Obra profesional**, estructurada según los estándares académicos y técnicos del **SENA (Servicio Nacional de Aprendizaje)**.

La IA actúa como un **Arquitecto Experto, Especialista en Automatización de Edificaciones y Gestor de Proyectos Senior**: toma tus apuntes informales y los transforma en un documento formal con vocabulario técnico preciso (levantamiento topográfico, PLC, actuadores, cronograma de obra, mitigación de riesgos, BIM, etc.).

---

## ✨ Características

- Formulario simple: fecha, sede, programa/ficha, fase del proyecto y notas libres.
- Genera la bitácora con la **estructura obligatoria** de 8 secciones:
  1. Encabezado Técnico
  2. Objetivo Técnico de la Jornada
  3. Descripción de Actividades Realizadas
  4. Integración y Automatización
  5. Hallazgos, Inconvenientes y Soluciones
  6. Recursos e Insumos Utilizados
  7. Plan de Acción para la Próxima Jornada
  8. Registro Fotográfico / Evidencia (con marcadores `[Insertar Evidencia X]`)
- Botones para **copiar** y **descargar** la bitácora en formato Markdown (`.md`).
- **Sin servidor**: es una página estática. Tu **API Key se guarda solo en tu navegador** (localStorage) y nunca se sube al repositorio.

---

## 🚀 Cómo usarla

### 1. Obtén una API Key de OpenAI
Crea una en [platform.openai.com/api-keys](https://platform.openai.com/api-keys).

### 2. Ábrela localmente
Al ser una página estática, puedes abrir `index.html` directamente, aunque se recomienda servirla por HTTP para que funcionen los módulos de JavaScript:

```bash
# Con Python (viene preinstalado en la mayoría de sistemas)
python3 -m http.server 8000
```

Luego visita **http://localhost:8000** en tu navegador.

### 3. Configura y genera
1. Haz clic en **⚙️ Configuración** e ingresa tu API Key (elige el modelo, por defecto `gpt-4o-mini`).
2. Completa los datos de la jornada y escribe tus notas sueltas.
3. Presiona **✨ Generar Bitácora**.
4. **Copia** o **descarga** el resultado.

---

## 🌐 Publicar en GitHub Pages

1. Sube el proyecto a la rama `main` (o a la rama que prefieras).
2. En GitHub: **Settings → Pages**.
3. En *Source*, elige **Deploy from a branch**, selecciona la rama y la carpeta `/root`.
4. Guarda. En unos minutos tu app estará disponible en:
   `https://<tu-usuario>.github.io/Bitacora-IA-sena/`

> Cada usuario ingresa su propia API Key en su navegador; no se comparte ni se publica.

---

## 🗂️ Estructura del proyecto

```
Bitacora-IA-sena/
├── index.html        # Interfaz de usuario
├── README.md         # Este archivo
└── src/
    ├── app.js        # Lógica: formulario, llamada a OpenAI, render y descarga
    ├── prompt.js     # Prompt maestro "Arquitecto Experto SENA"
    └── styles.css    # Estilos (paleta verde SENA + acero)
```

---

## 🔒 Privacidad y seguridad

- La API Key se almacena **únicamente** en el `localStorage` de tu navegador.
- Las solicitudes van **directamente** desde tu navegador a la API de OpenAI.
- Este repositorio **no** contiene ninguna clave ni dato personal.

> ⚠️ Nota: como es una app puramente frontend, la key es visible para quien use ese mismo navegador. Para un despliegue público de alto tráfico, se recomienda añadir un backend que proteja la clave.

---

## 🛠️ Ejemplo de uso

**Notas crudas:**
> Ficha 12345, programa automatización. Hoy fuimos a Melgar a revisar el terreno. Medimos el lote con cinta y miramos dónde poner los sensores de humedad para el riego. El Arduino no leía el sensor pero era un cable suelto. Mañana armamos el plano.

**Resultado:** una bitácora técnica con levantamiento preliminar del predio, análisis de puntos de instrumentación para el sistema de riego automatizado, diagnóstico del fallo de lectura del sensor y plan de acción para el diseño del plano.

---

*Herramienta educativa desarrollada para aprendices del SENA.*
