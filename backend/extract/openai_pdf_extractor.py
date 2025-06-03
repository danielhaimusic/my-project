import openai
from pdf2image import convert_from_path
import io
import base64
from scripts.ai import initial_prompt

def extract_with_gpt4v_images(pdf_path: str, raw_text: str = None, model_name: str = "gpt-4o") -> dict:
    """
    Converts PDF pages to images, sends them to OpenAI Vision API, and returns structured data as a dict.
    Only the first 1-3 pages are sent (API limit).
    Optionally, also sends the extracted text for better results.
    """
    # Convert PDF to images (first 3 pages)
    images = convert_from_path(pdf_path, first_page=1, last_page=3)
    image_b64_list = []
    for img in images:
        buf = io.BytesIO()
        img.save(buf, format="PNG")
        b64 = base64.b64encode(buf.getvalue()).decode("utf-8")
        image_b64_list.append(b64)

    client = openai.OpenAI()
    # Prepare content for vision API
    content = [
        {"type": "text", "text": initial_prompt}
    ]
    if raw_text:
        content.append({"type": "text", "text": f"הטקסט שחולץ מה-PDF:\n{raw_text}"})
    for b64 in image_b64_list:
        content.append({
            "type": "image_url",
            "image_url": {"url": f"data:image/png;base64,{b64}"}
        })

    response = client.chat.completions.create(
        model=model_name,
        messages=[
            {"role": "user", "content": content}
        ]
    )
    result = response.choices[0].message.content
    import json
    try:
        start = result.find('{')
        end = result.rfind('}') + 1
        json_str = result[start:end]
        return json.loads(json_str)
    except Exception as e:
        raise RuntimeError(f"Failed to parse GPT-4V response as JSON: {e}\nResponse: {result}")
