"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useAuth } from "@clerk/nextjs"
import { UserButton } from "@clerk/nextjs"
import { SiteNavigation } from "@/components/site-navigation"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useEffect, useState, useRef } from "react"
import { Bell, CheckCircle, Tag, FileText, User, X, Shield } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface Notification {
  id: string
  type: string
  title: string
  message: string
  isRead: boolean
  createdAt: string
  relatedType?: string
  relatedId?: string
}

export function Header() {
  const pathname = usePathname()
  const router = useRouter()
  const { isSignedIn, userId } = useAuth()
  const isLineagePage = pathname?.startsWith('/lineage')
  const [privacyMode, setPrivacyMode] = useState<string>('local-only')
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [notificationOpen, setNotificationOpen] = useState(false)

  useEffect(() => {
    // Load privacy mode from API
    const loadPrivacyMode = async () => {
      if (!userId) return
      try {
        const response = await fetch(`/api/privacy-settings?userId=${userId}`)
        const data = await response.json()
        setPrivacyMode(data.mode || 'local-only')
      } catch (error) {
        console.error('Failed to load privacy mode:', error)
      }
    }
    loadPrivacyMode()
  }, [userId])

  useEffect(() => {
    // Load notifications
    const loadNotifications = async () => {
      if (!userId || !isSignedIn) return
      try {
        const response = await fetch('/api/notifications')
        const data = await response.json()
        if (data.success) {
          setNotifications(data.data.notifications || [])
          setUnreadCount(data.data.unreadCount || 0)
        }
      } catch (error) {
        console.error('Failed to load notifications:', error)
      }
    }
    loadNotifications()
    
    // Refresh notifications every 30 seconds
    const interval = setInterval(loadNotifications, 30000)
    return () => clearInterval(interval)
  }, [userId, isSignedIn])

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.isRead) {
      try {
        await fetch(`/api/notifications/${notification.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ isRead: true }),
        })
        setNotifications(notifications.map(n => 
          n.id === notification.id ? { ...n, isRead: true } : n
        ))
        setUnreadCount(Math.max(0, unreadCount - 1))
      } catch (error) {
        console.error('Failed to mark notification as read:', error)
      }
    }

    // Navigate based on notification type
    if (notification.relatedType === 'content_approval' || notification.relatedType === 'content_tag') {
      router.push('/lineage/review')
    } else if (notification.relatedType === 'profile') {
      router.push('/lineage/review')
    }
    setNotificationOpen(false)
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'TAG_PENDING':
        return <Tag className="h-4 w-4" />
      case 'CONTENT_PENDING_APPROVAL':
        return <FileText className="h-4 w-4" />
      case 'PROFILE_CLAIMED':
        return <User className="h-4 w-4" />
      default:
        return <Bell className="h-4 w-4" />
    }
  }

  const getPrivacyBadge = () => {
    if (privacyMode === 'local-only') {
      return (
        <Badge variant="secondary" className="bg-green-100 text-green-700 border-green-200">
          🔒 Local
        </Badge>
      )
    } else if (privacyMode === 'cloud-with-redaction') {
      return (
        <Badge variant="secondary" className="bg-yellow-100 text-yellow-700 border-yellow-200">
          🛡️ Redacted
        </Badge>
      )
    } else {
      return (
        <Badge variant="secondary" className="bg-red-100 text-red-700 border-red-200">
          ☁️ Cloud
        </Badge>
      )
    }
  }

  return (
    <header className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-50">
      <div className="container mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          {isSignedIn && isLineagePage && getPrivacyBadge()}
          {isSignedIn && isLineagePage && (
            <>
              <Link 
                href="/lineage" 
                className={`text-sm transition-colors flex items-center gap-1 px-3 py-1.5 rounded-md ${
                  pathname === "/lineage" 
                    ? "text-[#819171] font-medium bg-[#819171]/10" 
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                }`}
              >
                Directory
              </Link>
              <Link 
                href="/lineage/admin" 
                className={`text-sm transition-colors flex items-center gap-1 px-3 py-1.5 rounded-md ${
                  pathname === "/lineage/admin" 
                    ? "text-[#819171] font-medium bg-[#819171]/10" 
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                }`}
              >
                <Shield className="h-4 w-4" />
                Admin
              </Link>
            </>
          )}
          {isSignedIn && (
            <Link 
              href="/lineage/settings" 
              className={`text-sm transition-colors px-3 py-1.5 rounded-md ${
                pathname?.startsWith("/lineage/settings") 
                  ? "text-[#819171] font-medium bg-[#819171]/10" 
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              }`}
            >
              Settings
            </Link>
          )}
        </div>
        <Link href={isLineagePage ? "/lineage" : "/"} className="text-gray-900 text-2xl tracking-wider font-light">
          {isLineagePage ? 'SOUL PATH LINEAGE' : 'SOUL PATH NUMEROLOGY'}
        </Link>
        <div className="flex items-center gap-4">
          {isSignedIn && isLineagePage && (
            <DropdownMenu open={notificationOpen} onOpenChange={setNotificationOpen}>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <Badge 
                      variant="destructive" 
                      className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                    >
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </Badge>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80">
                <DropdownMenuLabel className="flex items-center justify-between">
                  <span>Notifications</span>
                  {unreadCount > 0 && (
                    <Badge variant="secondary">{unreadCount} unread</Badge>
                  )}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {notifications.length === 0 ? (
                  <div className="px-2 py-6 text-center text-sm text-gray-500">
                    No notifications
                  </div>
                ) : (
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.slice(0, 10).map((notification) => (
                      <DropdownMenuItem
                        key={notification.id}
                        className="flex items-start gap-3 p-3 cursor-pointer"
                        onClick={() => handleNotificationClick(notification)}
                      >
                        <div className={`mt-0.5 ${notification.isRead ? 'text-gray-400' : 'text-blue-600'}`}>
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className={`text-sm font-medium ${notification.isRead ? 'text-gray-600' : 'text-gray-900'}`}>
                            {notification.title}
                          </div>
                          <div className="text-xs text-gray-500 mt-0.5 line-clamp-2">
                            {notification.message}
                          </div>
                          <div className="text-xs text-gray-400 mt-1">
                            {new Date(notification.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                        {!notification.isRead && (
                          <div className="h-2 w-2 rounded-full bg-blue-600 mt-2" />
                        )}
                      </DropdownMenuItem>
                    ))}
                  </div>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => {
                    router.push('/lineage/review')
                    setNotificationOpen(false)
                  }}
                  className="cursor-pointer"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  View All & Review
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          {isSignedIn && <UserButton afterSignOutUrl="/" />}
          <SiteNavigation />
        </div>
      </div>
    </header>
  )
}

