"use client"

import { useState, useRef, useCallback } from "react"
import { toast } from "sonner"
import { Loader2, Camera, X, Upload } from "lucide-react"
import { useQueryClient } from "@tanstack/react-query"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { currentUserKeys } from "@/hooks/iam/use-current-user"
import { userProfileKeys } from "@/hooks/iam/use-user-profile"

const MAX_FILE_SIZE = 2 * 1024 * 1024 // 2MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"]

interface AvatarUploadProps {
    currentAvatarUrl?: string
    fallbackInitials: string
    fullName?: string
    onUploadSuccess?: (newUrl: string) => void
}

export function AvatarUpload({
    currentAvatarUrl,
    fallbackInitials,
    fullName,
    onUploadSuccess,
}: AvatarUploadProps) {
    const queryClient = useQueryClient()
    const fileInputRef = useRef<HTMLInputElement>(null)
    const [uploading, setUploading] = useState(false)
    const [previewUrl, setPreviewUrl] = useState<string | null>(null)
    const [dragOver, setDragOver] = useState(false)

    const displayUrl = previewUrl || currentAvatarUrl

    const validateFile = useCallback((file: File): string | null => {
        if (!ALLOWED_TYPES.includes(file.type)) {
            return "Invalid file type. Only JPEG, PNG, and WebP are allowed."
        }
        if (file.size > MAX_FILE_SIZE) {
            return `File too large (${(file.size / 1024 / 1024).toFixed(1)}MB). Maximum size is 2MB.`
        }
        return null
    }, [])

    const uploadFile = useCallback(async (file: File) => {
        const error = validateFile(file)
        if (error) {
            toast.error(error)
            return
        }

        // Show preview immediately
        const objectUrl = URL.createObjectURL(file)
        setPreviewUrl(objectUrl)

        try {
            setUploading(true)
            const formData = new FormData()
            formData.append("file", file)

            const response = await fetch("/api/v1/iam/users/me/avatar", {
                method: "POST",
                body: formData,
            })

            const result = await response.json()

            if (result.base?.isSuccess) {
                toast.success("Profile picture updated!")
                // Invalidate queries to refresh avatar everywhere
                queryClient.invalidateQueries({ queryKey: currentUserKeys.all })
                queryClient.invalidateQueries({ queryKey: userProfileKeys.all })
                onUploadSuccess?.(result.profilePictureUrl)
                // Keep showing the new URL from server
                setPreviewUrl(result.profilePictureUrl)
            } else {
                toast.error(result.base?.message || "Failed to upload avatar")
                // Revert preview on failure
                setPreviewUrl(null)
            }
        } catch (err) {
            console.error("Avatar upload error:", err)
            toast.error("Failed to upload avatar")
            setPreviewUrl(null)
        } finally {
            setUploading(false)
            URL.revokeObjectURL(objectUrl)
        }
    }, [validateFile, queryClient, onUploadSuccess])

    const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            uploadFile(file)
        }
        // Reset input so same file can be re-selected
        e.target.value = ""
    }, [uploadFile])

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        setDragOver(false)
        const file = e.dataTransfer.files?.[0]
        if (file) {
            uploadFile(file)
        }
    }, [uploadFile])

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        setDragOver(true)
    }, [])

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        setDragOver(false)
    }, [])

    return (
        <div className="flex items-center gap-6">
            {/* Avatar with upload overlay */}
            <div
                className="relative group cursor-pointer"
                onClick={() => !uploading && fileInputRef.current?.click()}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
            >
                <Avatar className={`h-24 w-24 transition-opacity ${uploading ? "opacity-50" : "group-hover:opacity-75"} ${dragOver ? "ring-2 ring-primary ring-offset-2" : ""}`}>
                    <AvatarImage
                        src={displayUrl}
                        alt={fullName || "Profile picture"}
                    />
                    <AvatarFallback className="text-2xl font-semibold">
                        {fallbackInitials}
                    </AvatarFallback>
                </Avatar>

                {/* Overlay */}
                <div className={`absolute inset-0 flex items-center justify-center rounded-full transition-opacity ${uploading ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}>
                    {uploading ? (
                        <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    ) : (
                        <div className="bg-black/50 rounded-full p-2">
                            <Camera className="h-5 w-5 text-white" />
                        </div>
                    )}
                </div>

                {/* Hidden file input */}
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleFileSelect}
                    className="hidden"
                    disabled={uploading}
                />
            </div>

            {/* Info & actions */}
            <div className="space-y-2">
                <div>
                    <p className="text-sm font-medium">Profile Picture</p>
                    <p className="text-xs text-muted-foreground">
                        JPG, PNG or WebP. Max 2MB.
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={uploading}
                        onClick={() => fileInputRef.current?.click()}
                    >
                        {uploading ? (
                            <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                        ) : (
                            <Upload className="mr-2 h-3.5 w-3.5" />
                        )}
                        {uploading ? "Uploading..." : "Change Photo"}
                    </Button>
                </div>
            </div>
        </div>
    )
}
