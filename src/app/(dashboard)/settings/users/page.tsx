import { redirect } from "next/navigation"

// Route moved to /administrator/users
export default function UsersPageRedirect() {
    redirect("/administrator/users")
}
