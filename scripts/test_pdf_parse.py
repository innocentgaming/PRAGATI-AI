import pypdf
import re

pdf_path = r'C:\Users\adiya\.gemini\antigravity-ide\brain\bee9f20a-5090-4bc5-86b1-155a9d4655db\.user_uploaded\media_1788929576131.pdf'
reader = pypdf.PdfReader(pdf_path)

print(f"Total pages: {len(reader.pages)}")

# Let's inspect page 54 (0-indexed) which is Page 55 in PDF
for page_num in range(54, 57):
    text = reader.pages[page_num].extract_text()
    print(f"--- PAGE {page_num+1} ---")
    lines = [line.strip() for line in text.split('\n') if line.strip()]
    print("\n".join(lines[:35]))
