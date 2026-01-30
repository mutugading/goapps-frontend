import { siteConfig } from "@/config/site"

export function Footer() {
    return (
        <footer className="border-t py-6 px-4">
            <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
                <p className="text-sm text-muted-foreground">
                    © {new Date().getFullYear()} {siteConfig.name}. All rights reserved.
                </p>
                <p className="text-sm text-muted-foreground">
                    Version {siteConfig.version}
                </p>
            </div>
        </footer>
    )
}
