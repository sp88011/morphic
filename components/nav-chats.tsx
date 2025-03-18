'use client'

import { Folder, MoreHorizontal, Plus, Trash2 } from 'lucide-react'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar
} from '@/components/ui/sidebar'
import { deleteChat } from '@/lib/actions/chat'
import { type T_chat } from '@/lib/drizzle/schema'
import Link from 'next/link'
import { Button } from './ui/button'

export function NavChats({ chats }: { chats: (typeof T_chat.$inferSelect)[] }) {
  const { isMobile } = useSidebar()

  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <Link href="/chat/new">
        <SidebarGroupLabel asChild>
          <Button
            variant="ghost"
            size="icon"
            className="flex justify-between w-full"
          >
            Chats
            <Plus />
          </Button>
        </SidebarGroupLabel>
      </Link>
      <SidebarMenu>
        {chats.map(item => (
          <SidebarMenuItem key={item.id}>
            <SidebarMenuButton size="sm">
              <Link href={`/chat/${item.id}`}>
                <span className="line-clamp-1">{item.title}</span>
              </Link>
            </SidebarMenuButton>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuAction showOnHover>
                  <MoreHorizontal />
                  <span className="sr-only">More</span>
                </SidebarMenuAction>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-28 min-w-0 rounded-lg"
                side={isMobile ? 'bottom' : 'right'}
                align={isMobile ? 'end' : 'start'}
              >
                <DropdownMenuItem className="gap-2">
                  <Folder className="text-muted-foreground w-4 h-4" />
                  <span>Share</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="gap-2"
                  onSelect={() => {
                    deleteChat(item.id)
                  }}
                >
                  <Trash2 className="text-muted-foreground w-4 h-4" />
                  <span>Delete</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  )
}
