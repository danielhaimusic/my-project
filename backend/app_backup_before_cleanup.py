# גיבוי של app.py לפני ניקוי
# קובץ זה לא בשימוש, רק לשחזור במידת הצורך

from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
import os, uuid, base64
import re

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

EXTRACTION_ENGINE = 'chatgpt'
EXTRACTION_INPUT_MODE = os.environ.get('EXTRACTION_INPUT_MODE', 'vision_pdf')

from extract.pdf_processor import process_pdf
from extract.ner_extractor import extract_entities, clean_and_structure_data
from extract.ollama_extractor import extract_with_ollama, extract_with_chatgpt
from extract.openai_pdf_extractor import extract_with_gpt4v_images

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/upload")
async def upload_pdf(file: UploadFile = File(...)):
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(400, "Only PDF allowed")
    uid = f"{uuid.uuid4()}.pdf"
    path = os.path.join(UPLOAD_DIR, uid)
    with open(path, "wb") as f:
        f.write(await file.read())
    return {"filename": uid}

@app.get("/files")
def list_files():
    files = sorted(os.listdir(UPLOAD_DIR))
    return {"files": files}

@app.get("/pdf/{name}")
def get_pdf(name: str):
    path = os.path.join(UPLOAD_DIR, name)
    if not os.path.isfile(path):
        raise HTTPException(404, "Not found")
    return FileResponse(path, media_type="application/pdf")

@app.get("/data/{name}")
async def get_data(name: str):
    path = os.path.join(UPLOAD_DIR, name)
    if not os.path.isfile(path):
        print(f"[DATA] File not found: {path}")
        raise HTTPException(404, "Not found")

    print(f"[DATA] Starting PDF extraction for: {path}")
    raw_text = process_pdf(path)
    print(f"[DATA] Extracted text length: {len(raw_text)}")

    with open(path, "rb") as pdf_file:
        pdf_data = pdf_file.read()
    pdf_b64 = base64.b64encode(pdf_data).decode('utf-8')
    
    if EXTRACTION_INPUT_MODE == 'pdf':
        full_input = pdf_b64
    else:
        full_input = raw_text

    max_chars = 15000
    if len(full_input) > max_chars:
        full_input = full_input[:max_chars]
        print(f"[DEBUG] full_input truncated to {max_chars} characters")

    print(f"[DEBUG] Checking OPENAI_API_KEY...")
    api_key = os.environ.get("OPENAI_API_KEY")
    if not api_key:
        print("[DEBUG] ERROR: OPENAI_API_KEY is not set!")
    else:
        print(f"[DEBUG] OPENAI_API_KEY is set: {api_key[:5]}... (length: {len(api_key)})")
    
    if EXTRACTION_ENGINE == "chatgpt":
        try:
            print("[DATA] Using ChatGPT extraction")
            if EXTRACTION_INPUT_MODE == "vision_pdf":
                result = extract_with_gpt4v_images(path, raw_text=raw_text)
            else:
                result = extract_with_chatgpt(full_input)
            print(f"[DATA] ChatGPT extraction result: {result}")
            return result
        except Exception as e:
            import traceback
            print(f"[DATA] ChatGPT extraction exception: {e}")
            traceback.print_exc()
            raise HTTPException(500, f"AI extraction failed: {e}")
    elif EXTRACTION_ENGINE == "ollama":
        try:
            print("[DATA] Using Ollama extraction")
            result = extract_with_ollama(full_input)
            print(f"[DATA] Ollama extraction result: {result}")
            return result
        except Exception as e:
            import traceback
            print(f"[DATA] Ollama extraction exception: {e}")
            traceback.print_exc()
            raise HTTPException(500, f"AI extraction failed: {e}")

    # מציאת מספר ההזמנה
    order_number = None
    order_patterns = [
        r'הזמנת רכש\s*מספר[:\s]*([\d\-]+)',
        r'מספר הזמנה[:\s]*([\d\-]+)',
        r'Order\s*Number[:\s]*([\d\-]+)',
        r'PO\s*[:#]?\s*([\d\-]+)'
    ]
    for pattern in order_patterns:
        match = re.search(pattern, raw_text, re.IGNORECASE)
        if match:
            order_number = match.group(1).strip()
            break
    print(f"[DATA] Order number: {order_number}")

    customer_name = ""
    for pattern in [r"שם לקוח[:\s]*([\u0590-\u05FF\w\s]+)", r"לקוח[:\s]*([\u0590-\u05FF\w\s]+)", r"Customer[:\s]*([\w\s]+)"]:
        match = re.search(pattern, raw_text)
        if match:
            customer_name = match.group(1).strip()
            break
    print(f"[DATA] Customer name: {customer_name}")

    products = []
    prod_regex = re.compile(r'ש"ח([\d\.,]+).*?ש"ח([\d\.,]+)\s*(.+?)\s*(\d{7,})')
    for line in raw_text.splitlines():
        m3 = prod_regex.search(line)
        if m3:
            product = {
                "product_id": m3.group(4),
                "description": m3.group(3).strip(),
                "quantity": "",
                "unit_price": m3.group(1),
                "total_price": m3.group(2),
            }
            print(f"[DATA] Product found: {product}")
            products.append(product)
    print(f"[DATA] Total products found: {len(products)}")

    return {
        "order_number": order_number,
        "customer_name": customer_name,
        "products": products,
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app:app", host="127.0.0.1", port=8000, reload=True)
