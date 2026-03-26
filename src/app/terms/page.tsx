import type { Metadata } from "next"
import Link from "next/link"
import Image from "next/image"
import { siteConfig } from "@/config/site"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"

export const metadata: Metadata = {
    title: "Terms of Service",
}

export default function TermsOfServicePage() {
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
                    Terms of Service
                </h1>
                <p className="mb-8 text-sm text-muted-foreground">
                    Last updated: March 2026
                </p>

                <div className="prose prose-neutral dark:prose-invert max-w-none space-y-8 text-sm leading-relaxed text-muted-foreground">
                    <section>
                        <h2 className="mb-3 text-lg font-semibold text-foreground">
                            1. Acceptance of Terms
                        </h2>
                        <p>
                            By accessing and using GoApps, you agree to be bound by these
                            Terms of Service. Access to the platform is granted by your
                            organization&apos;s administrator and is subject to these terms and
                            your organization&apos;s internal policies.
                        </p>
                    </section>

                    <section>
                        <h2 className="mb-3 text-lg font-semibold text-foreground">
                            2. Authorized Use
                        </h2>
                        <p>GoApps is provided for authorized business use only. You agree to:</p>
                        <ul className="mt-2 list-disc space-y-1 pl-6">
                            <li>
                                Use the platform only for legitimate business operations
                                within your assigned role and permissions.
                            </li>
                            <li>
                                Keep your login credentials confidential and not share them
                                with others.
                            </li>
                            <li>
                                Enable two-factor authentication when required by your
                                organization&apos;s security policy.
                            </li>
                            <li>
                                Report any security vulnerabilities or unauthorized access
                                to your system administrator immediately.
                            </li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="mb-3 text-lg font-semibold text-foreground">
                            3. Prohibited Activities
                        </h2>
                        <p>You must not:</p>
                        <ul className="mt-2 list-disc space-y-1 pl-6">
                            <li>
                                Attempt to access modules or data outside your assigned
                                permissions.
                            </li>
                            <li>
                                Share, export, or distribute business data outside
                                authorized channels.
                            </li>
                            <li>
                                Attempt to reverse-engineer, tamper with, or circumvent
                                platform security controls.
                            </li>
                            <li>
                                Use automated tools or scripts to interact with the platform
                                without authorization.
                            </li>
                            <li>
                                Upload malicious files or content through import features.
                            </li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="mb-3 text-lg font-semibold text-foreground">
                            4. Data Accuracy
                        </h2>
                        <p>
                            You are responsible for the accuracy of data you enter into the
                            platform. This includes master data, financial records, and any
                            imported data. Your organization may maintain additional data
                            governance policies that apply.
                        </p>
                    </section>

                    <section>
                        <h2 className="mb-3 text-lg font-semibold text-foreground">
                            5. Availability
                        </h2>
                        <p>
                            While we strive for high availability, GoApps may experience
                            scheduled maintenance or unplanned downtime. Critical
                            maintenance windows will be communicated in advance when
                            possible. The platform includes automated health monitoring and
                            backup systems to minimize disruptions.
                        </p>
                    </section>

                    <section>
                        <h2 className="mb-3 text-lg font-semibold text-foreground">
                            6. Audit and Monitoring
                        </h2>
                        <p>
                            All user actions within GoApps are logged for security and
                            compliance purposes. This includes login attempts, data
                            modifications, exports, and administrative actions. Audit logs
                            are accessible to authorized administrators and may be reviewed
                            during compliance audits.
                        </p>
                    </section>

                    <section>
                        <h2 className="mb-3 text-lg font-semibold text-foreground">
                            7. Account Termination
                        </h2>
                        <p>
                            Your access may be suspended or terminated by your
                            organization&apos;s administrator at any time. Upon termination,
                            active sessions will be revoked and access to the platform will
                            be immediately restricted.
                        </p>
                    </section>

                    <section>
                        <h2 className="mb-3 text-lg font-semibold text-foreground">
                            8. Intellectual Property
                        </h2>
                        <p>
                            GoApps and its associated software, documentation, and
                            branding are the intellectual property of{" "}
                            {siteConfig.organization.name}. Users are granted a limited,
                            non-transferable license to use the platform for authorized
                            business purposes.
                        </p>
                    </section>

                    <section>
                        <h2 className="mb-3 text-lg font-semibold text-foreground">
                            9. Limitation of Liability
                        </h2>
                        <p>
                            GoApps is provided &quot;as is&quot; for internal business use. While we
                            maintain robust security and backup systems, we are not liable
                            for data loss resulting from user error, unauthorized access
                            through compromised credentials, or force majeure events.
                        </p>
                    </section>

                    <section>
                        <h2 className="mb-3 text-lg font-semibold text-foreground">
                            10. Changes to Terms
                        </h2>
                        <p>
                            These terms may be updated periodically. Users will be notified
                            of significant changes. Continued use of the platform after
                            notification constitutes acceptance of the updated terms.
                        </p>
                    </section>

                    <section>
                        <h2 className="mb-3 text-lg font-semibold text-foreground">
                            11. Contact
                        </h2>
                        <p>
                            For questions about these terms, please contact your
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
                                className="text-xs text-muted-foreground hover:text-foreground"
                            >
                                Privacy
                            </Link>
                            <Link
                                href="/terms"
                                className="text-xs font-medium text-muted-foreground hover:text-foreground"
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
