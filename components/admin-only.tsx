// components/admin-only.tsx
"use client"

import { ReactNode } from "react"
import { getCurrentUser } from "@/lib/auth"

interface AdminOnlyProps {
  children: ReactNode
  fallback?: ReactNode
}

export default function AdminOnly({ children, fallback = null }: AdminOnlyProps) {
  const user = getCurrentUser()
  
  if (user?.role !== 'ADMIN') {
    return <>{fallback}</>
  }
  
  return <>{children}</>
}