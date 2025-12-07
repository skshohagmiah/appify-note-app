import Link from "next/link"
import { LoginForm } from "@/components/auth/login-form"
import { Zap } from "lucide-react"

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-background via-muted/30 to-background px-4 relative overflow-hidden">
      {/* Decorative blurred circles */}
      <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl opacity-20" />
      <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-accent/10 rounded-full blur-3xl opacity-20" />

      <div className="w-full max-w-md space-y-8 relative z-10 animate-slideInUp">
        {/* Logo and Header */}
        <div className="text-center space-y-4">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent shadow-lg">
            <Zap className="h-7 w-7 text-primary-foreground" />
          </div>
          <div className="space-y-2">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Welcome Back
            </h1>
            <p className="text-muted-foreground">Share your ideas and discover notes from the community</p>
          </div>
        </div>

        {/* Form Card */}
        <div className="rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm p-8 shadow-lg">
          <LoginForm />
        </div>

        {/* Sign up Link */}
        <p className="text-center text-sm text-muted-foreground">
          Don't have an account?{" "}
          <Link href="/signup" className="font-semibold text-primary hover:text-accent transition-colors">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  )
}
