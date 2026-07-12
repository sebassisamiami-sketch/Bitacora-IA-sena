# Bitácora de Proyecto / Obra

> **Ejemplo de referencia** generado con el prompt maestro "Arquitecto Experto SENA".
> Notas crudas de origen: *"Ficha 12345, programa automatización. Hoy fuimos a Melgar a revisar el terreno. Medimos el lote con cinta y miramos dónde poner los sensores de humedad para el riego. El Arduino no leía el sensor pero era un cable suelto. Mañana armamos el plano."*

---

## 1. Encabezado Técnico

- **Fecha:** 12 de julio de 2026
- **Ubicación/Sede:** Trabajo de campo — Predio de intervención, municipio de Melgar (Tolima)
- **Programa de Formación / Ficha:** Automatización de Edificaciones — Ficha 12345
- **Fase del Proyecto:** Análisis

## 2. Objetivo Técnico de la Jornada

La jornada tuvo como propósito ejecutar el reconocimiento preliminar del predio de intervención, realizar la medición dimensional del lote y determinar la disposición espacial preliminar de la instrumentación destinada al sistema de riego automatizado. Adicionalmente, se buscó validar la operatividad del nodo de sensado basado en microcontrolador, sentando las bases técnicas para la posterior elaboración del plano.

## 3. Descripción de Actividades Realizadas

- **Reconocimiento del terreno:** Se efectuó una inspección visual del predio con el fin de identificar condiciones topográficas, accesos, orientación y factores ambientales relevantes para el emplazamiento del sistema de riego.
- **Levantamiento dimensional preliminar:** Se realizó la medición del perímetro y de las dimensiones principales del lote mediante cinta métrica, registrando las magnitudes para su posterior representación gráfica y cálculo de áreas de cobertura.
- **Definición de puntos de instrumentación:** Se analizó la ubicación estratégica de los sensores de humedad de suelo, considerando la distribución del cultivo, las zonas de mayor demanda hídrica y la eficiencia del futuro sistema de riego automatizado.
- **Verificación del nodo de sensado:** Se puso en marcha el conjunto microcontrolador–sensor con el objeto de comprobar la correcta adquisición de la señal de humedad.

## 4. Integración y Automatización

- **Hardware de control:** Nodo basado en placa microcontroladora (Arduino) encargado de la lectura de la variable de humedad del suelo, como primer eslabón del futuro lazo de control del sistema de riego automatizado.
- **Instrumentación:** Sensores de humedad de suelo previstos para la retroalimentación del sistema, base para una eventual estrategia de riego por umbrales o control ON/OFF de actuadores (electroválvulas/bomba).
- **Herramientas de diseño (previstas para la siguiente fase):** Software CAD (p. ej. AutoCAD) para la elaboración del plano de distribución de la instrumentación y las líneas de riego.

## 5. Hallazgos, Inconvenientes y Soluciones

- **Inconveniente:** Durante la verificación inicial, el nodo microcontrolador no registraba lectura del sensor de humedad.
- **Diagnóstico:** Se aplicó un procedimiento de revisión del cableado y de las conexiones del circuito, identificando una conexión suelta en la interfaz sensor–microcontrolador como causa raíz de la ausencia de señal.
- **Solución:** Se restableció la conexión física del conductor afectado, tras lo cual el sistema recuperó la correcta adquisición de la señal. Se recomienda, para etapas posteriores, asegurar las conexiones mediante borneras o soldadura para mitigar fallos por vibración o manipulación.

## 6. Recursos e Insumos Utilizados

- Cinta métrica para el levantamiento dimensional.
- Placa microcontroladora Arduino.
- Sensor(es) de humedad de suelo.
- Cableado de conexión y elementos de prototipado (protoboard).
- Elementos de registro de campo (libreta técnica / dispositivo móvil para toma de datos).

## 7. Plan de Acción para la Próxima Jornada

- Elaborar el plano de distribución del predio con la ubicación definitiva de los puntos de instrumentación y el trazado de las líneas de riego, empleando software CAD.
- Consolidar el registro de mediciones y calcular las áreas de cobertura por sector.
- Definir la arquitectura preliminar del lazo de control (sensor → microcontrolador → actuador).

## 8. Registro Fotográfico / Evidencia

- [Insertar Evidencia 1: Panorámica general del predio de intervención en Melgar]
- [Insertar Evidencia 2: Proceso de medición del lote con cinta métrica]
- [Insertar Evidencia 3: Puntos tentativos de instalación de los sensores de humedad]
- [Insertar Evidencia 4: Montaje del nodo Arduino–sensor y verificación de la conexión corregida]
