"use client"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"

interface YPronunciationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  nameContext: string
  position: number
  onSelect: (isVowel: boolean) => void
}

export function YPronunciationDialog({
  open,
  onOpenChange,
  nameContext,
  position,
  onSelect,
}: YPronunciationDialogProps) {
  const letterPosition = position + 1
  const letter = nameContext.charAt(position)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            How is &apos;{letter}&apos; pronounced in &quot;{nameContext}&quot;?
          </DialogTitle>
          <DialogDescription asChild>
            <p>
              The letter &apos;Y&apos; (position {letterPosition}) can be counted as either a vowel or consonant
              depending on its pronunciation in this name.
            </p>
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <RadioGroup defaultValue="consonant" onValueChange={(value) => onSelect(value === "vowel")}>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="vowel" id="vowel" />
              <Label htmlFor="vowel" className="text-sm">
                Vowel sound (as in Lynn, Yvonne, Mary - sounds like &apos;ee&apos; or &apos;ih&apos;)
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="consonant" id="consonant" />
              <Label htmlFor="consonant" className="text-sm">
                Consonant sound (as in Floyd - sounds like &apos;y&apos; in &apos;yes&apos;)
              </Label>
            </div>
          </RadioGroup>
        </div>
      </DialogContent>
    </Dialog>
  )
}

