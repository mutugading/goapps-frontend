"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { PageHeader } from "@/components/common/page-header"
import { useUserProfile, userProfileKeys } from "@/hooks/iam/use-user-profile"
import { ChangePasswordForm } from "@/components/settings/change-password-form"
import { TwoFactorSettings } from "@/components/settings/two-factor-settings"
import { ActivityLogInline } from "@/components/settings/activity-log-inline"
import { ProfileEditForm } from "@/components/settings/profile-edit-form"
import { cn } from "@/lib/utils"
import { useQueryClient } from "@tanstack/react-query"
import { currentUserKeys } from "@/hooks/iam/use-current-user"
import {
    User,
    KeyRound,
    Shield,
    History,
} from "lucide-react"

type TabValue = "general" | "password" | "2fa" | "activity"

const sidebarItems: { id: TabValue; label: string; icon: React.ElementType }[] = [
    { id: "general", label: "General", icon: User },
    { id: "password", label: "Password", icon: KeyRound },
    { id: "2fa", label: "Security", icon: Shield },
    { id: "activity", label: "Activity", icon: History },
]

export default function ProfilePage() {
    const queryClient = useQueryClient()
    const { data: userProfile, isLoading, error } = useUserProfile()
    const [activeTab, setActiveTab] = useState<TabValue>("general")
    const [twoFactorEnabled, setTwoFactorEnabled] = useState<boolean | undefined>(undefined)

    // Get current 2FA status - prefer local state, fallback to user data
    const is2FAEnabled = twoFactorEnabled ?? userProfile?.user.twoFactorEnabled ?? false

    const handle2FAStatusChange = (enabled: boolean) => {
        setTwoFactorEnabled(enabled)
        queryClient.invalidateQueries({ queryKey: currentUserKeys.all })
        queryClient.invalidateQueries({ queryKey: userProfileKeys.all })
    }

    if (isLoading) {
        return (
            <div>
                <PageHeader title="Profile" subtitle="Loading your account information..." />
                <div className="flex gap-8">
                    <div className="w-48 space-y-2">
                        {[...Array(4)].map((_, i) => (
                            <Skeleton key={i} className="h-10 w-full" />
                        ))}
                    </div>
                    <div className="flex-1 space-y-6">
                        <Skeleton className="h-48 w-full" />
                        <Skeleton className="h-32 w-full" />
                    </div>
                </div>
            </div>
        )
    }

    if (error || !userProfile) {
        return (
            <div>
                <PageHeader title="Profile" subtitle="Unable to load profile" />
                <Card>
                    <CardContent className="py-8 text-center">
                        <User className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                        <p className="text-muted-foreground">
                            Failed to load profile information. Please try again.
                        </p>
                        <Button
                            variant="outline"
                            className="mt-4"
                            onClick={() => window.location.reload()}
                        >
                            Retry
                        </Button>
                    </CardContent>
                </Card>
            </div>
        )
    }

    const profileData = {
        fullName: userProfile.detail.fullName,
        firstName: userProfile.detail.firstName,
        lastName: userProfile.detail.lastName,
        phone: userProfile.detail.phone,
        position: userProfile.detail.position,
        dateOfBirth: userProfile.detail.dateOfBirth,
        address: userProfile.detail.address,
        profilePictureUrl: userProfile.detail.profilePictureUrl,
        email: userProfile.user.email,
        username: userProfile.user.username,
    }

    const roleCodes = userProfile.roleCodes

    return (
        <div>
            <PageHeader
                title="Profile"
                subtitle="Manage your account settings and preferences"
            />

            <div className="flex flex-col lg:flex-row gap-8">
                {/* Sidebar Navigation */}
                <nav className="w-full lg:w-48 space-y-1">
                    {sidebarItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            className={cn(
                                "w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors",
                                activeTab === item.id
                                    ? "bg-primary/10 text-primary"
                                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                            )}
                        >
                            <item.icon className="h-4 w-4" />
                            {item.label}
                        </button>
                    ))}
                </nav>

                {/* Content Area */}
                <div className="flex-1 space-y-6">
                    {activeTab === "general" && (
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle>Profile Information</CardTitle>
                                        <CardDescription>
                                            Update your personal information and profile picture.
                                        </CardDescription>
                                    </div>
                                    <div className="flex gap-2">
                                        {roleCodes.map((role) => (
                                            <Badge key={role} variant="secondary">
                                                {role}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <ProfileEditForm initialData={profileData} />
                            </CardContent>
                        </Card>
                    )}

                    {activeTab === "password" && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Password</CardTitle>
                                <CardDescription>
                                    Update your password associated with this account.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ChangePasswordForm />
                            </CardContent>
                        </Card>
                    )}

                    {activeTab === "2fa" && (
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle>Two-Factor Authentication</CardTitle>
                                        <CardDescription>
                                            Add an extra layer of security to your account.
                                        </CardDescription>
                                    </div>
                                    <Badge variant={is2FAEnabled ? "default" : "secondary"}>
                                        {is2FAEnabled ? "Enabled" : "Disabled"}
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <TwoFactorSettings
                                    initialEnabled={is2FAEnabled}
                                    onStatusChange={handle2FAStatusChange}
                                />
                            </CardContent>
                        </Card>
                    )}

                    {activeTab === "activity" && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Activity Log</CardTitle>
                                <CardDescription>
                                    Your recent login and account activity.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ActivityLogInline limit={15} />
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    )
}
