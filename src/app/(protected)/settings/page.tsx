"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChangePasswordForm } from "@/components/settings/change-password-form"
import { TwoFactorSettings } from "@/components/settings/two-factor-settings"
import { KeyRound, Shield, History } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function SettingsPage() {
    return (
        <div className="container mx-auto py-8 px-4 max-w-4xl">
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Account Settings</h1>
                    <p className="text-muted-foreground">
                        Manage your security preferences and account settings
                    </p>
                </div>

                <Tabs defaultValue="password" className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="password" className="flex items-center gap-2">
                            <KeyRound className="h-4 w-4" />
                            Password
                        </TabsTrigger>
                        <TabsTrigger value="2fa" className="flex items-center gap-2">
                            <Shield className="h-4 w-4" />
                            Two-Factor Auth
                        </TabsTrigger>
                        <TabsTrigger value="activity" className="flex items-center gap-2">
                            <History className="h-4 w-4" />
                            Activity
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="password" className="mt-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Change Password</CardTitle>
                                <CardDescription>
                                    Update your password to keep your account secure
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ChangePasswordForm />
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="2fa" className="mt-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Two-Factor Authentication</CardTitle>
                                <CardDescription>
                                    Add an extra layer of security to your account
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <TwoFactorSettings />
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="activity" className="mt-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Recent Activity</CardTitle>
                                <CardDescription>
                                    View your recent login and account activity
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="text-center py-8">
                                    <History className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                                    <p className="text-muted-foreground mb-4">
                                        View detailed activity log for your account
                                    </p>
                                    <Link href="/settings/activity">
                                        <Button variant="outline">View Activity Log</Button>
                                    </Link>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    )
}
