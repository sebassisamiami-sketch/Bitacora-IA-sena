#!/usr/bin/env python3
"""
Genera las plantillas .docx para docxtemplater.

Autoramos el OpenXML a mano para que cada etiqueta {tag} quede dentro de un
único run <w:r>, evitando el problema clásico de "etiquetas partidas" que se
produce al escribir las llaves manualmente dentro de Microsoft Word.

Salida:
  assets/plantillas/plantilla_moderna.docx
  assets/plantillas/plantilla_sena_oficial.docx
"""
import os
import zipfile

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT_DIR = os.path.join(BASE, "assets", "plantillas")

CONTENT_TYPES = """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/></Types>"""

RELS = """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>"""

W = 'xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"'


def heading(num_title, accent, ink):
    return (
        '<w:p><w:pPr><w:spacing w:before="220" w:after="80"/>'
        f'<w:pBdr><w:bottom w:val="single" w:sz="6" w:space="1" w:color="{accent}"/></w:pBdr>'
        '</w:pPr>'
        f'<w:r><w:rPr><w:b/><w:color w:val="{ink}"/><w:sz w:val="26"/></w:rPr>'
        f'<w:t xml:space="preserve">{num_title}</w:t></w:r></w:p>'
    )


def label_line(label, tag, ink):
    return (
        '<w:p><w:pPr><w:spacing w:after="40"/></w:pPr>'
        f'<w:r><w:rPr><w:b/><w:color w:val="{ink}"/></w:rPr>'
        f'<w:t xml:space="preserve">{label}: </w:t></w:r>'
        f'<w:r><w:t>{{{tag}}}</w:t></w:r></w:p>'
    )


def paragraph(tag):
    return (
        '<w:p><w:pPr><w:spacing w:after="120"/><w:jc w:val="both"/></w:pPr>'
        f'<w:r><w:t>{{{tag}}}</w:t></w:r></w:p>'
    )


def bullet_loop(tag):
    # docxtemplater paragraphLoop: los párrafos que sólo contienen la etiqueta
    # de apertura/cierre se eliminan; el párrafo intermedio se repite por ítem.
    return (
        f'<w:p><w:r><w:t>{{#{tag}}}</w:t></w:r></w:p>'
        '<w:p><w:pPr><w:ind w:left="360"/><w:spacing w:after="60"/></w:pPr>'
        '<w:r><w:t xml:space="preserve">\u2022  {.}</w:t></w:r></w:p>'
        f'<w:p><w:r><w:t>{{/{tag}}}</w:t></w:r></w:p>'
    )


def build_document(title, subtitle, accent, ink, subtle):
    body = []
    # Título
    body.append(
        '<w:p><w:pPr><w:jc w:val="center"/><w:spacing w:after="60"/></w:pPr>'
        f'<w:r><w:rPr><w:b/><w:sz w:val="40"/><w:color w:val="{ink}"/></w:rPr>'
        f'<w:t xml:space="preserve">{title}</w:t></w:r></w:p>'
    )
    body.append(
        '<w:p><w:pPr><w:jc w:val="center"/><w:spacing w:after="240"/></w:pPr>'
        f'<w:r><w:rPr><w:sz w:val="20"/><w:color w:val="{subtle}"/></w:rPr>'
        f'<w:t xml:space="preserve">{subtitle}</w:t></w:r></w:p>'
    )
    # 1. Encabezado
    body.append(heading("1. Encabezado Tecnico", accent, ink))
    body.append(label_line("Fecha", "fecha", ink))
    body.append(label_line("Ubicacion / Sede", "ubicacion", ink))
    body.append(label_line("Programa de Formacion / Ficha", "programa_ficha", ink))
    body.append(label_line("Fase del Proyecto", "fase_proyecto", ink))
    # 2. Objetivo
    body.append(heading("2. Objetivo Tecnico de la Jornada", accent, ink))
    body.append(paragraph("objetivo_tecnico"))
    # 3. Actividades
    body.append(heading("3. Descripcion de Actividades Realizadas", accent, ink))
    body.append(bullet_loop("actividades_realizadas"))
    # 4. Integracion
    body.append(heading("4. Integracion y Automatizacion", accent, ink))
    body.append(paragraph("integracion_automatizacion"))
    # 5. Hallazgos
    body.append(heading("5. Hallazgos, Inconvenientes y Soluciones", accent, ink))
    body.append(bullet_loop("hallazgos_soluciones"))
    # 6. Recursos
    body.append(heading("6. Recursos e Insumos Utilizados", accent, ink))
    body.append(bullet_loop("recursos_utilizados"))
    # 7. Plan
    body.append(heading("7. Plan de Accion para la Proxima Jornada", accent, ink))
    body.append(paragraph("plan_proxima_jornada"))
    # 8. Evidencia
    body.append(heading("8. Registro Fotografico / Evidencia", accent, ink))
    body.append(bullet_loop("sugerencias_evidencia_fotografica"))
    # sectPr
    body.append(
        '<w:sectPr><w:pgSz w:w="12240" w:h="15840"/>'
        '<w:pgMar w:top="1440" w:right="1440" w:bottom="1440" w:left="1440" '
        'w:header="720" w:footer="720" w:gutter="0"/></w:sectPr>'
    )
    return (
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n'
        f'<w:document {W}><w:body>' + "".join(body) + '</w:body></w:document>'
    )


def write_docx(path, document_xml):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with zipfile.ZipFile(path, "w", zipfile.ZIP_DEFLATED) as z:
        z.writestr("[Content_Types].xml", CONTENT_TYPES)
        z.writestr("_rels/.rels", RELS)
        z.writestr("word/document.xml", document_xml)


def main():
    # Plantilla Moderna (acento verde SENA)
    moderna = build_document(
        title="BITACORA DE PROYECTO / OBRA",
        subtitle="SENA - Automatizacion de Edificaciones",
        accent="39A900", ink="0F2536", subtle="5C6B76",
    )
    write_docx(os.path.join(OUT_DIR, "plantilla_moderna.docx"), moderna)

    # Plantilla SENA Oficial (acento azul institucional)
    oficial = build_document(
        title="BITACORA DE PROYECTO - SENA",
        subtitle="Servicio Nacional de Aprendizaje - Reporte Tecnico de Jornada",
        accent="1F3864", ink="1F3864", subtle="404040",
    )
    write_docx(os.path.join(OUT_DIR, "plantilla_sena_oficial.docx"), oficial)

    print("Plantillas generadas en:", OUT_DIR)
    for f in sorted(os.listdir(OUT_DIR)):
        full = os.path.join(OUT_DIR, f)
        print(f"  - {f} ({os.path.getsize(full)} bytes)")


if __name__ == "__main__":
    main()
