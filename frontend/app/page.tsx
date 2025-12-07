"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { PublicNotesDirectoryEnhanced } from "@/components/pages/public-notes-directory-enhanced"
import { SiteHeader } from "@/components/site-header"

export default function Home() {
  return (
    <>
      <SiteHeader />

      <main className="min-h-screen">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <PublicNotesDirectoryEnhanced />
        </div>
      </main>
    </>
  )
}
