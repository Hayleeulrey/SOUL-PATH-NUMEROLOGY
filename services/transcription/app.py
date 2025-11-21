"""
FastAPI service for local audio transcription using faster-whisper

To run this service:
1. Install dependencies: pip install fastapi uvicorn faster-whisper
2. Start service: uvicorn app:app --host 0.0.0.0 --port 8000

The service will download the Whisper model automatically on first use.
"""

from fastapi import FastAPI, File, UploadFile
from fastapi.responses import JSONResponse
from faster_whisper import WhisperModel
import tempfile
import os

app = FastAPI()

# Initialize Whisper model
# This will download the model on first run
# Model options: tiny, base, small, medium, large-v2, large-v3
model = WhisperModel("base", device="cpu", compute_type="int8")


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "ok", "service": "transcription"}


@app.post("/transcribe")
async def transcribe_audio(file: UploadFile = File(...)):
    """
    Transcribe an audio file
    
    Args:
        file: Audio file (mp3, wav, m4a, etc.)
    
    Returns:
        JSON with transcription text and segments
    """
    try:
        # Save uploaded file to temp location
        with tempfile.NamedTemporaryFile(delete=False, suffix=os.path.splitext(file.filename)[1]) as tmp_file:
            content = await file.read()
            tmp_file.write(content)
            tmp_path = tmp_file.name
        
        # Transcribe audio
        segments, info = model.transcribe(tmp_path, beam_size=5)
        
        # Collect text and segments
        text = ""
        segment_list = []
        
        for segment in segments:
            text += segment.text + " "
            segment_list.append({
                "start": segment.start,
                "end": segment.end,
                "text": segment.text
            })
        
        # Clean up temp file
        os.unlink(tmp_path)
        
        return JSONResponse({
            "text": text.strip(),
            "segments": segment_list,
            "language": info.language,
            "language_probability": info.language_probability
        })
    
    except Exception as e:
        # Clean up on error
        if os.path.exists(tmp_path):
            os.unlink(tmp_path)
        
        return JSONResponse(
            status_code=500,
            content={"error": str(e)}
        )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

