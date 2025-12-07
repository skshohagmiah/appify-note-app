"use client"

import * as React from "react"

interface ModernInputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const ModernInput = React.forwardRef<HTMLInputElement, ModernInputProps>(
  ({ className = "", ...props }, ref) => (
    <input
      ref={ref}
      className={`w-full rounded-lg border border-border/50 bg-muted/30 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      {...props}
    />
  ),
)
ModernInput.displayName = "ModernInput"

interface ModernButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "destructive"
  size?: "sm" | "md" | "lg"
}

const ModernButton = React.forwardRef<HTMLButtonElement, ModernButtonProps>(
  ({ className = "", variant = "primary", size = "md", ...props }, ref) => {
    const baseStyles = "font-semibold transition-all duration-300 flex items-center justify-center gap-2 rounded-lg"
    
    const sizeStyles = {
      sm: "px-3 py-2 text-xs",
      md: "px-4 py-3 text-sm",
      lg: "px-6 py-4 text-base",
    }

    const variantStyles = {
      primary: "bg-gradient-to-r from-primary to-accent text-primary-foreground shadow-lg hover:shadow-xl hover:scale-105 disabled:hover:scale-100",
      secondary: "bg-primary/10 text-primary hover:bg-primary/20 border border-primary/20",
      outline: "border border-border/50 text-foreground hover:bg-primary/5 hover:border-primary/30",
      ghost: "text-foreground hover:bg-primary/5",
      destructive: "bg-destructive/10 text-destructive hover:bg-destructive/20 border border-destructive/20",
    }

    return (
      <button
        ref={ref}
        className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
        {...props}
      />
    )
  },
)
ModernButton.displayName = "ModernButton"

export { ModernInput, ModernButton }
