#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
Parser de Kárdex UniSon

- Usa pdfplumber para extraer texto y filas de la tabla.
- Repara acentos y mojibake (ftfy + normalización NFC).
- Devuelve JSON estructurado y tipado:

  {
    "ok": True,
    "alumno": {...},
    "materias": [...],
    "resumen": {...}
  }

La lógica de inserción/actualización en BD (UPSERT) va en el backend.
"""

import sys
import json
import re
import unicodedata
from pathlib import Path
from typing import Any, Dict, List, Optional

# ---------- Dependencias de extracción ----------
try:
    import pdfplumber  # Para tablas y texto
except Exception as e:
    raise SystemExit("Instala pdfplumber: pip install pdfplumber") from e

# ftfy para reparar mojibake de acentos
try:
    from ftfy import fix_text
except Exception:  # pragma: no cover
    def fix_text(x: str) -> str:
        return x


# ============================================================
# Utilidades
# ============================================================

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

def fix_unicode(s: Optional[str]) -> str:
    """Repara mojibake y normaliza a NFC."""
    if not s:
        return ""
    s = fix_text(s)
    return unicodedata.normalize("NFC", s)


def normalize_spaces(s: str) -> str:
    return re.sub(r"[ \t]+", " ", s).strip()


def cic_to_period_label(cic: Optional[str]) -> Optional[str]:
    """
    Convierte CIC (4 dígitos) a etiqueta de periodo, según la codificación
    de la UniSon. Ejemplos proporcionados:

      2222 -> 2022-2
      2231 -> 2023-1
      2232 -> 2023-2
      2241 -> 2024-1
      2242 -> 2024-2
      2251 -> 2025-1
      2252 -> 2025-2
    """
    if not cic:
        return None
    cic = cic.strip()
    if not re.fullmatch(r"\d{4}", cic):
        return None
    a, _, c, d = cic  # '2', '2', '3', '1' en 2231
    year = 2000 + (10 * int(a) + int(c))
    ciclo = int(d)
    return f"{year}-{ciclo}"


def parse_int_or_none(s: Optional[str]) -> Optional[int]:
    if not s:
        return None
    s = s.strip().replace("*", "")
    if not s:
        return None
    if not re.fullmatch(r"-?\d+", s):
        return None
    try:
        return int(s)
    except Exception:
        return None


def parse_grade(s: Optional[str]) -> Optional[int]:
    """
    Convierte '090' -> 90, '100' -> 100, etc.
    Devuelve None si no es calificación numérica (ACREDITADA, BV, etc.).
    """
    if not s:
        return None
    s = s.strip().replace("*", "")
    if not re.fullmatch(r"\d{2,3}", s):
        return None
    val = int(s)
    if 0 <= val <= 100:
        return val
    return None


# ============================================================
# 1) TEXTO COMPLETO + CABECERA + NIVEL DE INGLÉS
# ============================================================

def read_text(path: Path) -> str:
    """
    Extrae texto del PDF con pdfplumber, repara acentos.
    """
    pages_text: List[str] = []
    with pdfplumber.open(str(path)) as pdf:
        for page in pdf.pages:
            page_text = page.extract_text() or ""
            pages_text.append(fix_unicode(page_text))
    return "\n".join(pages_text)


def extract_english_info(raw_text: str) -> Dict[str, Any]:
    """
    Busca la línea tipo:
      ACREDITACIÓN DE INGLÉS: ACREDITADO 5.00 DE 5
    """
    raw_text = fix_unicode(raw_text)
    m = re.search(
        r"ACREDITACI[ÓO]N DE INGL[ÉE]S:\s*([A-ZÁÉÍÓÚ ]+?)\s+([0-9]+(?:\.[0-9]+)?)\s*DE\s*([0-9]+(?:\.[0-9]+)?)",
        raw_text,
        re.I,
    )
    if not m:
        return {}

    estado = normalize_spaces(m.group(1)).upper()
    nivel = float(m.group(2))
    maximo_pdf = float(m.group(3))

    requerido_carrera = 5.0
    maximo_carrera = 7.0
    cumple = nivel >= requerido_carrera

    return {
        "estado": estado,
        "nivel": nivel,
        "maximo_pdf": maximo_pdf,
        "requerido_carrera": requerido_carrera,
        "maximo_carrera": maximo_carrera,
        "cumple_requisito": cumple,
    }


def extract_header(raw_text: str) -> Dict[str, Any]:
    """
    Cabecera típica:
      PROGRAMA: ...
      PLAN: 2182
      UNIDAD: HERMOSILLO
      EXPEDIENTE: 222202156  NOMBRE COMPLETO
      ESTATUS: A .. Alumno activo....
      Fecha: 21/09/2025
    """
    raw_text = fix_unicode(raw_text)

    # Quitamos ruidos comunes
    cleaned = re.sub(
        r"Universidad de Sonora.*?KÁRDEX ELECTRÓNICO",
        "",
        raw_text,
        flags=re.S,
    )
    cleaned = re.sub(r"Pagina \d+ de \d+", "", cleaned)
    cleaned = cleaned.replace(".. Alumno activo....", "")  # deja solo 'ESTATUS: A'

    def grab(pat: str, s: str = cleaned, flags: int = re.M) -> Optional[str]:
        m = re.search(pat, s, flags)
        return normalize_spaces(fix_unicode(m.group(1))) if m else None

    header: Dict[str, Any] = {
        "fecha": grab(r"Fecha:\s*(.*)"),
        "programa": grab(r"PROGRAMA:\s*(.*)"),
        "plan": grab(r"PLAN:\s*(\d+)"),
        "unidad": grab(r"UNIDAD:\s*(.*)"),
        "expediente": grab(r"EXPEDIENTE:\s*([0-9]+)"),
        "alumno": grab(r"EXPEDIENTE:\s*[0-9]+\s+(.*)"),
        "estatus": grab(r"ESTATUS:\s*(.*)"),
    }

    ingles = extract_english_info(raw_text)
    if ingles:
        header["ingles"] = ingles

    # Limpia None
    return {k: v for k, v in header.items() if v is not None}


# ============================================================
# 2) PARSEO DE UNA FILA DE MATERIA (TOKENS)
# ============================================================

def parse_subject_tokens(tokens: List[str]) -> Optional[Dict[str, Any]]:
    """
    Recibe una lista de tokens (split por espacio) que representan una fila completa
    y la intenta interpretar como:

      CR CVE <NOMBRE ...> E1 E2 [ORD/REG opcionales dispersos] CIC I R B
    """
    if len(tokens) < 6:
        return None

    # Validar CR y CVE al inicio
    cr_tok, cve_tok = tokens[0], tokens[1]
    if not (re.fullmatch(r"\d{2}", cr_tok) and re.fullmatch(r"\d{3,5}", cve_tok)):
        return None

    # Al final deben venir ... CIC I R B
    if len(tokens) < 6:
        return None
    cic_tok = tokens[-4]
    I_tok = tokens[-3]
    R_tok = tokens[-2]
    B_tok = tokens[-1]
    if not (
        re.fullmatch(r"\d{4}", cic_tok)
        and re.fullmatch(r"\d{2}", I_tok)
        and re.fullmatch(r"\d{2}", R_tok)
        and re.fullmatch(r"\d{2}", B_tok)
    ):
        return None

    cr = int(cr_tok)
    codigo = cve_tok
    cic = cic_tok
    ins = parse_int_or_none(I_tok)
    rep = parse_int_or_none(R_tok)
    bajas = parse_int_or_none(B_tok)

    mid_tokens = tokens[2:-4]  # entre CVE y CIC
    if len(mid_tokens) < 2:
        return None

    # 1) Detectar calificaciones numéricas dentro de mid_tokens
    grade_positions: List[int] = []
    grade_values: List[int] = []
    for idx, tok in enumerate(mid_tokens):
        g = parse_grade(tok)
        if g is not None:
            grade_positions.append(idx)
            grade_values.append(g)

    mid_tokens_clean = [
        tok for i, tok in enumerate(mid_tokens) if i not in grade_positions
    ]

    ord_val: Optional[int] = None
    reg_val: Optional[int] = None
    if grade_values:
        ord_val = grade_values[0]
        if len(grade_values) > 1:
            reg_val = grade_values[1]

    # 2) E1/E2 al final de mid_tokens_clean
    e1 = None
    e2 = None
    nombre_tokens: List[str] = mid_tokens_clean

    if len(mid_tokens_clean) >= 2:
        e1 = mid_tokens_clean[-2]
        e2 = mid_tokens_clean[-1]
        nombre_tokens = mid_tokens_clean[:-2]
    elif len(mid_tokens_clean) == 1:
        e2 = mid_tokens_clean[-1]
        nombre_tokens = []

    nombre = normalize_spaces(" ".join(nombre_tokens))
    if not nombre:
        # En caso de que no haya nombre, no consideramos la fila
        return None

    return {
        "cr": cr,
        "codigo": codigo,
        "nombre": nombre,
        "e1": e1,
        "e2": e2,
        "ord": ord_val,
        "reg": reg_val,
        "cic": cic,
        "inscripciones": ins,
        "reprobaciones": rep,
        "bajas": bajas,
    }


# ============================================================
# 3) MATERIAS DESDE TABLAS Y DESDE TEXTO
# ============================================================

def extract_subjects_from_tables(path: Path) -> List[Dict[str, Any]]:
    materias: List[Dict[str, Any]] = []

    with pdfplumber.open(str(path)) as pdf:
        for page in pdf.pages:
            tables = page.extract_tables() or []
            for t in tables:
                for row in t:
                    if not row:
                        continue
                    cells = [fix_unicode((c or "").strip()) for c in row]
                    row_text = normalize_spaces(" ".join(cells))
                    if not row_text:
                        continue
                    up = row_text.upper()
                    if up.startswith("CR CVE"):
                        continue
                    if "ACREDITACIÓN DE INGLÉS" in up:
                        continue

                    tokens = row_text.split()
                    subj = parse_subject_tokens(tokens)
                    if subj:
                        materias.append(subj)

    return materias


def extract_subjects_from_text(raw_text: str) -> List[Dict[str, Any]]:
    materias: List[Dict[str, Any]] = []

    for line in raw_text.splitlines():
        line = normalize_spaces(fix_unicode(line))
        if not line:
            continue
        up = line.upper()
        if up.startswith("CR CVE"):
            continue
        if "ACREDITACIÓN DE INGLÉS" in up:
            continue

        tokens = line.split()
        subj = parse_subject_tokens(tokens)
        if subj:
            materias.append(subj)

    return materias


def extract_subject_rows(path: Path, raw_text: str) -> List[Dict[str, Any]]:
    """
    Extrae materias combinando:
      - Filas vía tablas de pdfplumber
      - Filas vía texto línea-por-línea
    Luego deduplica por (codigo, cic).
    """
    from_tables = extract_subjects_from_tables(path)
    from_text = extract_subjects_from_text(raw_text)

    combined = from_tables + from_text

    seen = set()
    materias: List[Dict[str, Any]] = []
    for m in combined:
        key = (m["codigo"], m["cic"])
        if key in seen:
            continue
        seen.add(key)
        m["periodo"] = cic_to_period_label(m["cic"])
        materias.append(m)

    return materias


# ============================================================
# 4) RESUMEN (PROMEDIOS / CRÉDITOS / MATERIAS)
# ============================================================

def extract_summary(raw_text: str) -> dict:
    """
    Extrae de la banda inferior del kárdex:
      - PROMEDIO de un periodo (ej. 2025-1 *93.33)
      - PROMEDIO KARDEX (*89.79)
      - CRÉDITOS: APR / REP / INS
      - MATERIAS: APR / REP / NMR / INS
    """
    
    resumen = {
        "promedios": {},
        "creditos": {},
        "materias": {},
    }
    
    # --- PROMEDIOS ---
    # Buscar la línea completa que contiene promedios y datos
    # Esta línea contiene: *93.33 *89.79 284 **0 *49 *43 **0 **0 **7
    full_line_pattern = re.search(
        r'\*(\d{2,3}[.,]\d{2})\s+\*(\d{2,3}[.,]\d{2})\s+\d+',
        raw_text
    )
    
    if full_line_pattern:
        val_periodo = float(full_line_pattern.group(1).replace(',', '.'))
        val_kardex = float(full_line_pattern.group(2).replace(',', '.'))
        
        # Buscar el periodo (YYYY-D) en las líneas anteriores
        periodo_pattern = re.search(r'(\d{4}-\d)\s+KARDEX', raw_text)
        if periodo_pattern:
            periodo = periodo_pattern.group(1)
            resumen["promedios"][periodo] = val_periodo
        
        resumen["promedios"]["kardex"] = val_kardex
    
    # --- BUSCAR LA LÍNEA COMPLETA DE DATOS ---
    # Buscamos la línea que contiene los promedios y todos los números
    # Patrón: *XX.XX *XX.XX seguido de varios números con asteriscos
    data_line_pattern = re.search(
        r'\*(\d{2,3}[.,]\d{2})\s+\*(\d{2,3}[.,]\d{2})\s+(\d+)\s+\*+(\d+)\s+\*(\d+)\s+\*(\d+)\s+\*+(\d+)\s+\*+(\d+)\s+\*+(\d+)',
        raw_text
    )
    
    if data_line_pattern:
        # Los grupos son:
        # 1: promedio periodo (ya extraído)
        # 2: promedio kardex (ya extraído)
        # 3-5: CRÉDITOS (APR, REP, INS)
        # 6-9: MATERIAS (APR, REP, NMR, INS)
        
        resumen["creditos"] = {
            "APR": int(data_line_pattern.group(3)),
            "REP": int(data_line_pattern.group(4)),
            "INS": int(data_line_pattern.group(5)),
        }
        
        resumen["materias"] = {
            "APR": int(data_line_pattern.group(6)),
            "REP": int(data_line_pattern.group(7)),
            "NMR": int(data_line_pattern.group(8)),
            "INS": int(data_line_pattern.group(9)),
        }
    else:
        # --- FALLBACK: Buscar por secciones separadas ---
        
        # CRÉDITOS: buscar después de "CREDITOS" en los headers
        creditos_pattern = re.search(
            r'CREDITOS.*?APR.*?REP.*?INS.*?\n.*?(\d+)\s+\*+(\d+)\s+\*(\d+)',
            raw_text,
            re.IGNORECASE | re.DOTALL
        )
        
        if creditos_pattern:
            resumen["creditos"] = {
                "APR": int(creditos_pattern.group(1)),
                "REP": int(creditos_pattern.group(2)),
                "INS": int(creditos_pattern.group(3)),
            }
        
        # MATERIAS: buscar después de "MATERIAS" en los headers
        materias_pattern = re.search(
            r'MATERIAS.*?APR.*?REP.*?NMR.*?INS.*?\n.*?\*+(\d+)\s+\*+(\d+)\s+\*+(\d+)\s+\*+(\d+)',
            raw_text,
            re.IGNORECASE | re.DOTALL
        )
        
        if materias_pattern:
            resumen["materias"] = {
                "APR": int(materias_pattern.group(1)),
                "REP": int(materias_pattern.group(2)),
                "NMR": int(materias_pattern.group(3)),
                "INS": int(materias_pattern.group(4)),
            }

    return resumen





# ============================================================
# 5) CLI
# ============================================================

def main() -> None:
    if len(sys.argv) < 2:
        print(json.dumps({"ok": False, "error": "PDF path missing"}, ensure_ascii=False))
        sys.exit(1)

    pdf_path = Path(sys.argv[1])
    if not pdf_path.exists():
        print(json.dumps({"ok": False, "error": f"No existe el archivo: {pdf_path}"}, ensure_ascii=False))
        sys.exit(1)

    try:
        raw_text = read_text(pdf_path)
        alumno = extract_header(raw_text)
        materias = extract_subject_rows(pdf_path, raw_text)
        resumen = extract_summary(raw_text)

        out = {
            "ok": True,
            "alumno": alumno,
            "materias": materias,
            "resumen": resumen,
        }
        print(json.dumps(out, ensure_ascii=False))
    except Exception as e:
        print(json.dumps({"ok": False, "error": str(e)}, ensure_ascii=False))
        sys.exit(1)


if __name__ == "__main__":
    main()
