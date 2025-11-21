# Privacy-First Setup for Soul Path Lineage

## Overview

Soul Path Lineage uses **local-first AI processing** by default to ensure your family data never leaves your device. This guide explains how to set up and use the privacy features.

## Privacy Modes

The application supports three privacy modes:

### 1. Local-Only (Default - Recommended)
- **Best for:** Maximum privacy and confidentiality
- **How it works:** All AI processing happens on your local machine using Ollama
- **Data flow:** Family data never leaves your computer
- **Setup required:** Ollama must be installed and running locally

### 2. Cloud-Allowed
- **Best for:** When you need OpenAI's advanced capabilities
- **How it works:** Family data is sent to OpenAI for processing
- **Data flow:** Data is transmitted to OpenAI servers
- **Setup required:** OpenAI API key in `.env.local`

### 3. Cloud-With-Redaction
- **Best for:** Balance between functionality and privacy
- **How it works:** Sensitive information (names, dates, addresses) is removed before sending to OpenAI
- **Data flow:** Redacted data sent to OpenAI; original never leaves your machine
- **Setup required:** OpenAI API key

## Quick Start (Local-Only Mode)

### Step 1: Install Ollama

**macOS:**
```bash
brew install ollama
```

**Linux:**
```bash
curl -fsSL https://ollama.ai/install.sh | sh
```

**Windows:**
Download from [ollama.ai](https://ollama.ai/download)

### Step 2: Start Ollama Service

```bash
ollama serve
```

This starts the local AI service on `http://localhost:11434`

### Step 3: Pull Required Models

```bash
# Main language model for Sage AI
ollama pull llama3.1:8b

# Embeddings model for vector search (optional for now)
ollama pull nomic-embed-text
```

### Step 4: Verify Installation

```bash
# Test the chat model
ollama run llama3.1:8b "Hello, how are you?"

# Test embeddings
curl http://localhost:11434/api/embeddings -d '{"model":"nomic-embed-text","prompt":"test"}'
```

## Local Transcription Setup (Optional)

If you want to transcribe audio recordings locally:

### Install faster-whisper

```bash
pip install fastapi uvicorn faster-whisper
```

### Start the transcription service

```bash
cd services/transcription
uvicorn app:app --host 0.0.0.0 --port 8000
```

The service will automatically download the Whisper model on first use.

## Environment Configuration

The application reads configuration from `.env.local`:

```bash
# AI Processing Mode
AI_MODE=local                    # local | cloud | hybrid
ALLOW_CLOUD_FALLBACK=false
PRIVACY_DEFAULT=local-only       # local-only | cloud-allowed | cloud-with-redaction

# Ollama Configuration
LOCAL_OLLAMA_URL=http://localhost:11434

# Local Transcription
LOCAL_WHISPER_URL=http://localhost:8000

# OpenAI (only if using cloud mode)
OPENAI_API_KEY=your-key-here
```

## Privacy Settings UI

Access privacy settings from:
- **Global settings:** `/lineage/settings`
- **Per-family-member settings:** Edit member → Privacy tab

### User-Level Settings
- Set your default privacy mode
- Apply to all family members unless overridden

### Member-Level Settings
- Override default for specific family members
- Useful when some members consent to cloud processing

## Audit Logs

Every AI interaction is logged for transparency:

- **View logs:** Settings → Audit Logs
- **What's tracked:** 
  - Who (user)
  - What (action type)
  - When (timestamp)
  - Egress (whether data left the machine)
  - Provider used (Ollama vs OpenAI)

## Testing Privacy Enforcement

### Test Local-Only Mode

1. Set `AI_MODE=local` in `.env.local`
2. Try to chat with Sage AI
3. Verify requests use Ollama, not OpenAI
4. Check audit log shows `egress: false`

### Test Privacy Violation

1. Set `AI_MODE=local` and `PRIVACY_DEFAULT=local-only`
2. Set `AI_MODE=cloud` (or remove LOCAL_OLLAMA_URL)
3. Attempt to use Sage AI
4. Should receive privacy violation error

## Troubleshooting

### "Connection refused" to Ollama
- Ensure `ollama serve` is running
- Check `LOCAL_OLLAMA_URL` is correct

### "Model not found" errors
- Run `ollama pull llama3.1:8b`
- Run `ollama list` to verify models are installed

### Poor AI responses in local mode
- Try larger models: `ollama pull llama3.1:70b` (requires more RAM)
- Adjust temperature in `lib/ai.ts` if needed

### Transcription not working
- Verify transcription service is running on port 8000
- Check logs in `services/transcription/`

## Privacy Guarantees

### What We Promise

✅ **Local-Only Mode:**
- All data stays on your machine
- No external network calls for AI processing
- SQLite database never leaves your computer
- Photos, documents, audio stored locally

✅ **Cloud-With-Redaction:**
- Names, dates, addresses stripped before transmission
- Original data never leaves your machine
- Only redacted text sent to OpenAI

❌ **What We Don't Do:**
- No telemetry or usage analytics in local mode
- No data collection or selling
- No hidden cloud backups unless you enable them

## Next Steps

1. **Start the app:** `npm run dev`
2. **Configure privacy:** Go to Settings → Privacy Mode
3. **Test Sage AI:** Try chatting with your family's AI biographer
4. **Monitor logs:** Check audit logs in Settings

## Support

For issues or questions:
- Check the audit logs for error details
- Review `.env.local` configuration
- Ensure Ollama service is running and models are installed
- See `lib/privacy.ts` for implementation details

## Advanced: Hybrid Mode

Set `AI_MODE=hybrid` to:
- Try Ollama first (local)
- Fallback to OpenAI if Ollama unavailable
- Still respect `local-only` privacy restrictions

Requires:
- Both Ollama running
- OpenAI API key configured
- `ALLOW_CLOUD_FALLBACK=true`

