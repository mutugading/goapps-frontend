/**
 * Site configuration
 * Central place for site-wide settings
 */
export const siteConfig = {
  name: "Go Apps",
  tagline: "Enterprise Platform",
  description: "A unified semi-ERP platform for modern manufacturing — Finance, HR, IT, and Operations.",
  version: "0.1.0",
  url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",

  // Default metadata
  metadata: {
    title: {
      default: "Go Apps - Enterprise Platform",
      template: "%s | Go Apps", // For other pages: "Page Name | Go Apps"
    },
    description: "A unified semi-ERP platform for modern manufacturing.",
    keywords: ["enterprise", "dashboard", "microservices", "go", "golang"],
  },

  // Logo paths
  logo: {
    default: "/logo.png",
    icon: "/logo.png",
  },

  // Organization info (for future use)
  organization: {
    name: "PT Mutu Gading Tekstil",
    shortName: "MGT",
  },
}

/**
 * Generate page metadata
 * Use this in page.tsx files to set dynamic titles
 *
 * @example
 * // In page.tsx
 * export const metadata = generateMetadata("Unit of Measure")
 * // Result: title = "Unit of Measure | Go Apps"
 *
 * @example
 * // For dashboard (use full tagline)
 * export const metadata = generateMetadata("Dashboard", true)
 * // Result: title = "Go Apps - Enterprise Dashboard"
 */
export function generateMetadata(
  pageTitle: string,
  isHomePage: boolean = false
): { title: string; description?: string } {
  if (isHomePage) {
    return {
      title: `${siteConfig.name} - ${siteConfig.tagline}`,
      description: siteConfig.description,
    }
  }

  return {
    title: pageTitle, // Next.js will use template: "Page Name | Go Apps"
  }
}
