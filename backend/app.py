from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os, uuid
from extract.pdf_processor import process_pdf
from extract.openai_pdf_extractor import extract_with_gpt4v_images

UPLOAD_DIR = "uploads"
STATIC_DIR = "static"
os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(STATIC_DIR, exist_ok=True)

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# הגשת ה-frontend כ-static
app.mount("/static", StaticFiles(directory=STATIC_DIR, html=True), name="static")

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
        raise HTTPException(404, "Not found")
    raw_text = process_pdf(path)
    result = extract_with_gpt4v_images(path, raw_text=raw_text)
    return result

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=True)