import pdfplumber
import re
import json

pdf_path = r'C:\Users\adiya\.gemini\antigravity-ide\brain\bee9f20a-5090-4bc5-86b1-155a9d4655db\.user_uploaded\media_1788929576131.pdf'

def parse_project_cell(cell_text):
    if not cell_text:
        return {}
    lines = [l.strip() for l in cell_text.split('\n') if l.strip()]
    
    # Extract agency: usually in parentheses like (Airport Authority of India [AAI]) or (NHAI)
    # Extract project code: (612786) or 612786
    # Let's inspect the pattern
    return lines

with pdfplumber.open(pdf_path) as pdf:
    # Page 55 (index 54)
    p = pdf.pages[54]
    tables = p.extract_tables()
    table = tables[0]
    
    current_ministry = None
    current_sector = None
    
    for r_idx, row in enumerate(table[:12]):
        sl = (row[0] or '').strip()
        cell1 = (row[1] or '').strip()
        
        # Check if header row
        if not sl and cell1:
            if any(term in cell1.lower() for term in ['ministry', 'department']):
                current_ministry = cell1
                print(f"[MINISTRY] {current_ministry}")
            else:
                current_sector = cell1
                print(f"  [SECTOR] {current_sector}")
            continue
            
        if sl.isdigit():
            print(f"Project #{sl}:")
            print(f"  Cell 1 (details): {repr(row[1])}")
            print(f"  State: {repr(row[2])}")
            print(f"  Dates Appr/Start: {repr(row[3])}")
            print(f"  DoC Orig/Rev: {repr(row[4])}")
            print(f"  Cost Orig/Rev: {repr(row[5])}")
            print(f"  Expenditure: {repr(row[6])}")
            print(f"  Progress: {repr(row[7])}")
