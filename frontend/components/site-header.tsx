"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { useCurrentUser, useLogout } from "@/lib/hooks/useAuth"
import { useToast } from "@/components/ui/use-toast"
import { useState } from "react"
import { CreateWorkspaceModal } from "@/components/modals/create-workspace-modal"
import { Loader2, Zap } from "lucide-react"

export function SiteHeader() {
  const router = useRouter()
  const { toast } = useToast()
  const { data: user, isLoading: userLoading } = useCurrentUser()
  const { mutateAsync: logout, isPending: isLogoutPending } = useLogout()
  const [createWorkspaceOpen, setCreateWorkspaceOpen] = useState(false)

  const handleLogout = async () => {
    try {
      await logout()
      router.push("/login")
      toast({
        title: "Logged out",
        description: "You have been logged out successfully.",
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Logout Error",
        description: "Something went wrong while logging out.",
      })
    }
  }

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-md animate-slideInDown">
        <nav className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            {/* Logo Section */}
            <div className="flex items-center gap-8">
              <Link href="/" className="group flex items-center gap-2 transition-all duration-300">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-accent shadow-sm group-hover:shadow-md group-hover:scale-105 transition-all duration-300">
                  <Zap className="h-5 w-5 text-primary-foreground" />
                </div>
                <span className="text-lg font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  NotesApp
                </span>
              </Link>
              
              {/* Navigation Links */}
              <div className="hidden gap-1 md:flex">
                <Link 
                  href="/" 
                  className="px-4 py-2 text-sm font-medium text-foreground/70 hover:text-primary transition-all duration-300 hover:bg-primary/5 rounded-lg"
                >
                  Public Notes
                </Link>
                {user && (
                  <Link 
                    href="/workspaces" 
                    className="px-4 py-2 text-sm font-medium text-foreground/70 hover:text-primary transition-all duration-300 hover:bg-primary/5 rounded-lg"
                  >
                    Workspaces
                  </Link>
                )}
              </div>
            </div>
            
            {/* Right Actions */}
            <div className="flex items-center gap-3">
              {userLoading ? (
                <div className="flex h-10 w-10 items-center justify-center">
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                </div>
              ) : user ? (
                <>
                  <Button 
                    variant="outline" 
                    onClick={() => setCreateWorkspaceOpen(true)}
                    className="border-primary/20 hover:border-primary/40 hover:bg-primary/5 transition-all duration-300"
                  >
                    Create Workspace
                  </Button>
                  <Button 
                    variant="ghost" 
                    onClick={handleLogout} 
                    disabled={isLogoutPending}
                    className="hover:bg-destructive/10 hover:text-destructive transition-all duration-300"
                  >
                    {isLogoutPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Logging out...
                      </>
                    ) : (
                      "Logout"
                    )}
                  </Button>
                </>
              ) : (
                <>
                  <Link href="/login">
                    <Button variant="ghost" className="hover:bg-primary/5 transition-all duration-300">
                      Sign In
                    </Button>
                  </Link>
                  <Link href="/signup">
                    <Button className="bg-gradient-to-r from-primary to-accent hover:shadow-lg hover:scale-105 transition-all duration-300">
                      Get Started
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </nav>
      </header>

      <CreateWorkspaceModal 
        open={createWorkspaceOpen} 
        onOpenChange={setCreateWorkspaceOpen} 
      />
    </>
  )
}
