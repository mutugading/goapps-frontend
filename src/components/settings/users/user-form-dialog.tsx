"use client"

import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"

import type { UserWithDetail } from "@/types/iam/user"
import { useCreateUser, useUpdateUser, useUpdateUserDetail } from "@/hooks/iam/use-users"

// Form validation schemas
const createUserSchema = z.object({
    username: z
        .string()
        .min(3, "Username must be at least 3 characters")
        .max(50, "Maximum 50 characters")
        .regex(/^[a-zA-Z][a-zA-Z0-9_]*$/, "Must start with a letter, only letters, numbers, underscores"),
    email: z.string().email("Invalid email address").max(255),
    password: z.string().min(8, "Password must be at least 8 characters").max(100),
    employeeCode: z.string().min(1, "Employee code is required").max(20),
    fullName: z.string().min(1, "Full name is required").max(100),
    firstName: z.string().min(1, "First name is required").max(100),
    lastName: z.string().min(1, "Last name is required").max(100),
    phone: z.string().max(20).optional(),
    position: z.string().max(50).optional(),
    address: z.string().max(500).optional(),
    isActive: z.boolean().optional(),
})

const editUserSchema = z.object({
    // Credentials
    username: z
        .string()
        .min(3, "Username must be at least 3 characters")
        .max(50, "Maximum 50 characters")
        .regex(/^[a-zA-Z][a-zA-Z0-9_]*$/, "Must start with a letter")
        .optional(),
    email: z.string().email("Invalid email address").max(255).optional(),
    isActive: z.boolean().optional(),
    // Detail fields
    employeeCode: z.string().max(20).optional(),
    fullName: z.string().max(100).optional(),
    firstName: z.string().max(100).optional(),
    lastName: z.string().max(100).optional(),
    phone: z.string().max(20).optional(),
    position: z.string().max(50).optional(),
    address: z.string().max(500).optional(),
})

type CreateUserFormValues = z.infer<typeof createUserSchema>
type EditUserFormValues = z.infer<typeof editUserSchema>

interface UserFormDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    user?: UserWithDetail | null
    onSuccess?: () => void
}

export function UserFormDialog({
    open,
    onOpenChange,
    user,
    onSuccess,
}: UserFormDialogProps) {
    const isEditing = !!user
    const createMutation = useCreateUser()
    const updateMutation = useUpdateUser()
    const updateDetailMutation = useUpdateUserDetail()

    const createForm = useForm<CreateUserFormValues>({
        resolver: zodResolver(createUserSchema) as never,
        defaultValues: {
            username: "",
            email: "",
            password: "",
            employeeCode: "",
            fullName: "",
            firstName: "",
            lastName: "",
            phone: "",
            position: "",
            address: "",
        },
    })

    const editForm = useForm<EditUserFormValues>({
        resolver: zodResolver(editUserSchema) as never,
        defaultValues: {
            username: "",
            email: "",
            isActive: true,
            employeeCode: "",
            fullName: "",
            firstName: "",
            lastName: "",
            phone: "",
            position: "",
            address: "",
        },
    })

    useEffect(() => {
        if (open) {
            if (user) {
                editForm.reset({
                    username: user.user?.username || "",
                    email: user.user?.email || "",
                    isActive: user.user?.isActive ?? true,
                    employeeCode: user.detail?.employeeCode || "",
                    fullName: user.detail?.fullName || "",
                    firstName: user.detail?.firstName || "",
                    lastName: user.detail?.lastName || "",
                    phone: user.detail?.phone || "",
                    position: user.detail?.position || "",
                    address: user.detail?.address || "",
                })
            } else {
                createForm.reset({
                    username: "",
                    email: "",
                    password: "",
                    employeeCode: "",
                    fullName: "",
                    firstName: "",
                    lastName: "",
                    phone: "",
                    position: "",
                    address: "",
                })
            }
        }
    }, [open, user, createForm, editForm])

    const onSubmitCreate = async (values: CreateUserFormValues) => {
        try {
            await createMutation.mutateAsync({
                username: values.username,
                email: values.email,
                password: values.password,
                employeeCode: values.employeeCode,
                fullName: values.fullName,
                firstName: values.firstName,
                lastName: values.lastName,
                phone: values.phone,
                position: values.position,
                address: values.address,
                roleIds: [],
            })
            onOpenChange(false)
            onSuccess?.()
        } catch (error) {
            console.error("Failed to create user:", error)
        }
    }

    const onSubmitEdit = async (values: EditUserFormValues) => {
        if (!user?.user) return
        try {
            // Update credentials (username, email, isActive)
            await updateMutation.mutateAsync({
                id: user.user.userId,
                data: {
                    userId: user.user.userId,
                    username: values.username,
                    email: values.email,
                    isActive: values.isActive,
                },
            })

            // Update detail fields
            await updateDetailMutation.mutateAsync({
                userId: user.user.userId,
                data: {
                    employeeCode: values.employeeCode || undefined,
                    fullName: values.fullName || undefined,
                    firstName: values.firstName || undefined,
                    lastName: values.lastName || undefined,
                    phone: values.phone || undefined,
                    position: values.position || undefined,
                    address: values.address || undefined,
                },
            })

            onOpenChange(false)
            onSuccess?.()
        } catch (error) {
            console.error("Failed to update user:", error)
        }
    }

    const isPending = createMutation.isPending || updateMutation.isPending || updateDetailMutation.isPending

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{isEditing ? "Edit User" : "Create New User"}</DialogTitle>
                    <DialogDescription>
                        {isEditing
                            ? "Update user credentials and employee details."
                            : "Create a new user account with employee details."}
                    </DialogDescription>
                </DialogHeader>

                {isEditing ? (
                    <Form {...editForm}>
                        <form onSubmit={editForm.handleSubmit(onSubmitEdit)} className="space-y-4">
                            {/* Credentials Section */}
                            <div className="space-y-1">
                                <h4 className="text-sm font-medium text-muted-foreground">Account Credentials</h4>
                                <Separator />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={editForm.control}
                                    name="username"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Username</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Username" {...field} value={field.value || ""} disabled={isPending} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={editForm.control}
                                    name="email"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Email</FormLabel>
                                            <FormControl>
                                                <Input type="email" placeholder="email@example.com" {...field} value={field.value || ""} disabled={isPending} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <FormField
                                control={editForm.control}
                                name="isActive"
                                render={({ field }) => (
                                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                        <div className="space-y-0.5">
                                            <FormLabel className="text-base">Active Status</FormLabel>
                                            <FormDescription>Inactive users cannot login</FormDescription>
                                        </div>
                                        <FormControl>
                                            <Switch
                                                checked={field.value ?? true}
                                                onCheckedChange={field.onChange}
                                                disabled={isPending}
                                            />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />

                            {/* Employee Detail Section */}
                            <div className="space-y-1 pt-2">
                                <h4 className="text-sm font-medium text-muted-foreground">Employee Details</h4>
                                <Separator />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={editForm.control}
                                    name="employeeCode"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Employee Code</FormLabel>
                                            <FormControl>
                                                <Input placeholder="e.g., EMP001" {...field} value={field.value || ""} disabled={isPending} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={editForm.control}
                                    name="fullName"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Full Name</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Full name" {...field} value={field.value || ""} disabled={isPending} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={editForm.control}
                                    name="firstName"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>First Name</FormLabel>
                                            <FormControl>
                                                <Input placeholder="First name" {...field} value={field.value || ""} disabled={isPending} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={editForm.control}
                                    name="lastName"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Last Name</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Last name" {...field} value={field.value || ""} disabled={isPending} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={editForm.control}
                                    name="phone"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Phone</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Phone number" {...field} value={field.value || ""} disabled={isPending} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={editForm.control}
                                    name="position"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Position</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Job position" {...field} value={field.value || ""} disabled={isPending} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <FormField
                                control={editForm.control}
                                name="address"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Address</FormLabel>
                                        <FormControl>
                                            <Textarea placeholder="Address (optional)" {...field} value={field.value || ""} disabled={isPending} rows={2} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <DialogFooter>
                                <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={isPending}>
                                    {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Update
                                </Button>
                            </DialogFooter>
                        </form>
                    </Form>
                ) : (
                    <Form {...createForm}>
                        <form onSubmit={createForm.handleSubmit(onSubmitCreate)} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={createForm.control}
                                    name="username"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Username *</FormLabel>
                                            <FormControl>
                                                <Input placeholder="e.g., john_doe" {...field} disabled={isPending} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={createForm.control}
                                    name="email"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Email *</FormLabel>
                                            <FormControl>
                                                <Input type="email" placeholder="email@example.com" {...field} disabled={isPending} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <FormField
                                control={createForm.control}
                                name="password"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Password *</FormLabel>
                                        <FormControl>
                                            <Input type="password" placeholder="Minimum 8 characters" {...field} disabled={isPending} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={createForm.control}
                                    name="employeeCode"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Employee Code *</FormLabel>
                                            <FormControl>
                                                <Input placeholder="e.g., EMP001" {...field} disabled={isPending} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={createForm.control}
                                    name="fullName"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Full Name *</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Full name" {...field} disabled={isPending} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={createForm.control}
                                    name="firstName"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>First Name *</FormLabel>
                                            <FormControl>
                                                <Input placeholder="First name" {...field} disabled={isPending} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={createForm.control}
                                    name="lastName"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Last Name *</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Last name" {...field} disabled={isPending} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={createForm.control}
                                    name="phone"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Phone</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Phone number" {...field} value={field.value || ""} disabled={isPending} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={createForm.control}
                                    name="position"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Position</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Job position" {...field} value={field.value || ""} disabled={isPending} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <FormField
                                control={createForm.control}
                                name="address"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Address</FormLabel>
                                        <FormControl>
                                            <Textarea placeholder="Address (optional)" {...field} value={field.value || ""} disabled={isPending} rows={2} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <DialogFooter>
                                <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={isPending}>
                                    {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Create
                                </Button>
                            </DialogFooter>
                        </form>
                    </Form>
                )}
            </DialogContent>
        </Dialog>
    )
}
