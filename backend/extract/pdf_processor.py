# pdf_processor.py

import os
from tika import parser
import pytesseract
from pdf2image import convert_from_path

def extract_text_tika(file_path):
    parsed = parser.from_file(file_path)
    return parsed.get('content', '') or ''

def extract_text_tesseract(file_path):
    text = ''
    images = convert_from_path(file_path)
    for img in images:
        text += pytesseract.image_to_string(img, lang='eng+heb') + '\n'
    return text

def process_pdf(file_path, threshold=100):
    """
    If Tika yields less than `threshold` characters, assume it's scanned and
    fall back to Tesseract OCR.
    """
    text = extract_text_tika(file_path)
    if len(text.strip()) < threshold:
        print("Scanned PDF detected, using Tesseract OCR...")
        text = extract_text_tesseract(file_path)
    else:
        print("Native PDF detected, using Tika extraction...")
    return text

if __name__ == '__main__':
    for fname in os.listdir('.'):
        if fname.lower().endswith('.pdf'):
            content = process_pdf(fname)
            with open(fname + '.txt', 'w', encoding='utf-8') as out:
                out.write(content)
            print(f"Processed {fname}")