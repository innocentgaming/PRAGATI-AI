import pdfplumber
import re
import os
from datetime import date

UPLOAD_DIR = r'C:\Users\adiya\.gemini\antigravity-ide\brain\bee9f20a-5090-4bc5-86b1-155a9d4655db\.user_uploaded'
pdf_path = os.path.join(UPLOAD_DIR, 'media_1788929576131.pdf')

def parse_date(date_str):
    if not date_str or date_str.strip() in ['-', 'NA', '(-)']:
        return None
    m = re.search(r'(\d{1,2})/(\d{4})', date_str)
    if m:
        month, year = int(m.group(1)), int(m.group(2))
        if 1 <= month <= 12 and 1950 <= year <= 2080:
            return date(year, month, 1)
    return None

def parse_float(val_str):
    if not val_str or val_str.strip() in ['-', 'NA', '(-)']:
        return 0.0
    cleaned = re.sub(r'[^\d.]', '', val_str)
    try:
        return float(cleaned) if cleaned else 0.0
    except ValueError:
        return 0.0

def parse_cost_cell(cell_str):
    if not cell_str:
        return 0.0, 0.0
    parts = cell_str.split('\n')
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
    parts = cell_str.split('\n')
    d1 = parse_date(parts[0])
    d2 = parse_date(parts[1]) if len(parts) > 1 else None
    return d1, d2

def parse_project_cell(cell_str, default_agency="Central Implementing Agency"):
    if not cell_str:
        return {"name": "Unknown Project", "agency": default_agency, "code": ""}
    lines = [l.strip() for l in cell_str.split('\n') if l.strip()]
    
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

with pdfplumber.open(pdf_path) as pdf:
    extracted = []
    current_ministry = "Ministry of Road Transport & Highways"
    current_sector = "Roads & Highways"
    
    for p_idx in range(54, 60):  # Test first 6 pages
        p = pdf.pages[p_idx]
        tables = p.extract_tables()
        if not tables:
            continue
        table = tables[0]
        for row in table:
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
                
                extracted.append({
                    "sl": int(sl),
                    "code": parsed_proj["code"] or f"MOSPI-{sl}",
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

    print(f"Successfully extracted {len(extracted)} test projects!")
    for ep in extracted[:5]:
        print(ep)
