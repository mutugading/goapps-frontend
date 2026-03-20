"use client"

import { useState } from "react"
import { Loader2, AlertTriangle } from "lucide-react"

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"

import { useDeleteMenu } from "@/hooks/iam/use-menu"
import type { NormalizedMenuWithChildren } from "@/types/iam/menu"

interface MenuDeleteDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    menu: NormalizedMenuWithChildren | null
}

export function MenuDeleteDialog({ open, onOpenChange, menu }: MenuDeleteDialogProps) {
    const [cascade, setCascade] = useState(false)
    const deleteMenu = useDeleteMenu()
    const hasChildren = (menu?.children?.length ?? 0) > 0

    async function handleConfirm() {
        if (!menu) return
        await deleteMenu.mutateAsync({ menuId: menu.menuId, cascade })
        onOpenChange(false)
        setCascade(false)
    }

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle className="flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-destructive" />
                        Delete Menu
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                        Are you sure you want to delete{" "}
                        <strong>&quot;{menu?.menuTitle}&quot;</strong>?
                        {hasChildren && (
                            <span className="block mt-2 text-amber-600 dark:text-amber-400">
                                This menu has {menu!.children.length} child item
                                {menu!.children.length > 1 ? "s" : ""}. Enable cascade delete to
                                remove all children as well.
                            </span>
                        )}
                    </AlertDialogDescription>
                </AlertDialogHeader>

                {hasChildren && (
                    <div className="flex items-center gap-2 px-1">
                        <Checkbox
                            id="cascade"
                            checked={cascade}
                            onCheckedChange={(v) => setCascade(Boolean(v))}
                        />
                        <Label htmlFor="cascade" className="cursor-pointer text-sm">
                            Delete all child menus (cascade)
                        </Label>
                    </div>
                )}

                <AlertDialogFooter>
                    <AlertDialogCancel disabled={deleteMenu.isPending}>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        onClick={handleConfirm}
                        disabled={deleteMenu.isPending || (hasChildren && !cascade)}
                    >
                        {deleteMenu.isPending && (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        )}
                        Delete
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}
