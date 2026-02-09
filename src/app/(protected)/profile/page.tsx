"use client"

import { useEffect, useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ProfileHeader } from "@/components/profile/profile-header"
import { ProfileForm } from "@/components/profile/profile-form"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, User, Settings, Shield } from "lucide-react"

interface UserProfile {
    user: {
        userId: string
        username: string
        email: string
        isActive: boolean
        isLocked: boolean
        twoFactorEnabled: boolean
        lastLoginAt: string | null
    } | null
    detail: {
        detailId: string
        userId: string
        employeeCode: string
        fullName: string
        firstName: string
        lastName: string
        phone: string | null
        profilePictureUrl: string | null
        position: string | null
        dateOfBirth: string | null
        address: string | null
        section: {
            sectionName: string
            departmentName: string
            divisionName: string
            companyName: string
        } | null
    } | null
    roleCodes: string[]
}

export default function ProfilePage() {
    const [profile, setProfile] = useState<UserProfile | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const fetchProfile = async () => {
        try {
            setLoading(true)
            setError(null)
            const response = await fetch("/api/v1/iam/users/me")
            const data = await response.json()

            if (data.base?.isSuccess) {
                setProfile(data.data)
            } else {
                setError(data.base?.message || "Failed to load profile")
            }
        } catch (err) {
            console.error("Error fetching profile:", err)
            setError("Failed to load profile")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchProfile()
    }, [])

    if (loading) {
        return (
            <div className="container mx-auto py-8 px-4 max-w-4xl">
                <div className="space-y-6">
                    <Skeleton className="h-32 w-full" />
                    <Skeleton className="h-64 w-full" />
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="container mx-auto py-8 px-4 max-w-4xl">
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            </div>
        )
    }

    return (
        <div className="container mx-auto py-8 px-4 max-w-4xl">
            <div className="space-y-6">
                {/* Profile Header */}
                <ProfileHeader
                    name={profile?.detail?.fullName || profile?.user?.username || "User"}
                    email={profile?.user?.email || ""}
                    avatarUrl={profile?.detail?.profilePictureUrl || undefined}
                    position={profile?.detail?.position || undefined}
                    department={profile?.detail?.section?.departmentName || undefined}
                    roles={profile?.roleCodes || []}
                    twoFactorEnabled={profile?.user?.twoFactorEnabled || false}
                />

                {/* Tabs */}
                <Tabs defaultValue="profile" className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="profile" className="flex items-center gap-2">
                            <User className="h-4 w-4" />
                            Profile
                        </TabsTrigger>
                        <TabsTrigger value="security" className="flex items-center gap-2">
                            <Shield className="h-4 w-4" />
                            Security
                        </TabsTrigger>
                        <TabsTrigger value="preferences" className="flex items-center gap-2">
                            <Settings className="h-4 w-4" />
                            Preferences
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="profile" className="mt-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Personal Information</CardTitle>
                                <CardDescription>
                                    Update your personal details and contact information
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ProfileForm
                                    initialData={{
                                        firstName: profile?.detail?.firstName || "",
                                        lastName: profile?.detail?.lastName || "",
                                        fullName: profile?.detail?.fullName || "",
                                        email: profile?.user?.email || "",
                                        phone: profile?.detail?.phone || "",
                                        position: profile?.detail?.position || "",
                                        address: profile?.detail?.address || "",
                                        dateOfBirth: profile?.detail?.dateOfBirth || "",
                                    }}
                                    onSuccess={fetchProfile}
                                />
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="security" className="mt-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Security Settings</CardTitle>
                                <CardDescription>
                                    Manage your password and two-factor authentication
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="text-muted-foreground">
                                Security settings will be available in the Settings page.
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="preferences" className="mt-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Preferences</CardTitle>
                                <CardDescription>
                                    Customize your experience
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="text-muted-foreground">
                                Preferences settings coming soon.
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    )
}
