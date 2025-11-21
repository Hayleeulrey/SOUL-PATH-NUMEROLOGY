"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Plus, Sparkles, Mic, MicOff, Play, Pause, Square } from "lucide-react"
import { PromptCategory } from "@prisma/client"
import { getCategoryColor } from "@/lib/biography-prompts"

interface BiographyPrompt {
  id: string
  category: PromptCategory
  question: string
  description: string | null
  isActive: boolean
}

interface BiographyResponse {
  id: string
  promptId: string
  answer: string | null
  audioFileId: string | null
  photoId: string | null
  documentId: string | null
  relatedTo: string | null
  createdAt: Date
}

interface BiographySectionProps {
  member: any
}

export function BiographySection({ member }: BiographySectionProps) {
  const [selectedCategory, setSelectedCategory] = useState<PromptCategory | "ALL">("ALL")
  const [prompts, setPrompts] = useState<BiographyPrompt[]>([])
  const [activePrompt, setActivePrompt] = useState<BiographyPrompt | null>(null)
  const [answer, setAnswer] = useState("")
  const [loading, setLoading] = useState(false)
  
  // Audio recording state
  const [isRecording, setIsRecording] = useState(false)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [audioURL, setAudioURL] = useState<string | null>(null)
  const [isPlayingAudio, setIsPlayingAudio] = useState(false)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const audioRef = useRef<HTMLAudioElement | null>(null)

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (activePrompt) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [activePrompt])

  const categories: (PromptCategory | "ALL")[] = [
    "ALL",
    "CHILDHOOD",
    "FAMILY",
    "EDUCATION",
    "CAREER",
    "RELATIONSHIPS",
    "VALUES",
    "MILESTONES",
    "TRADITIONS",
    "WISDOM",
  ]

  const categoryLabels: Record<string, string> = {
    "ALL": "All Prompts",
    "CHILDHOOD": "Childhood",
    "FAMILY": "Family",
    "EDUCATION": "Education",
    "CAREER": "Career",
    "RELATIONSHIPS": "Relationships",
    "VALUES": "Values",
    "MILESTONES": "Milestones",
    "TRADITIONS": "Traditions",
    "WISDOM": "Wisdom"
  }

  useEffect(() => {
    fetchPrompts()
  }, [selectedCategory])

  const fetchPrompts = async () => {
    try {
      setLoading(true)
      const url = selectedCategory === "ALL"
        ? "/api/biography-prompts"
        : `/api/biography-prompts?category=${selectedCategory}`
      
      const response = await fetch(url)
      const result = await response.json()
      
      if (result.success) {
        setPrompts(result.data)
      }
    } catch (error) {
      console.error("Error fetching prompts:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleOpenPrompt = (prompt: BiographyPrompt) => {
    setActivePrompt(prompt)
    setAnswer("")
    setAudioBlob(null)
    setAudioURL(null)
  }

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
        setAudioBlob(audioBlob)
        const url = URL.createObjectURL(audioBlob)
        setAudioURL(url)
        // Stop all tracks to release the microphone
        stream.getTracks().forEach(track => track.stop())
      }

      mediaRecorder.start()
      setIsRecording(true)
    } catch (error) {
      console.error("Error accessing microphone:", error)
      alert("Microphone access denied. Please enable microphone permissions.")
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
    }
  }

  const playAudio = () => {
    if (audioRef.current && audioURL) {
      audioRef.current.play()
      setIsPlayingAudio(true)
      audioRef.current.onended = () => setIsPlayingAudio(false)
    }
  }

  const pauseAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause()
      setIsPlayingAudio(false)
    }
  }

  const deleteAudio = () => {
    setAudioBlob(null)
    setAudioURL(null)
    if (audioRef.current) {
      audioRef.current.pause()
      setIsPlayingAudio(false)
    }
  }

  const handleSaveAnswer = async () => {
    if (!activePrompt || (!answer.trim() && !audioBlob)) return

    try {
      let audioFileId = null

      // If there's an audio recording, upload it first
      if (audioBlob) {
        const audioFormData = new FormData()
        audioFormData.append('audio', audioBlob, 'recording.webm')
        audioFormData.append('familyMemberId', member.id)

        const audioResponse = await fetch('/api/audio', {
          method: 'POST',
          body: audioFormData,
        })
        const audioResult = await audioResponse.json()
        if (audioResult.success) {
          audioFileId = audioResult.data.id
        }
      }

      // Save the response
      const response = await fetch('/api/biography-responses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          familyMemberId: member.id,
          promptId: activePrompt.id,
          answer: answer.trim() || null,
          audioFileId: audioFileId,
        }),
      })

      if (response.ok) {
        // Clean up
        if (audioURL) URL.revokeObjectURL(audioURL)
        setActivePrompt(null)
        setAnswer("")
        setAudioBlob(null)
        setAudioURL(null)
      }
    } catch (error) {
      console.error("Error saving response:", error)
    }
  }

  const filteredPrompts = selectedCategory === "ALL" 
    ? prompts 
    : prompts.filter(p => p.category === selectedCategory)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Life Story Prompts</h3>
        <p className="text-sm text-gray-600">Select prompts to add biographical information</p>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2 pb-4 border-b border-gray-200">
        {categories.map((category) => (
          <Button
            key={category}
            size="sm"
            variant={selectedCategory === category ? "default" : "outline"}
            onClick={() => setSelectedCategory(category)}
            className={`${
              selectedCategory === category
                ? "bg-gray-900 text-white shadow-sm"
                : "border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400"
            }`}
          >
            {categoryLabels[category]}
          </Button>
        ))}
      </div>

      {/* Prompts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-full text-center py-12">
            <p className="text-gray-500">Loading prompts...</p>
          </div>
        ) : filteredPrompts.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <Sparkles className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-2">No prompts found</p>
            <p className="text-sm text-gray-400">Try selecting a different category</p>
          </div>
        ) : (
          filteredPrompts.map((prompt) => (
            <Card
              key={prompt.id}
              className="cursor-pointer hover:shadow-lg transition-all duration-200 border-gray-200 hover:border-gray-300 group bg-white"
              onClick={() => handleOpenPrompt(prompt)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-xs px-3 py-1.5 rounded-full font-medium ${getCategoryColor(prompt.category)}`}>
                    {categoryLabels[prompt.category]}
                  </span>
                  <Plus className="h-4 w-4 text-gray-400 group-hover:text-gray-900 transition-colors" />
                </div>
              </CardHeader>
              <CardContent>
                <CardTitle className="text-base font-medium text-gray-900 mb-2">{prompt.question}</CardTitle>
                {prompt.description && (
                  <CardDescription className="text-sm text-gray-600 leading-relaxed">
                    {prompt.description}
                  </CardDescription>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Answer Modal */}
      {activePrompt && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-50 overflow-y-auto p-4" onClick={(e) => {
          if (e.target === e.currentTarget) {
            if (audioURL) URL.revokeObjectURL(audioURL)
            setActivePrompt(null)
            setAnswer("")
            setAudioBlob(null)
            setAudioURL(null)
          }
        }}>
          <div className="flex items-start justify-center min-h-full py-8">
            <Card className="max-w-2xl w-full my-auto shadow-xl" onClick={(e) => e.stopPropagation()}>
            <CardHeader className="border-b border-gray-200 pb-4">
              <div className="flex items-center gap-2 mb-3">
                <span className={`text-xs px-3 py-1.5 rounded-full font-medium ${getCategoryColor(activePrompt.category)}`}>
                  {categoryLabels[activePrompt.category]}
                </span>
              </div>
              <CardTitle className="text-xl font-semibold text-gray-900">{activePrompt.question}</CardTitle>
              {activePrompt.description && (
                <CardDescription className="text-sm mt-2 text-gray-600">
                  {activePrompt.description}
                </CardDescription>
              )}
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              {/* Response Options */}
              <div className="space-y-4">
                {/* Text Response */}
                <div>
                  <Label htmlFor="answer" className="text-gray-900 font-medium">Write Your Response</Label>
                  <textarea
                    id="answer"
                    className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:border-gray-900 focus:ring-2 focus:ring-gray-900 focus:outline-none mt-2 text-gray-900 placeholder-gray-400"
                    rows={6}
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    placeholder="Share your story in your own words..."
                  />
                </div>

                {/* Divider */}
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-gray-200"></span>
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white px-2 text-gray-500">Or</span>
                  </div>
                </div>

                {/* Audio Recording */}
                <div>
                  <Label className="text-gray-900 font-medium block mb-3">Record Audio</Label>
                  <div className="flex items-center gap-3">
                    {!audioURL ? (
                      <>
                        <Button
                          type="button"
                          onClick={isRecording ? stopRecording : startRecording}
                          variant={isRecording ? "destructive" : "default"}
                          className={`gap-2 ${
                            isRecording 
                              ? "bg-red-600 hover:bg-red-700 text-white animate-pulse" 
                              : "bg-gray-900 hover:bg-gray-800 text-white"
                          }`}
                        >
                          {isRecording ? (
                            <>
                              <MicOff className="h-4 w-4" />
                              Stop Recording
                            </>
                          ) : (
                            <>
                              <Mic className="h-4 w-4" />
                              Start Recording
                            </>
                          )}
                        </Button>
                        {isRecording && (
                          <span className="text-sm text-gray-500">Recording in progress...</span>
                        )}
                      </>
                    ) : (
                      <>
                        <audio ref={audioRef} src={audioURL || undefined} />
                        <Button
                          type="button"
                          onClick={isPlayingAudio ? pauseAudio : playAudio}
                          variant="outline"
                          className="gap-2"
                        >
                          {isPlayingAudio ? (
                            <>
                              <Pause className="h-4 w-4" />
                              Pause
                            </>
                          ) : (
                            <>
                              <Play className="h-4 w-4" />
                              Play
                            </>
                          )}
                        </Button>
                        <Button
                          type="button"
                          onClick={deleteAudio}
                          variant="outline"
                          className="gap-2 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                        >
                          <Square className="h-4 w-4" />
                          Delete
                        </Button>
                        <span className="text-sm text-gray-600">Audio recorded successfully</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <Button
                  variant="outline"
                  onClick={() => {
                    if (audioURL) URL.revokeObjectURL(audioURL)
                    setActivePrompt(null)
                    setAnswer("")
                    setAudioBlob(null)
                    setAudioURL(null)
                  }}
                  className="border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSaveAnswer}
                  disabled={!answer.trim() && !audioBlob}
                  className="bg-gray-900 hover:bg-gray-800 text-white shadow-sm"
                >
                  Save Response
                </Button>
              </div>
            </CardContent>
          </Card>
          </div>
        </div>
      )}
    </div>
  )
}

