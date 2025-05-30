from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
import os, uuid
import re

# מיקום התיקייה לשמירת הקבצים
UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

# ייבוא המודולים שלך
from extract.pdf_processor import process_pdf
from extract.ner_extractor import extract_entities, clean_and_structure_data

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],       # בהמשך כדאי להגביל לדומיין שלך
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
def get_data(name: str):
    path = os.path.join(UPLOAD_DIR, name)
    if not os.path.isfile(path):
        raise HTTPException(404, "Not found")

    # 1) המרת PDF לטקסט
    raw_text = process_pdf(path)

    # 2) מציאת מספר ההזמנה
    m = re.search(r'(\d+-\d+)\s*הזמנת רכש', raw_text)
    order_number = m.group(1) if m else None

    # 3) מציאת שם הספק
    m2 = re.search(r'שם ספק\s*([^\n\r]+)', raw_text)
    supplier_name = m2.group(1).strip() if m2 else None

    # 4) פירוק רשימת המוצרים
    products = []
    prod_regex = re.compile(r'ש"ח([\d\.,]+).*?ש"ח([\d\.,]+)\s*(.+?)\s*(\d{7,})')
    for line in raw_text.splitlines():
        m3 = prod_regex.search(line)
        if m3:
            products.append({
                "sku": m3.group(4),
                "description": m3.group(3).strip(),
                "unit_price": m3.group(1),
                "total_price": m3.group(2),
            })

    return {
        "order_number": order_number,
        "supplier_name": supplier_name,
        "products": products,
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app:app", host="127.0.0.1", port=8000, reload=True)