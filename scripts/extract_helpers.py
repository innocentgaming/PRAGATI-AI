"""
PRAGATI-AI: Official MoSPI Flash Report Data Ingestion Engine
Ingests real project records from official MoSPI Flash Reports:
  - 489th Flash Report (July 2026) - Primary ongoing project baseline
  - 488th Flash Report (June 2026) - Month-1 tracking snapshot
  - 487th Flash Report (May 2026)  - Month-2 tracking snapshot
  - 486th Flash Report (April 2026)- Month-3 tracking snapshot
"""

import os
import sys
import re
import random
from datetime import date, datetime, timedelta
import pdfplumber

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

# Ensure root & apps/api are in sys.path
BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
sys.path.insert(0, os.path.join(BASE_DIR, "apps", "api"))
sys.path.insert(0, BASE_DIR)

from app.core.database import SessionLocal, Base, engine
from app.models.entities import (
    User, Ministry, Department, Sector, State, Contractor, Project,
    ProjectMonthlyData, Milestone, RiskPrediction, RiskFactor,
    Alert, Document, DocumentChunk, Intervention, ModelVersion,
    AuditLog, Notification, ReportRecord
)
from app.core.security import get_password_hash
from ml.features.feature_builder import FeatureBuilder
from ml.models.cost.cost_model import CostOverrunPredictor
from ml.models.delay.delay_model import TimeOverrunPredictor
from ml.models.risk.risk_scorer import RiskScorer
from ml.explainability.explainer import SHAPExplainer
from rag.embeddings.embedder import VectorEmbedder

UPLOAD_DIR = r'C:\Users\adiya\.gemini\antigravity-ide\brain\596fc4ba-de80-4938-922c-add1b01ccc14\.user_uploaded'
PDF_MAY = os.path.join(UPLOAD_DIR, 'media_1788944976284.pdf')
PDF_APRIL = os.path.join(UPLOAD_DIR, 'media_1788944976618.pdf')

def parse_date(date_str):
    if not date_str or str(date_str).strip() in ['-', 'NA', '(-)', '']:
        return None
    m = re.search(r'(\d{1,2})/(\d{4})', str(date_str))
    if m:
        month, year = int(m.group(1)), int(m.group(2))
        if 1 <= month <= 12 and 1950 <= year <= 2080:
            return date(year, month, 1)
    return None

def parse_float(val_str):
    if not val_str or str(val_str).strip() in ['-', 'NA', '(-)', '']:
        return 0.0
    cleaned = re.sub(r'[^\d.]', '', str(val_str))
    try:
        return float(cleaned) if cleaned else 0.0
    except ValueError:
        return 0.0

def parse_cost_cell(cell_str):
    if not cell_str:
        return 0.0, 0.0
    parts = str(cell_str).split('\n')
    orig = parse_float(parts[0])
    rev = orig
    if len(parts) > 1:
        v = parse_float(parts[1])
        if v > 0:
            rev = v
    return orig, rev

def parse_date_cell(cell_str):
    if not cell_str:
        return None, None
    parts = str(cell_str).split('\n')
    d1 = parse_date(parts[0])
    d2 = parse_date(parts[1]) if len(parts) > 1 else None
    return d1, d2

def parse_project_cell(cell_str, default_agency="Central Sector Agency"):
    if not cell_str:
        return {"name": "Central Sector Project", "agency": default_agency, "code": ""}
    lines = [l.strip() for l in str(cell_str).split('\n') if l.strip()]
    
    proj_code = ""
    code_line_idx = -1
    for idx, line in enumerate(lines):
        m = re.search(r'\((\d{5,8})\)', line) or re.search(r'\b(\d{5,8})\b', line)
        if m and not any(kw in line.lower() for kw in ['km', 'mw', 'mld', 'mmtpa', 'tph']):
            proj_code = m.group(1)
            code_line_idx = idx
            break
            
    agency = ""
    if code_line_idx > 0:
        prev_line = lines[code_line_idx - 1]
        if prev_line.startswith('(') and prev_line.endswith(')'):
            agency = prev_line.strip('() ')
            name_lines = lines[:code_line_idx - 1]
        else:
            name_lines = lines[:code_line_idx]
    elif code_line_idx == 0:
        name_lines = [lines[0]]
    else:
        name_lines = lines

    name = " ".join(name_lines).strip()
    if not name and lines:
        name = lines[0]
    if not agency:
        for l in lines:
            if l.startswith('(') and l.endswith(')') and not re.search(r'^\(\d+\)$', l) and l not in ['(-)', '(-) (-)']:
                agency = l.strip('() ')
                break
    if not agency:
        agency = default_agency
        
    return {"name": name, "agency": agency, "code": proj_code}

def extract_table6_from_pdf(pdf_file_path, month_name):
    print(f"📖 Extracting Table 6 from {month_name} ({os.path.basename(pdf_file_path)})...")
    if not os.path.exists(pdf_file_path):
        print(f"⚠️ File not found: {pdf_file_path}")
        return []

    projects = []
    current_ministry = "Ministry of Road Transport & Highways"
    current_sector = "Roads & Highways"

    with pdfplumber.open(pdf_file_path) as pdf:
        for p_idx, page in enumerate(pdf.pages):
            txt = page.extract_text() or ''
            if "All Ongoing Projects" not in txt and "All Ongoing Projects" not in (page.extract_text() or ''):
                continue
            
            tables = page.extract_tables()
            if not tables:
                continue

            for row in tables[0]:
                if not row or len(row) < 8:
                    continue
                sl = (row[0] or '').strip()
                cell1 = (row[1] or '').strip()

                if not sl and cell1:
                    if any(kw in cell1.lower() for kw in ['ministry', 'department']):
                        current_ministry = cell1
                    else:
                        current_sector = cell1
                    continue

                if sl.isdigit():
                    parsed_proj = parse_project_cell(cell1, default_agency=current_ministry)
                    appr_date, start_date = parse_date_cell(row[3])
                    orig_doc, rev_doc = parse_date_cell(row[4])
                    orig_cost, rev_cost = parse_cost_cell(row[5])
                    exp = parse_float(row[6])
                    phys_prog = parse_float(row[7])

                    p_code = parsed_proj["code"] or f"MOSPI-{int(sl):04d}"

                    projects.append({
                        "sl": int(sl),
                        "code": p_code,
                        "name": parsed_proj["name"],
                        "agency": parsed_proj["agency"],
                        "state": (row[2] or '').replace('\n', ' ').strip(),
                        "ministry": current_ministry,
                        "sector": current_sector,
                        "appr_date": appr_date,
                        "start_date": start_date or appr_date or date(2022, 1, 1),
                        "orig_doc": orig_doc or date(2026, 12, 31),
                        "rev_doc": rev_doc,
                        "orig_cost": orig_cost,
                        "rev_cost": rev_cost,
                        "exp": exp,
                        "phys_prog": phys_prog
                    })

    print(f"✅ Parsed {len(projects)} projects from {month_name}")
    return projects

def extract_table3_completed(pdf_file_path):
    print("📖 Extracting Table 3 (Completed Projects)...")
    if not os.path.exists(pdf_file_path):
        return []
    completed = []
    with pdfplumber.open(pdf_file_path) as pdf:
        for p in pdf.pages:
            txt = p.extract_text() or ''
            if "Completed Projects During Month" in txt:
                tables = p.extract_tables()
                if tables:
                    for row in tables[0]:
                        if row and row[0] and row[0].strip().isdigit():
                            sl = int(row[0].strip())
                            cell1 = (row[1] or '').strip()
                            parsed = parse_project_cell(cell1)
                            appr_date, start_date = parse_date_cell(row[3]) if len(row) > 3 else (None, None)
                            act_date, target_date = parse_date_cell(row[4]) if len(row) > 4 else (None, None)
                            orig_cost, rev_cost = parse_cost_cell(row[5]) if len(row) > 5 else (0.0, 0.0)
                            exp = parse_float(row[6]) if len(row) > 6 else 0.0
                            completed.append({
                                "sl": sl,
                                "code": parsed["code"] or f"COMP-{sl:03d}",
                                "name": parsed["name"],
                                "agency": parsed["agency"],
                                "state": (row[2] or '').replace('\n', ' ').strip() if len(row) > 2 else "PAN India",
                                "start_date": start_date or appr_date or date(2020, 1, 1),
                                "actual_completion_date": act_date or date(2026, 7, 1),
                                "orig_cost": orig_cost,
                                "rev_cost": rev_cost,
                                "exp": exp,
                                "phys_prog": 100.0,
                                "status": "COMPLETED"
                            })
    print(f"✅ Parsed {len(completed)} completed projects.")
    return completed

print("Extractors loaded successfully.")
