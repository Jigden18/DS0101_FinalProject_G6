"use client"

import { useRef, useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Camera } from "lucide-react"

interface ProfileAvatarProps {
  src?: string
  alt: string
  fallback: string
  size?: "sm" | "md" | "lg"
  editable?: boolean
  onImageChange?: (file: File, previewUrl: string) => void
}

const sizeClasses = {
  sm: "h-10 w-10",
  md: "h-20 w-20",
  lg: "h-32 w-32",
}

export function ProfileAvatar({
  src,
  alt,
  fallback,
  size = "md",
  editable = false,
  onImageChange,
}: ProfileAvatarProps) {
  const [previewUrl, setPreviewUrl] = useState<string | undefined>(src)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleClick = () => {
    if (editable && fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const url = URL.createObjectURL(file)
      setPreviewUrl(url)
      onImageChange?.(file, url)
    }
  }

  return (
    <div
      className={`relative group ${editable ? "cursor-pointer" : ""}`}
      onClick={handleClick}
    >
      <Avatar className={sizeClasses[size]}>
        <AvatarImage src={previewUrl} alt={alt} />
        <AvatarFallback className={size === "lg" ? "text-2xl" : size === "md" ? "text-lg" : "text-sm"}>
          {fallback}
        </AvatarFallback>
      </Avatar>
      {editable && (
        <>
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
            <Camera className="h-6 w-6 text-white" />
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
        </>
      )}
    </div>
  )
}
