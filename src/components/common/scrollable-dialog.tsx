"use client"

// Scrollable dialog wrappers — for forms long enough to need a scrollable
// body while keeping header + footer pinned (no horizontal overflow either).
//
// Use these in place of <DialogContent>, <DialogHeader>, <DialogFooter>
// for any tall form modal:
//
//   <Dialog open={...} onOpenChange={...}>
//     <ScrollableDialogContent className="sm:max-w-[480px]">
//       <ScrollableDialogHeader>
//         <DialogTitle>...</DialogTitle>
//         <DialogDescription>...</DialogDescription>
//       </ScrollableDialogHeader>
//       <ScrollableDialogBody>
//         {/* long form contents */}
//       </ScrollableDialogBody>
//       <ScrollableDialogFooter>
//         <Button>Cancel</Button>
//         <Button type="submit">Save</Button>
//       </ScrollableDialogFooter>
//     </ScrollableDialogContent>
//   </Dialog>

import * as React from "react"
import { DialogContent, DialogHeader, DialogFooter } from "@/components/ui/dialog"
import { cn } from "@/lib/utils"

export function ScrollableDialogContent({
    className,
    children,
    ...props
}: React.ComponentProps<typeof DialogContent>) {
    return (
        <DialogContent
            className={cn(
                "max-h-[90vh] overflow-hidden p-0 flex flex-col gap-0",
                "w-[calc(100%-2rem)] sm:max-w-lg",
                className
            )}
            {...props}
        >
            {children}
        </DialogContent>
    )
}

export function ScrollableDialogHeader({
    className,
    children,
    ...props
}: React.ComponentProps<typeof DialogHeader>) {
    return (
        <DialogHeader
            className={cn(
                "px-6 pt-6 pb-4 border-b shrink-0 text-left",
                className
            )}
            {...props}
        >
            {children}
        </DialogHeader>
    )
}

export function ScrollableDialogBody({
    className,
    children,
    ...props
}: React.HTMLAttributes<HTMLDivElement>) {
    return (
        <div
            className={cn(
                "flex-1 overflow-y-auto overflow-x-hidden px-6 py-4 min-w-0",
                className
            )}
            {...props}
        >
            {children}
        </div>
    )
}

export function ScrollableDialogFooter({
    className,
    children,
    ...props
}: React.ComponentProps<typeof DialogFooter>) {
    return (
        <DialogFooter
            className={cn(
                "px-6 py-4 border-t shrink-0 bg-background",
                className
            )}
            {...props}
        >
            {children}
        </DialogFooter>
    )
}
