# pdf_processor.py


import os
import pdfplumber
import pytesseract
from pdf2image import convert_from_path

# RTL Hebrew line fixer
import re

def is_probably_hebrew(text):
    return bool(re.search(r'[\u0590-\u05FF]', text))

def fix_rtl_lines(text):
    fixed_lines = []
    for line in text.splitlines():
        line = line.strip()
        if is_probably_hebrew(line):
            # Only reverse Hebrew letter sequences, not numbers or punctuation
            def reverse_hebrew(match):
                return match.group(0)[::-1]
            # Hebrew unicode range
            hebrew_re = re.compile(r'[\u0590-\u05FF]+')
            # Replace each Hebrew word with its reversed version
            fixed_line = hebrew_re.sub(reverse_hebrew, line)
            fixed_lines.append(fixed_line)
        else:
            fixed_lines.append(line)
    return "\n".join(fixed_lines)


# New pdfplumber-based extraction function
def extract_text_plumber(file_path):
    print(f"[PLUMBER] Extracting text from: {file_path}")
    text = ''
    with pdfplumber.open(file_path) as pdf:
        for i, page in enumerate(pdf.pages):
            page_text = page.extract_text()
            print(f"[PLUMBER] Page {i+1} extracted {len(page_text or '')} characters")
            if page_text:
                text += page_text + '\n'
    print(f"[PLUMBER] Total extracted {len(text)} characters")
    return text

def extract_text_tesseract(file_path):
    print(f"[TESSERACT] Converting PDF to images: {file_path}")
    text = ''
    images = convert_from_path(file_path)
    print(f"[TESSERACT] Got {len(images)} images from PDF")
    for i, img in enumerate(images):
        print(f"[TESSERACT] OCR on page {i+1}")
        ocr_text = pytesseract.image_to_string(img, lang='eng+heb')
        print(f"[TESSERACT] Page {i+1} extracted {len(ocr_text)} characters")
        text += ocr_text + '\n'
    print(f"[TESSERACT] Total extracted {len(text)} characters")
    return text

def process_pdf(file_path, threshold=100):
    print(f"[PROCESS_PDF] Processing: {file_path}")
    text = extract_text_plumber(file_path)
    text = fix_rtl_lines(text)
    if len(text.strip()) < threshold:
        print(f"[PROCESS_PDF] Scanned PDF detected (only {len(text.strip())} chars), using Tesseract OCR...")
        text = extract_text_tesseract(file_path)
        text = fix_rtl_lines(text)
    else:
        print(f"[PROCESS_PDF] Native PDF detected, using pdfplumber extraction...")
    print(f"[PROCESS_PDF] Final text length: {len(text)}")
    return text

if __name__ == '__main__':
    for fname in os.listdir('.'):
        if fname.lower().endswith('.pdf'):
            content = process_pdf(fname)
            with open(fname + '.txt', 'w', encoding='utf-8') as out:
                out.write(content)
            print(f"Processed {fname}")