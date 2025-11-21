"use client"

import { useState, useRef, useCallback } from "react"
import ReactCrop, { Crop, PixelCrop, makeAspectCrop } from "react-image-crop"
import "react-image-crop/dist/ReactCrop.css"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

interface ImageCropperDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  imageFile: File | null
  aspectRatio?: number
  onCropComplete: (croppedFile: File) => void
}

export function ImageCropperDialog({ 
  open, 
  onOpenChange, 
  imageFile, 
  aspectRatio = 1,
  onCropComplete 
}: ImageCropperDialogProps) {
  const [crop, setCrop] = useState<Crop>()
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>()
  const imgRef = useRef<HTMLImageElement>(null)
  const [isLoading, setIsLoading] = useState(false)

  const onImageLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    if (!aspectRatio || crop) return // Only set initial crop once

    const { width, height } = e.currentTarget
    const initialCrop = makeAspectCrop(
      {
        unit: "%",
        width: 90,
      },
      aspectRatio,
      width,
      height
    )
    setCrop(initialCrop)
  }, [aspectRatio, crop])

  const getCroppedImg = (
    image: HTMLImageElement,
    pixelCrop: PixelCrop
  ): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement("canvas")
      const ctx = canvas.getContext("2d")

      if (!ctx) {
        reject(new Error("No 2d context"))
        return
      }

      // Calculate scale factors between displayed and natural image sizes
      const scaleX = image.naturalWidth / image.width
      const scaleY = image.naturalHeight / image.height

      // Scale the crop coordinates to natural image size
      const sourceX = Math.round(pixelCrop.x * scaleX)
      const sourceY = Math.round(pixelCrop.y * scaleY)
      const sourceWidth = Math.round(pixelCrop.width * scaleX)
      const sourceHeight = Math.round(pixelCrop.height * scaleY)

      // Set canvas to desired output size (800x800 for profile photos)
      const outputSize = 800
      canvas.width = outputSize
      canvas.height = outputSize


      // Set high-quality image smoothing
      ctx.imageSmoothingQuality = "high"
      ctx.imageSmoothingEnabled = true

      // Draw the cropped portion of the source image onto the canvas
      ctx.drawImage(
        image,
        sourceX,
        sourceY,
        sourceWidth,
        sourceHeight,
        0,
        0,
        canvas.width,
        canvas.height
      )

      // Convert to blob
      canvas.toBlob((blob) => {
        if (!blob) {
          reject(new Error("Canvas is empty"))
          return
        }
        resolve(blob)
      }, "image/jpeg", 0.95)
    })
  }

  const handleSave = async () => {
    if (!imgRef.current || !completedCrop || !imageFile) return

    setIsLoading(true)
    try {
      const croppedBlob = await getCroppedImg(imgRef.current, completedCrop)
      
      if (croppedBlob.size === 0) {
        throw new Error("Cropped image is empty")
      }

      const croppedFile = new File([croppedBlob], imageFile.name, {
        type: "image/jpeg",
      })
      
      onCropComplete(croppedFile)
      onOpenChange(false)
      setCrop(undefined)
      setCompletedCrop(undefined)
    } catch (error) {
      console.error("Error cropping image:", error)
      alert("Failed to crop image. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    onOpenChange(false)
    setCrop(undefined)
    setCompletedCrop(undefined)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl bg-white">
        <DialogHeader>
          <DialogTitle>Adjust Profile Picture</DialogTitle>
        </DialogHeader>
        <DialogDescription className="sr-only">
          Drag the corners to adjust the crop area for your profile picture
        </DialogDescription>
        <div className="flex flex-col items-center justify-center p-6">
          {imageFile && (
            <ReactCrop
              crop={crop}
              onChange={(c) => setCrop(c)}
              onComplete={(c) => setCompletedCrop(c)}
              aspect={aspectRatio}
              locked={false}
            >
              <img
                ref={imgRef}
                src={URL.createObjectURL(imageFile)}
                alt="Crop"
                onLoad={onImageLoad}
                style={{ maxWidth: "100%", maxHeight: "500px", display: "block" }}
              />
            </ReactCrop>
          )}
          <div className="flex gap-4 mt-6">
            <Button variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isLoading || !completedCrop}>
              {isLoading ? "Processing..." : "Apply"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

