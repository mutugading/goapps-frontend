import Link from "next/link"
import { siteConfig } from "@/config/site"

export function Footer() {
    const currentYear = new Date().getFullYear()

    return (
        <footer className="border-t py-6 md:py-0">
            <div className="flex flex-col items-center justify-between gap-4 md:h-16 md:flex-row">
                <div className="flex flex-col items-center gap-4 px-0 md:flex-row md:gap-2 md:px-0">
                    <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
                        © {currentYear} {siteConfig.name}. All rights reserved.
                    </p>
                </div>
                <div className="flex items-center gap-4">
                    <Link
                        href="/privacy"
                        className="text-sm text-muted-foreground underline-offset-4 hover:underline"
                    >
                        Privacy Policy
                    </Link>
                    <Link
                        href="/terms"
                        className="text-sm text-muted-foreground underline-offset-4 hover:underline"
                    >
                        Terms of Service
                    </Link>
                    <span className="text-sm text-muted-foreground">
                        v{siteConfig.version}
                    </span>
                </div>
            </div>
        </footer>
    )
}
