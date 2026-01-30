import { ReactNode } from "react"

export interface PageHeaderProps {
    title: string
    subtitle?: string
    children?: ReactNode
}

export function PageHeader({ title, subtitle, children }: PageHeaderProps) {
    return (
        <div className="flex flex-col gap-4 pb-6 md:flex-row md:items-center md:justify-between">
            <div className="space-y-1">
                <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
                    {title}
                </h1>
                {subtitle && (
                    <p className="text-muted-foreground">{subtitle}</p>
                )}
            </div>
            {children && <div className="flex items-center gap-2">{children}</div>}
        </div>
    )
}
