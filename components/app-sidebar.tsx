'use client'

import { NavChats } from '@/components/nav-chats'
import { NavUser } from '@/components/nav-user'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail
} from '@/components/ui/sidebar'
import { T_chat, T_userMeta } from '@/lib/drizzle/schema'
import * as React from 'react'

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  chats: (typeof T_chat.$inferSelect)[]
  user: typeof T_userMeta.$inferSelect
}

export function AppSidebar({ chats, user, ...props }: AppSidebarProps) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>Logo</SidebarHeader>
      <SidebarContent>
        <NavChats chats={chats} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
