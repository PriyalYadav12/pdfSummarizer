"use client"

import type React from "react"
import { useState } from "react"
import { Upload, FileText, Brain, Loader2, Terminal, Zap, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"

interface ProcessingResult {
  headings: string[]
  summary: string
  filename: string
}

const cleanText = (text: string): string => {
  return text
    .replace(/\*\*(.*?)\*\*/g, "$1") 
    .replace(/\*(.*?)\*/g, "$1") 
    .replace(/__(.*?)__/g, "$1") 
    .replace(/`(.*?)`/g, "$1") 
    .replace(/#{1,6}\s/g, "") 
    .replace(/\n{3,}/g, "\n\n") 
    .replace(/^\s+|\s+$/g, "") 
    .trim()
}

export default function PDFProcessor() {
  const [file, setFile] = useState<File | null>(null)
  const [processing, setProcessing] = useState(false)
  const [result, setResult] = useState<ProcessingResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0]
    if (selectedFile && selectedFile.type === "application/pdf") {
      if (selectedFile.size > 10 * 1024 * 1024) {
        setError("FILE TOO LARGE. MAX SIZE: 10MB")
        return
      }
      setFile(selectedFile)
      setError(null)
      setResult(null)
    } else {
      setError("INVALID FILE FORMAT. PDF REQUIRED.")
    }
  }

  const handleDrop = (event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault()
    const droppedFile = event.dataTransfer.files[0]
    if (droppedFile && droppedFile.type === "application/pdf") {
      if (droppedFile.size > 10 * 1024 * 1024) {
        setError("FILE TOO LARGE. MAX SIZE: 10MB")
        return
      }
      setFile(droppedFile)
      setError(null)
      setResult(null)
    } else {
      setError("INVALID FILE FORMAT. PDF REQUIRED.")
    }
  }

  const handleDragOver = (event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault()
  }

  const handleUpload = async () => {
    if (!file) return

    setProcessing(true)
    setError(null)

    const formData = new FormData()
    formData.append("pdf", file)

    try {
      const response = await fetch("/api/process-pdf", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "PROCESSING FAILED")
      }

      const data = await response.json()
      data.summary = cleanText(data.summary)
      data.headings = data.headings.map((heading: string) => cleanText(heading))
      setResult(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "SYSTEM ERROR OCCURRED")
    } finally {
      setProcessing(false)
    }
  }

  const resetForm = () => {
    setFile(null)
    setResult(null)
    setError(null)
    const fileInput = document.getElementById("pdf-upload") as HTMLInputElement
    if (fileInput) fileInput.value = ""
  }

  return (
    <div className="min-h-screen bg-black text-white font-mono">
      <div className="fixed inset-0 opacity-10">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `
            linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
          `,
            backgroundSize: "20px 20px",
          }}
        />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto p-4 space-y-6">
        <div className="text-center py-8 border-b border-white/20">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Terminal className="h-8 w-8 text-white" />
            <div className="h-px bg-white flex-1 max-w-20" />
            <Zap className="h-6 w-6 text-white" />
            <div className="h-px bg-white flex-1 max-w-20" />
            <Brain className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-2 tracking-wider">PDF.Summary</h1>
          <p className="text-lg text-white/70 tracking-wide">
            {">"} NEURAL DOCUMENT ANALYSIS SYSTEM {"<"}
          </p>
          <div className="mt-4 text-xs text-white/50 tracking-widest">POWERED BY AI</div>
        </div>

        <Card className="bg-black border-2 border-white/30 shadow-2xl">
          <CardHeader className="border-b border-white/20">
            <CardTitle className="flex items-center gap-3 text-white font-mono tracking-wide">
              <Upload className="h-5 w-5" />
              UPLOAD.MODULE
            </CardTitle>
            <CardDescription className="text-white/60 font-mono">
              {">"} DRAG PDF FILE OR CLICK TO SELECT | MAX 10MB
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <div className="relative">
              <label
                htmlFor="pdf-upload"
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                className="flex flex-col items-center justify-center w-full h-48 md:h-64 border-2 border-dashed border-white/40 rounded-none cursor-pointer bg-black/50 hover:bg-white/5 transition-all duration-300 group"
              >
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <div className="relative">
                    <FileText className="w-12 h-12 mb-4 text-white/70 group-hover:text-white transition-colors" />
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-white rounded-full animate-pulse" />
                  </div>
                  <p className="mb-2 text-sm text-white/70 font-mono tracking-wide">
                    <span className="font-bold">CLICK TO UPLOAD</span> OR DRAG FILE
                  </p>
                  <p className="text-xs text-white/50 font-mono tracking-wider">PDF FILES ONLY | MAX 10MB</p>
                </div>
                <input
                  id="pdf-upload"
                  type="file"
                  className="hidden"
                  accept=".pdf,application/pdf"
                  onChange={handleFileSelect}
                />
              </label>
            </div>

            {file && (
              <div className="border border-white/30 bg-white/5 p-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-white" />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-bold text-white truncate">{file.name}</div>
                      <div className="text-xs text-white/60 font-mono">
                        SIZE: {(file.size / 1024 / 1024).toFixed(2)} MB
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <Button
                      onClick={handleUpload}
                      disabled={processing}
                      className="bg-white text-black hover:bg-white/90 font-mono tracking-wide border-0"
                    >
                      {processing ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          PROCESSING...
                        </>
                      ) : (
                        <>
                          <Brain className="h-4 w-4 mr-2" />
                          ANALYZE
                        </>
                      )}
                    </Button>
                    <Button
                      onClick={resetForm}
                      variant="outline"
                      className="border-white/40 text-white hover:bg-white/10 font-mono tracking-wide bg-transparent"
                    >
                      CLEAR
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {error && (
              <Alert className="border-white\/40 bg-red-950/20 border-red-500/40">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription className="text-white font-mono tracking-wide">ERROR: {error}</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {result && (
          <div className="space-y-6">
            <Card className="bg-black border-2 border-white/30">
              <CardHeader className="border-b border-white/20">
                <CardTitle className="flex items-center gap-3 text-white font-mono tracking-wide">
                  <FileText className="h-5 w-5" />
                  DOCUMENT.STATUS
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row md:items-center gap-4">
                  <div className="flex-1">
                    <div className="text-white/60 text-xs font-mono tracking-wider mb-1">FILENAME:</div>
                    <div className="text-white font-mono text-sm md:text-base break-all">{result.filename}</div>
                  </div>
                  <Badge className="bg-white text-black font-mono tracking-wider w-fit">PROCESSED</Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-black border-2 border-white/30">
              <CardHeader className="border-b border-white/20">
                <CardTitle className="text-white font-mono tracking-wide">EXTRACTED.HEADINGS</CardTitle>
                <CardDescription className="text-white/60 font-mono">
                  {">"} {result.headings.length} STRUCTURAL ELEMENTS DETECTED
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                {result.headings.length > 0 ? (
                  <div className="space-y-3">
                    {result.headings.map((heading, index) => (
                      <div key={index} className="border border-white/20 bg-white/5 p-4">
                        <div className="flex flex-col md:flex-row md:items-start gap-3">
                          <Badge className="bg-white text-black font-mono text-xs w-fit">
                            {String(index + 1).padStart(2, "0")}
                          </Badge>
                          <div className="flex-1 text-white font-mono text-sm md:text-base leading-relaxed break-words">
                            {heading}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="text-white/40 font-mono text-sm">NO STRUCTURAL ELEMENTS DETECTED</div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="bg-black border-2 border-white/30">
              <CardHeader className="border-b border-white/20">
                <CardTitle className="flex items-center gap-3 text-white font-mono tracking-wide">
                  <Brain className="h-5 w-5" />
                  AI.ANALYSIS
                </CardTitle>
                <CardDescription className="text-white/60 font-mono">
                  {">"} NEURAL NETWORK SUMMARY OUTPUT
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="border border-white/20 bg-white/5 p-6">
                  <div className="text-white/60 text-xs font-mono tracking-wider mb-4 border-b border-white/10 pb-2">
                    AI {">"} SUMMARY.GENERATED
                  </div>
                  <div className="text-white font-mono text-sm md:text-base leading-relaxed whitespace-pre-wrap break-words">
                    {result.summary}
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="border-t border-white/20 pt-6">
              <div className="flex justify-center">
                <Button
                  onClick={resetForm}
                  className="bg-white text-black hover:bg-white/90 font-mono tracking-wider px-8 py-3"
                >
                  <Terminal className="h-4 w-4 mr-2" />
                  PROCESS.NEW.DOCUMENT
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
