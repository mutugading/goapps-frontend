import type { Metadata } from "next"
import Link from "next/link"
import Image from "next/image"
import { siteConfig } from "@/config/site"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"

export const metadata: Metadata = {
    title: "Privacy Policy",
}

export default function PrivacyPolicyPage() {
    return (
        <div className="flex min-h-svh flex-col bg-background">
            {/* Header */}
            <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-sm">
                <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-3">
                    <Link href="/" className="flex items-center gap-3">
                        <Image
                            src="/logo.png"
                            alt={siteConfig.name}
                            width={32}
                            height={32}
                        />
                        <span className="text-lg font-semibold tracking-tight">
                            {siteConfig.name}
                        </span>
                    </Link>
                    <Button variant="ghost" size="sm" asChild>
                        <Link href="/">
                            <ArrowLeft className="h-4 w-4" />
                            Back
                        </Link>
                    </Button>
                </div>
            </header>

            <main className="mx-auto max-w-4xl flex-1 px-6 py-12">
                <h1 className="mb-2 text-3xl font-bold tracking-tight">
                    Privacy Policy
                </h1>
                <p className="mb-8 text-sm text-muted-foreground">
                    Last updated: March 2026
                </p>

                <div className="prose prose-neutral dark:prose-invert max-w-none space-y-8 text-sm leading-relaxed text-muted-foreground">
                    <section>
                        <h2 className="mb-3 text-lg font-semibold text-foreground">
                            1. Information We Collect
                        </h2>
                        <p>
                            GoApps collects information necessary to provide access to the
                            platform and maintain security. This includes:
                        </p>
                        <ul className="mt-2 list-disc space-y-1 pl-6">
                            <li>
                                Account information: name, email address, username, and
                                department assignment provided by your organization.
                            </li>
                            <li>
                                Authentication data: hashed passwords, session tokens, and
                                two-factor authentication configurations.
                            </li>
                            <li>
                                Usage data: login timestamps, accessed pages, and actions
                                performed (audit trail).
                            </li>
                            <li>
                                Device information: browser type, IP address, and device
                                identifiers for session management.
                            </li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="mb-3 text-lg font-semibold text-foreground">
                            2. How We Use Your Information
                        </h2>
                        <p>We use collected information to:</p>
                        <ul className="mt-2 list-disc space-y-1 pl-6">
                            <li>
                                Authenticate your identity and enforce role-based access
                                controls.
                            </li>
                            <li>
                                Maintain security through audit logging and session
                                management.
                            </li>
                            <li>
                                Provide and improve platform functionality for your
                                organization.
                            </li>
                            <li>
                                Send system notifications related to your account (password
                                resets, security alerts).
                            </li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="mb-3 text-lg font-semibold text-foreground">
                            3. Data Storage and Security
                        </h2>
                        <p>
                            All data is stored on infrastructure managed by your
                            organization. GoApps employs industry-standard security
                            measures including:
                        </p>
                        <ul className="mt-2 list-disc space-y-1 pl-6">
                            <li>
                                Encrypted connections (TLS) for all data in transit.
                            </li>
                            <li>
                                Bcrypt-hashed passwords — plaintext passwords are never
                                stored.
                            </li>
                            <li>
                                JWT token-based authentication with automatic expiration and
                                refresh.
                            </li>
                            <li>
                                Regular automated database backups with offsite replication.
                            </li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="mb-3 text-lg font-semibold text-foreground">
                            4. Data Sharing
                        </h2>
                        <p>
                            GoApps does not sell, trade, or share your personal data with
                            third parties. Data is only accessible to authorized users
                            within your organization as defined by your administrator&apos;s
                            role and permission configurations.
                        </p>
                    </section>

                    <section>
                        <h2 className="mb-3 text-lg font-semibold text-foreground">
                            5. Data Retention
                        </h2>
                        <p>
                            Account data is retained for the duration of your employment or
                            access authorization. Audit logs are retained according to your
                            organization&apos;s compliance policies. Soft-deleted records may be
                            retained for recovery purposes.
                        </p>
                    </section>

                    <section>
                        <h2 className="mb-3 text-lg font-semibold text-foreground">
                            6. Your Rights
                        </h2>
                        <p>
                            You may request access to, correction of, or deletion of your
                            personal data by contacting your system administrator. Account
                            management operations are available through the platform&apos;s user
                            settings.
                        </p>
                    </section>

                    <section>
                        <h2 className="mb-3 text-lg font-semibold text-foreground">
                            7. Contact
                        </h2>
                        <p>
                            For privacy-related inquiries, please contact your
                            organization&apos;s IT department or system administrator.
                        </p>
                    </section>
                </div>
            </main>

            {/* Footer */}
            <footer className="border-t">
                <div className="mx-auto max-w-4xl px-6 py-6">
                    <div className="flex items-center justify-between">
                        <p className="text-xs text-muted-foreground">
                            &copy; {new Date().getFullYear()}{" "}
                            {siteConfig.organization.name}
                        </p>
                        <div className="flex gap-4">
                            <Link
                                href="/privacy"
                                className="text-xs font-medium text-muted-foreground hover:text-foreground"
                            >
                                Privacy
                            </Link>
                            <Link
                                href="/terms"
                                className="text-xs text-muted-foreground hover:text-foreground"
                            >
                                Terms
                            </Link>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    )
}
