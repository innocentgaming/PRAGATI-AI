import pdfplumber
import re
import os
import glob
from datetime import date

UPLOAD_DIR = r'C:\Users\adiya\.gemini\antigravity-ide\brain\bee9f20a-5090-4bc5-86b1-155a9d4655db\.user_uploaded'

files = [
    (os.path.join(UPLOAD_DIR, 'media_1788929576131.pdf'), 'July 2026', date(2026, 7, 31)),
    (os.path.join(UPLOAD_DIR, 'media_1788929576999.pdf'), 'June 2026', date(2026, 6, 30)),
    (os.path.join(UPLOAD_DIR, 'media_1788929976003.pdf'), 'May 2026', date(2026, 5, 31)),
    (os.path.join(UPLOAD_DIR, 'media_1788929976363.pdf'), 'April 2026', date(2026, 4, 30)),
]

def find_table6_pages(pdf):
    start_page = None
    end_page = len(pdf.pages)
    for i, p in enumerate(pdf.pages):
        txt = p.extract_text() or ''
        if 'Table 6: All Ongoing Projects' in txt:
            start_page = i + 1  # Table starts on next page
            break
    if start_page is None:
        start_page = 54
    # End page is usually before the final note or back cover
    for i in range(start_page, len(pdf.pages)):
        txt = pdf.pages[i].extract_text() or ''
        if '****' in txt or 'Note:' in txt or 'Government of India' in txt:
            # check if no table or end of table 6
            t = pdf.pages[i].extract_tables()
            if not t or not any(r[0] and r[0].strip().isdigit() for r in t[0]):
                end_page = i
                break
    return start_page, end_page

for fpath, name, rep_date in files:
    if os.path.exists(fpath):
        with pdfplumber.open(fpath) as pdf:
            sp, ep = find_table6_pages(pdf)
            print(f"{name} ({os.path.basename(fpath)}): {len(pdf.pages)} pages, Table 6: p.{sp+1} to p.{ep}")
