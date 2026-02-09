// Auth type re-exports and additional types
// Provides convenient imports for auth-related types

// Re-export generated types from proto
export type {
    LoginRequest,
    LoginResponse,
    LoginData,
    AuthUser,
    LogoutRequest,
    LogoutResponse,
    RefreshTokenRequest,
    RefreshTokenResponse,
    TokenPair,
    ForgotPasswordRequest,
    ForgotPasswordResponse,
    VerifyResetOTPRequest,
    VerifyResetOTPResponse,
    ResetPasswordRequest,
    ResetPasswordResponse,
    UpdatePasswordRequest,
    UpdatePasswordResponse,
    Enable2FARequest,
    Enable2FAResponse,
    TwoFactorSetup,
    Verify2FARequest,
    Verify2FAResponse,
    Disable2FARequest,
    Disable2FAResponse,
    GetCurrentUserRequest,
    GetCurrentUserResponse,
} from "@/types/generated/iam/v1/auth"

// Additional client-side types

/**
 * Login form values (client-side)
 */
export interface LoginFormValues {
    username: string
    password: string
    totpCode?: string
    rememberMe?: boolean
}

/**
 * Forgot password form values
 */
export interface ForgotPasswordFormValues {
    email: string
}

/**
 * OTP verification form values
 */
export interface VerifyOTPFormValues {
    email: string
    otpCode: string
}

/**
 * Reset password form values
 */
export interface ResetPasswordFormValues {
    resetToken: string
    newPassword: string
    confirmPassword: string
}

/**
 * Update password form values
 */
export interface UpdatePasswordFormValues {
    currentPassword: string
    newPassword: string
    confirmPassword: string
}

/**
 * Auth context state
 */
export interface AuthState {
    user: import("@/types/generated/iam/v1/auth").AuthUser | null
    isAuthenticated: boolean
    isLoading: boolean
    error: string | null
}

/**
 * Auth context value (includes methods)
 */
export interface AuthContextValue extends AuthState {
    login: (credentials: LoginFormValues) => Promise<LoginResult>
    logout: () => Promise<void>
    refreshSession: () => Promise<boolean>
    clearError: () => void
}

/**
 * Login result
 */
export interface LoginResult {
    success: boolean
    requires2fa: boolean
    error?: string
}

/**
 * Client-side user info (safe to store in state)
 */
export interface ClientUser {
    userId: string
    username: string
    email: string
    fullName: string
    profilePictureUrl: string
    roles: string[]
    permissions: string[]
    twoFactorEnabled: boolean
}
