"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PageHeader } from "@/components/common/page-header"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { useTheme } from "next-themes"
import { useState, useEffect } from "react"
import { toast } from "sonner"
import {
    Bell,
    Globe,
    Palette,
} from "lucide-react"

export default function SettingsPage() {
    const { theme, setTheme } = useTheme()
    const [mounted, setMounted] = useState(false)
    const [notifications, setNotifications] = useState({
        email: true,
        push: false,
        updates: true,
    })

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional: prevent hydration mismatch for theme-dependent UI
        setMounted(true)
    }, [])

    const handleSave = () => {
        toast.success("Settings saved successfully")
    }

    if (!mounted) {
        return null
    }

    return (
        <div>
            <PageHeader
                title="Settings"
                subtitle="Manage application preferences and settings"
            />

            <div className="space-y-6">
                {/* Appearance */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <Palette className="h-5 w-5" />
                            <CardTitle>Appearance</CardTitle>
                        </div>
                        <CardDescription>
                            Customize how the application looks on your device
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label>Theme</Label>
                                <p className="text-sm text-muted-foreground">
                                    Select the theme for the application
                                </p>
                            </div>
                            <Select value={theme} onValueChange={setTheme}>
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="Select theme" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="light">Light</SelectItem>
                                    <SelectItem value="dark">Dark</SelectItem>
                                    <SelectItem value="system">System</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                </Card>

                {/* Notifications */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <Bell className="h-5 w-5" />
                            <CardTitle>Notifications</CardTitle>
                        </div>
                        <CardDescription>
                            Configure how you receive notifications
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label>Email Notifications</Label>
                                <p className="text-sm text-muted-foreground">
                                    Receive notifications via email
                                </p>
                            </div>
                            <Switch
                                checked={notifications.email}
                                onCheckedChange={(checked) =>
                                    setNotifications({ ...notifications, email: checked })
                                }
                            />
                        </div>
                        <Separator />
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label>Push Notifications</Label>
                                <p className="text-sm text-muted-foreground">
                                    Receive push notifications in your browser
                                </p>
                            </div>
                            <Switch
                                checked={notifications.push}
                                onCheckedChange={(checked) =>
                                    setNotifications({ ...notifications, push: checked })
                                }
                            />
                        </div>
                        <Separator />
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label>Product Updates</Label>
                                <p className="text-sm text-muted-foreground">
                                    Receive news about product updates and new features
                                </p>
                            </div>
                            <Switch
                                checked={notifications.updates}
                                onCheckedChange={(checked) =>
                                    setNotifications({ ...notifications, updates: checked })
                                }
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Language & Region */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <Globe className="h-5 w-5" />
                            <CardTitle>Language & Region</CardTitle>
                        </div>
                        <CardDescription>
                            Set your preferred language and regional settings
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label>Language</Label>
                                <p className="text-sm text-muted-foreground">
                                    Select your preferred language
                                </p>
                            </div>
                            <Select defaultValue="en">
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="Select language" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="en">English</SelectItem>
                                    <SelectItem value="id">Indonesian</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <Separator />
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label>Timezone</Label>
                                <p className="text-sm text-muted-foreground">
                                    Your current timezone setting
                                </p>
                            </div>
                            <Select defaultValue="asia_jakarta">
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="Select timezone" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="asia_jakarta">Asia/Jakarta (WIB)</SelectItem>
                                    <SelectItem value="asia_makassar">Asia/Makassar (WITA)</SelectItem>
                                    <SelectItem value="asia_jayapura">Asia/Jayapura (WIT)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                </Card>

                {/* Save Button */}
                <div className="flex justify-end">
                    <Button onClick={handleSave}>Save Settings</Button>
                </div>
            </div>
        </div>
    )
}
