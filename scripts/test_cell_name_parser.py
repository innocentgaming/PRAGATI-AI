import re

def parse_project_cell(cell_str):
    if not cell_str:
        return {"name": "Unknown Project", "agency": "Central Sector Agency", "code": ""}
    
    lines = [l.strip() for l in cell_str.split('\n') if l.strip()]
    
    # Let's find line with project code
    # Usually (612786) or 701406
    proj_code = ""
    code_line_idx = -1
    for idx, line in enumerate(lines):
        m = re.search(r'\((\d{5,8})\)', line) or re.search(r'\b(\d{5,8})\b', line)
        if m and not ('km' in line.lower() or 'mw' in line.lower() or 'mld' in line.lower()):
            proj_code = m.group(1)
            code_line_idx = idx
            break
            
    # Agency is typically the line right before project code, or inside parentheses
    agency = ""
    name_lines = []
    
    if code_line_idx > 0:
        # Check line right before code line
        prev_line = lines[code_line_idx - 1]
        if (prev_line.startswith('(') and prev_line.endswith(')')) or any(kw in prev_line.upper() for kw in ['AUTHORITY', 'LIMITED', 'CORP', 'RAILWAY', 'MINISTRY', 'DEPARTMENT', 'NHAI', 'NHIDCL', 'SAIL', 'ONGC', 'IOCL', 'NTPC', 'POWERGRID', 'BCCL', 'ECL', 'CCL', 'SECL', 'WCL', 'MCL', 'NCL', 'SCCL', 'RVNL', 'IRCON', 'MRVC', 'K-RIDE', 'DFCCIL', 'AAI', 'CPWD']):
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
        # Look for any parenthesized entity in the lines
        for l in lines:
            if l.startswith('(') and l.endswith(')') and not re.search(r'^\(\d+\)$', l) and not l in ['(-)', '(-) (-)']:
                agency = l.strip('() ')
                break
    if not agency:
        agency = "Central Implementing Agency"
        
    return {
        "name": name,
        "agency": agency,
        "code": proj_code
    }

# Test on various cell strings
test_cases = [
    "Construction of New Domestic Terminal Building Building and miscellaneous works\nincluding maintenance, operations and AICMC at Kadapa Airport\n(Airport Authority of India [AAI])\n(612786)\n(-) (-)",
    "Nadikude-Srikalahasti 308.7 km\n(CAO/C/SCoR SCoR mor)\n(400298)\n(-) (-)",
    "TIKAK EXTENSION OCP\n(INVALID CO.)\n(615820)\n(-) (-)",
    "Guwahati Airport New Integrated Terminal Building Construction Project\n(Adani Airport Holdings Limited)\n(706724)\n(-) (-)",
    "Construction of 4-Lane Bridge including approaches over River Brahmaputra between Dhubri on North Bank,Assam and Phulbari on south Bank,Meghalaya on NH-127B under JICA ODA Loan assistance Phase-III\n(NHIDCL)\n(618373)\n(-) (-)"
]

for tc in test_cases:
    print(parse_project_cell(tc))
