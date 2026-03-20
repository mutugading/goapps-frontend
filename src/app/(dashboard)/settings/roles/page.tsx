import { redirect } from "next/navigation"

// Route moved to /administrator/roles
export default function RolesPageRedirect() {
    redirect("/administrator/roles")
}
