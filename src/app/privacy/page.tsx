"use client"

import Link from "next/link"
import Image from "next/image"
import { siteConfig } from "@/config/site"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { useCMSPageBySlug } from "@/hooks/use-public-landing"

const FALLBACK_CONTENT = `# Privacy Policy

**Last updated: March 2026**

## 1. Information We Collect

GoApps collects information necessary to provide access to the platform and maintain security. This includes:

- Account information: name, email address, username, and department assignment provided by your organization.
- Authentication data: hashed passwords, session tokens, and two-factor authentication configurations.
- Usage data: login timestamps, accessed pages, and actions performed (audit trail).
- Device information: browser type, IP address, and device identifiers for session management.

## 2. How We Use Your Information

We use collected information to:

- Authenticate your identity and enforce role-based access controls.
- Maintain security through audit logging and session management.
- Provide and improve platform functionality for your organization.
- Send system notifications related to your account (password resets, security alerts).

## 3. Data Storage and Security

All data is stored on infrastructure managed by your organization. GoApps employs industry-standard security measures including:

- Encrypted connections (TLS) for all data in transit.
- Bcrypt-hashed passwords — plaintext passwords are never stored.
- JWT token-based authentication with automatic expiration and refresh.
- Regular automated database backups with offsite replication.

## 4. Data Sharing

GoApps does not sell, trade, or share your personal data with third parties. Data is only accessible to authorized users within your organization as defined by your administrator's role and permission configurations.

## 5. Data Retention

Account data is retained for the duration of your employment or access authorization. Audit logs are retained according to your organization's compliance policies. Soft-deleted records may be retained for recovery purposes.

## 6. Your Rights

You may request access to, correction of, or deletion of your personal data by contacting your system administrator. Account management operations are available through the platform's user settings.

## 7. Contact

For privacy-related inquiries, please contact your organization's IT department or system administrator.`

export default function PrivacyPolicyPage() {
    const { data: page, isLoading } = useCMSPageBySlug("privacy")

    const title = page?.pageTitle || "Privacy Policy"
    const content = page?.pageContent || FALLBACK_CONTENT

    return (
        <div className="flex min-h-svh flex-col bg-background">
            <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-sm">
                <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-3">
                    <Link href="/" className="flex items-center gap-3">
                        <Image src="/logo.png" alt={siteConfig.name} width={32} height={32} />
                        <span className="text-lg font-semibold tracking-tight">{siteConfig.name}</span>
                    </Link>
                    <Button variant="ghost" size="sm" asChild>
                        <Link href="/"><ArrowLeft className="h-4 w-4" /> Back</Link>
                    </Button>
                </div>
            </header>

            <main className="mx-auto max-w-4xl flex-1 px-6 py-12">
                {isLoading ? (
                    <div className="space-y-4">
                        <Skeleton className="h-10 w-64" />
                        <Skeleton className="h-4 w-48" />
                        <div className="space-y-2 pt-4">
                            {Array.from({ length: 8 }).map((_, i) => (
                                <Skeleton key={i} className="h-4 w-full" />
                            ))}
                        </div>
                    </div>
                ) : (
                    <>
                        <h1 className="mb-2 text-3xl font-bold tracking-tight">{title}</h1>
                        {page?.metaDescription && (
                            <p className="mb-8 text-sm text-muted-foreground">{page.metaDescription}</p>
                        )}
                        <div className="prose prose-neutral dark:prose-invert max-w-none text-sm leading-relaxed text-muted-foreground whitespace-pre-line">
                            {content.split("\n").map((line, i) => {
                                if (line.startsWith("# ")) return <h1 key={i} className="mb-3 text-2xl font-bold text-foreground">{line.slice(2)}</h1>
                                if (line.startsWith("## ")) return <h2 key={i} className="mb-3 mt-8 text-lg font-semibold text-foreground">{line.slice(3)}</h2>
                                if (line.startsWith("**") && line.endsWith("**")) return <p key={i} className="mb-4 font-medium">{line.slice(2, -2)}</p>
                                if (line.startsWith("- ")) return <li key={i} className="ml-6 list-disc">{line.slice(2)}</li>
                                if (line.trim() === "") return <br key={i} />
                                return <p key={i} className="mb-2">{line}</p>
                            })}
                        </div>
                    </>
                )}
            </main>

            <footer className="border-t">
                <div className="mx-auto max-w-4xl px-6 py-6">
                    <div className="flex items-center justify-between">
                        <p className="text-xs text-muted-foreground">
                            &copy; {new Date().getFullYear()} {siteConfig.organization.name}
                        </p>
                        <div className="flex gap-4">
                            <Link href="/privacy" className="text-xs font-medium text-muted-foreground hover:text-foreground">Privacy</Link>
                            <Link href="/terms" className="text-xs text-muted-foreground hover:text-foreground">Terms</Link>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    )
}
