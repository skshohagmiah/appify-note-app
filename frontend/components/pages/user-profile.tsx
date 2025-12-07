"use client"

import { useState } from "react"
import { useCurrentUser } from "@/lib/hooks/useAuth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { AlertCircle } from "lucide-react"

export function UserProfile() {
  const { data: user, isLoading, error } = useCurrentUser()
  const [isEditing, setIsEditing] = useState(false)
  const [firstName, setFirstName] = useState(user?.firstName || "")
  const [lastName, setLastName] = useState(user?.lastName || "")

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-32" />
        <Skeleton className="h-32" />
      </div>
    )
  }

  if (error || !user) {
    return (
      <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 flex items-center gap-3">
        <AlertCircle className="h-5 w-5 text-destructive" />
        <div>
          <h3 className="font-semibold text-destructive">Error loading profile</h3>
          <p className="text-sm text-destructive/80">
            {error instanceof Error ? error.message : "Something went wrong"}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
          <CardDescription>Your account details and personal information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">First Name</label>
              <Input value={firstName} onChange={(e) => setFirstName(e.target.value)} disabled={!isEditing} />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Last Name</label>
              <Input value={lastName} onChange={(e) => setLastName(e.target.value)} disabled={!isEditing} />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Email</label>
            <Input value={user.email} disabled />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Role</label>
            <Input value={user.role} disabled />
          </div>

          <div className="flex gap-3 pt-4">
            {!isEditing ? (
              <Button onClick={() => setIsEditing(true)}>Edit Profile</Button>
            ) : (
              <>
                <Button onClick={() => setIsEditing(false)}>Save Changes</Button>
                <Button variant="outline" onClick={() => setIsEditing(false)}>
                  Cancel
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Account Settings</CardTitle>
          <CardDescription>Manage your account preferences and security</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button variant="outline" className="w-full justify-start bg-transparent">
            Change Password
          </Button>
          <Button variant="outline" className="w-full justify-start bg-transparent">
            Two-Factor Authentication
          </Button>
          <Button
            variant="outline"
            className="w-full justify-start text-destructive hover:text-destructive bg-transparent"
          >
            Delete Account
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
