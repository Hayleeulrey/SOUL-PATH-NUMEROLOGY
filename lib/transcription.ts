/**
 * Local transcription client
 * Connects to a faster-whisper service running locally
 */

export interface TranscriptionResult {
  text: string
  segments?: Array<{
    start: number
    end: number
    text: string
  }>
}

/**
 * Transcribe an audio file using local Whisper service
 */
export async function transcribeLocal(audioPath: string): Promise<string> {
  const whisperUrl = process.env.LOCAL_WHISPER_URL || 'http://localhost:8000'
  
  try {
    const formData = new FormData()
    
    // Read the file and append to form data
    const fs = await import('fs')
    const fileBuffer = fs.readFileSync(audioPath)
    const blob = new Blob([fileBuffer])
    formData.append('file', blob, audioPath.split('/').pop())

    const response = await fetch(`${whisperUrl}/transcribe`, {
      method: 'POST',
      body: formData
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Transcription service error: ${errorText}`)
    }

    const result: TranscriptionResult = await response.json()
    return result.text
  } catch (error) {
    console.error('Local transcription error:', error)
    throw new Error(`Failed to transcribe audio locally: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * Check if local transcription service is available
 */
export async function checkTranscriptionService(): Promise<boolean> {
  try {
    const whisperUrl = process.env.LOCAL_WHISPER_URL || 'http://localhost:8000'
    const response = await fetch(`${whisperUrl}/health`, {
      method: 'GET'
    })
    return response.ok
  } catch {
    return false
  }
}

