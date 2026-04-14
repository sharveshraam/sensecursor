from base64 import b64encode

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from app.services.image_builder import strokes_to_image
from app.services.ocr import recognize_strokes
from app.services.pdf_exporter import export_workspace_pdf


class RecognizeRequest(BaseModel):
    strokes: list


class ExportRequest(BaseModel):
    workspace_name: str
    strokes: list = []
    text_blocks: list
    background_image: str | None = None
    page_width: int = 1400
    page_height: int = 900


app = FastAPI(title="SenseCursor API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def healthcheck():
    return {"status": "ok"}


@app.post("/recognize")
def recognize(request: RecognizeRequest):
    image = strokes_to_image(request.strokes)
    return recognize_strokes(request.strokes, image=image)


@app.post("/export")
def export(request: ExportRequest):
    pdf_bytes = export_workspace_pdf(
        request.workspace_name,
        request.strokes,
        request.text_blocks,
        background_image=request.background_image,
        page_width=request.page_width,
        page_height=request.page_height,
    )
    return {
        "workspace": request.workspace_name,
        "pdf_base64": b64encode(pdf_bytes).decode("utf-8"),
    }
