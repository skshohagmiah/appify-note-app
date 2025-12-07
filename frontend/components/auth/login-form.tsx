"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { useLogin } from "@/lib/hooks/useAuth"
import { Eye, EyeOff, Loader2 } from "lucide-react"

export function LoginForm() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")

  const loginMutation = useLogin()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    try {
      await loginMutation.mutateAsync({ email, password })
      // Wait for token to be persisted and verify it's available
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // Verify token is actually stored
      const token = localStorage.getItem("authToken")
      if (!token) {
        throw new Error("Authentication token not stored properly")
      }
      
      router.push("/workspaces")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed. Please try again.")
      console.error("[v0] Login error:", err)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 flex items-start gap-3 animate-slideInUp">
          <div className="mt-0.5 h-5 w-5 rounded-full bg-destructive/20 flex items-center justify-center flex-shrink-0">
            <span className="text-xs font-bold text-destructive">!</span>
          </div>
          <p className="text-sm text-destructive font-medium">{error}</p>
        </div>
      )}

      <div className="space-y-2">
        <label className="block text-sm font-semibold text-foreground">Email address</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          required
          disabled={loginMutation.isPending}
          className="w-full rounded-lg border border-border/50 bg-muted/30 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 disabled:opacity-50 disabled:cursor-not-allowed"
        />
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-semibold text-foreground">Password</label>
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            required
            disabled={loginMutation.isPending}
            className="w-full rounded-lg border border-border/50 bg-muted/30 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 disabled:opacity-50 disabled:cursor-not-allowed"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1"
            tabIndex={-1}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>

      <button
        type="submit"
        disabled={loginMutation.isPending}
        className="w-full rounded-lg bg-gradient-to-r from-primary to-accent px-4 py-3 text-sm font-semibold text-primary-foreground shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-lg"
      >
        {loginMutation.isPending ? (
          <span className="flex items-center justify-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            Signing in...
          </span>
        ) : (
          "Sign in"
        )}
      </button>
    </form>
  )
}
