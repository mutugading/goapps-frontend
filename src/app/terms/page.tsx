"use client"

import Link from "next/link"
import Image from "next/image"
import { siteConfig } from "@/config/site"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { useCMSPageBySlug } from "@/hooks/use-public-landing"

const FALLBACK_CONTENT = `# Terms of Service

**Last updated: March 2026**

## 1. Acceptance of Terms

By accessing and using GoApps, you agree to be bound by these Terms of Service. Access to the platform is granted by your organization's administrator and is subject to these terms and your organization's internal policies.

## 2. Authorized Use

GoApps is provided for authorized business use only. You agree to:

- Use the platform only for legitimate business operations within your assigned role and permissions.
- Keep your login credentials confidential and not share them with others.
- Enable two-factor authentication when required by your organization's security policy.
- Report any security vulnerabilities or unauthorized access to your system administrator immediately.

## 3. Prohibited Activities

You must not:

- Attempt to access modules or data outside your assigned permissions.
- Share, export, or distribute business data outside authorized channels.
- Attempt to reverse-engineer, tamper with, or circumvent platform security controls.
- Use automated tools or scripts to interact with the platform without authorization.
- Upload malicious files or content through import features.

## 4. Data Accuracy

You are responsible for the accuracy of data you enter into the platform. This includes master data, financial records, and any imported data. Your organization may maintain additional data governance policies that apply.

## 5. Availability

While we strive for high availability, GoApps may experience scheduled maintenance or unplanned downtime. Critical maintenance windows will be communicated in advance when possible. The platform includes automated health monitoring and backup systems to minimize disruptions.

## 6. Audit and Monitoring

All user actions within GoApps are logged for security and compliance purposes. This includes login attempts, data modifications, exports, and administrative actions. Audit logs are accessible to authorized administrators and may be reviewed during compliance audits.

## 7. Account Termination

Your access may be suspended or terminated by your organization's administrator at any time. Upon termination, active sessions will be revoked and access to the platform will be immediately restricted.

## 8. Intellectual Property

GoApps and its associated software, documentation, and branding are the intellectual property of your organization. Users are granted a limited, non-transferable license to use the platform for authorized business purposes.

## 9. Limitation of Liability

GoApps is provided "as is" for internal business use. While we maintain robust security and backup systems, we are not liable for data loss resulting from user error, unauthorized access through compromised credentials, or force majeure events.

## 10. Changes to Terms

These terms may be updated periodically. Users will be notified of significant changes. Continued use of the platform after notification constitutes acceptance of the updated terms.

## 11. Contact

For questions about these terms, please contact your organization's IT department or system administrator.`

export default function TermsOfServicePage() {
    const { data: page, isLoading } = useCMSPageBySlug("terms")

    const title = page?.pageTitle || "Terms of Service"
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
                            <Link href="/privacy" className="text-xs text-muted-foreground hover:text-foreground">Privacy</Link>
                            <Link href="/terms" className="text-xs font-medium text-muted-foreground hover:text-foreground">Terms</Link>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    )
}
