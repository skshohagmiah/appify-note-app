import Link from "next/link"
import { Button } from "@/components/ui/button"
import { UserProfile } from "@/components/pages/user-profile"

export const metadata = {
  title: "Profile - NotesApp",
  description: "Manage your profile and account settings",
}

export default function ProfilePage() {
  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-border bg-background">
        <nav className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-8">
              <Link href="/" className="flex items-center gap-2">
                <div className="h-8 w-8 rounded bg-primary-600" />
                <span className="text-xl font-semibold text-foreground">NotesApp</span>
              </Link>
              <div className="hidden gap-6 md:flex">
                <Link href="/" className="text-sm font-medium text-muted-foreground hover:text-primary-600">
                  Public Notes
                </Link>
                <Link href="/workspaces" className="text-sm font-medium text-muted-foreground hover:text-primary-600">
                  Workspaces
                </Link>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/profile">
                <Button variant="ghost">Profile</Button>
              </Link>
              <Link href="/logout">
                <Button variant="outline">Sign Out</Button>
              </Link>
            </div>
          </div>
        </nav>
      </header>

      <main className="min-h-screen bg-muted-background">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold text-foreground mb-8">Account Settings</h1>
          <UserProfile />
        </div>
      </main>
    </>
  )
}
