import re
from datetime import date

def parse_date(date_str):
    if not date_str or date_str == '-' or date_str == 'NA':
        return None
    # match MM/YYYY
    m = re.search(r'(\d{1,2})/(\d{4})', date_str)
    if m:
        month, year = int(m.group(1)), int(m.group(2))
        if 1 <= month <= 12 and 1950 <= year <= 2080:
            return date(year, month, 1)
    return None

def parse_float(val_str):
    if not val_str or val_str == '-' or val_str == 'NA':
        return 0.0
    # remove commas, spaces, parentheses
    cleaned = re.sub(r'[^\d.]', '', val_str)
    try:
        return float(cleaned) if cleaned else 0.0
    except ValueError:
        return 0.0

def parse_cost_cell(cell_str):
    if not cell_str:
        return 0.0, 0.0
    parts = cell_str.split('\n')
    orig_cost = parse_float(parts[0])
    rev_cost = orig_cost
    if len(parts) > 1:
        rev_val = parse_float(parts[1])
        if rev_val > 0:
            rev_cost = rev_val
    return orig_cost, rev_cost

def parse_date_cell(cell_str):
    if not cell_str:
        return None, None
    parts = cell_str.split('\n')
    d1 = parse_date(parts[0])
    d2 = parse_date(parts[1]) if len(parts) > 1 else None
    return d1, d2

print("Test parse_date '03/2023':", parse_date('03/2023'))
print("Test parse_date '(01/2024)':", parse_date('(01/2024)'))
print("Test parse_cost '265.91\\n(824.28)':", parse_cost_cell('265.91\n(824.28)'))
print("Test parse_date_cell '01/2026\\n(09/2026)':", parse_date_cell('01/2026\n(09/2026)'))
