"use client"

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react"

interface UserProfile {
    user: {
        userId: string
        username: string
        email: string
        isActive: boolean
        isLocked: boolean
        twoFactorEnabled: boolean
        lastLoginAt: string | null
    } | null
    detail: {
        detailId: string
        userId: string
        employeeCode: string
        fullName: string
        firstName: string
        lastName: string
        phone: string | null
        profilePictureUrl: string | null
        position: string | null
        dateOfBirth: string | null
        address: string | null
        section: {
            sectionName: string
            departmentName: string
            divisionName: string
            companyName: string
        } | null
    } | null
    roleCodes: string[]
}

interface ProfileContextValue {
    profile: UserProfile | null
    loading: boolean
    error: string | null
    refetch: () => Promise<void>
}

const ProfileContext = createContext<ProfileContextValue | undefined>(undefined)

export function ProfileProvider({ children }: { children: ReactNode }) {
    const [profile, setProfile] = useState<UserProfile | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const fetchProfile = useCallback(async () => {
        try {
            setLoading(true)
            setError(null)
            const response = await fetch("/api/v1/iam/users/me")
            const data = await response.json()

            if (data.base?.isSuccess) {
                setProfile(data.data)
            } else {
                setError(data.base?.message || "Failed to load profile")
            }
        } catch (err) {
            console.error("Error fetching profile:", err)
            setError("Failed to load profile")
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchProfile()
    }, [fetchProfile])

    return (
        <ProfileContext.Provider
            value={{ profile, loading, error, refetch: fetchProfile }}
        >
            {children}
        </ProfileContext.Provider>
    )
}

export function useProfile() {
    const context = useContext(ProfileContext)
    if (context === undefined) {
        throw new Error("useProfile must be used within a ProfileProvider")
    }
    return context
}
