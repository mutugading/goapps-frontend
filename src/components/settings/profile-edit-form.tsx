"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"
import { Loader2, Save } from "lucide-react"
import { useQueryClient } from "@tanstack/react-query"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { AvatarUpload } from "@/components/settings/avatar-upload"
import { currentUserKeys } from "@/hooks/iam/use-current-user"
import { userProfileKeys } from "@/hooks/iam/use-user-profile"

const profileSchema = z.object({
    fullName: z.string().min(1, "Full name is required").max(100),
    firstName: z.string().min(1, "First name is required").max(100),
    lastName: z.string().min(1, "Last name is required").max(100),
    phone: z.string().max(20).optional(),
    position: z.string().max(50).optional(),
    dateOfBirth: z.string().optional(),
    address: z.string().max(500).optional(),
})

type ProfileFormData = z.infer<typeof profileSchema>

interface ProfileEditFormProps {
    initialData: {
        fullName?: string
        firstName?: string
        lastName?: string
        phone?: string
        position?: string
        dateOfBirth?: string
        address?: string
        profilePictureUrl?: string
        email?: string
        username?: string
    }
}

export function ProfileEditForm({ initialData }: ProfileEditFormProps) {
    const queryClient = useQueryClient()
    const [saving, setSaving] = useState(false)

    const {
        register,
        handleSubmit,
        formState: { errors, isDirty },
    } = useForm<ProfileFormData>({
        resolver: zodResolver(profileSchema),
        defaultValues: {
            fullName: initialData.fullName || "",
            firstName: initialData.firstName || "",
            lastName: initialData.lastName || "",
            phone: initialData.phone || "",
            position: initialData.position || "",
            dateOfBirth: initialData.dateOfBirth?.split("T")[0] || "",
            address: initialData.address || "",
        },
    })

    const initials = initialData.fullName
        ?.split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2) || "?"

    const onSubmit = async (data: ProfileFormData) => {
        try {
            setSaving(true)
            const response = await fetch("/api/v1/iam/users/me/detail", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    fullName: data.fullName,
                    firstName: data.firstName,
                    lastName: data.lastName,
                    phone: data.phone || undefined,
                    position: data.position || undefined,
                    dateOfBirth: data.dateOfBirth || undefined,
                    address: data.address || undefined,
                }),
            })

            const result = await response.json()

            if (result.base?.isSuccess) {
                toast.success("Profile updated successfully")
                queryClient.invalidateQueries({ queryKey: currentUserKeys.all })
                queryClient.invalidateQueries({ queryKey: userProfileKeys.all })
            } else {
                toast.error(result.base?.message || "Failed to update profile")
            }
        } catch (error) {
            console.error("Error updating profile:", error)
            toast.error("Failed to update profile")
        } finally {
            setSaving(false)
        }
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Avatar Upload Section */}
            <AvatarUpload
                currentAvatarUrl={initialData.profilePictureUrl}
                fallbackInitials={initials}
                fullName={initialData.fullName}
            />

            <Separator />

            {/* Read-only fields */}
            <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                    <Label>Username</Label>
                    <Input value={initialData.username || ""} disabled />
                </div>
                <div className="space-y-2">
                    <Label>Email</Label>
                    <Input value={initialData.email || ""} disabled />
                </div>
            </div>

            {/* Name fields */}
            <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                    <Label htmlFor="firstName">First Name *</Label>
                    <Input
                        id="firstName"
                        placeholder="John"
                        {...register("firstName")}
                    />
                    {errors.firstName && (
                        <p className="text-sm text-destructive">{errors.firstName.message}</p>
                    )}
                </div>
                <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name *</Label>
                    <Input
                        id="lastName"
                        placeholder="Doe"
                        {...register("lastName")}
                    />
                    {errors.lastName && (
                        <p className="text-sm text-destructive">{errors.lastName.message}</p>
                    )}
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="fullName">Full Name *</Label>
                <Input
                    id="fullName"
                    placeholder="John Doe"
                    {...register("fullName")}
                />
                {errors.fullName && (
                    <p className="text-sm text-destructive">{errors.fullName.message}</p>
                )}
            </div>

            {/* Contact & Job */}
            <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                        id="phone"
                        type="tel"
                        placeholder="+62 812 3456 7890"
                        {...register("phone")}
                    />
                    {errors.phone && (
                        <p className="text-sm text-destructive">{errors.phone.message}</p>
                    )}
                </div>
                <div className="space-y-2">
                    <Label htmlFor="position">Position / Job Title</Label>
                    <Input
                        id="position"
                        placeholder="Software Engineer"
                        {...register("position")}
                    />
                    {errors.position && (
                        <p className="text-sm text-destructive">{errors.position.message}</p>
                    )}
                </div>
            </div>

            {/* Date of Birth */}
            <div className="space-y-2">
                <Label htmlFor="dateOfBirth">Date of Birth</Label>
                <Input
                    id="dateOfBirth"
                    type="date"
                    {...register("dateOfBirth")}
                />
            </div>

            {/* Address */}
            <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Textarea
                    id="address"
                    placeholder="Enter your address..."
                    rows={3}
                    {...register("address")}
                />
                {errors.address && (
                    <p className="text-sm text-destructive">{errors.address.message}</p>
                )}
            </div>

            {/* Submit */}
            <div className="flex justify-end">
                <Button type="submit" disabled={saving || !isDirty}>
                    {saving ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                        <Save className="mr-2 h-4 w-4" />
                    )}
                    Save Changes
                </Button>
            </div>
        </form>
    )
}
