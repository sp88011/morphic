import { AppSidebar } from '@/components/app-sidebar'
import Footer from '@/components/footer'
import Header from '@/components/header'
import { ThemeProvider } from '@/components/theme-provider'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { Toaster } from '@/components/ui/sonner'
import { getUser } from '@/lib/actions/user'
import { db } from '@/lib/drizzle/db'
import { T_chat, T_userMeta } from '@/lib/drizzle/schema'
import { cn } from '@/lib/utils'
import { eq } from 'drizzle-orm'
import type { Metadata, Viewport } from 'next'
import { Inter as FontSans } from 'next/font/google'
import './globals.css'

const fontSans = FontSans({
  subsets: ['latin'],
  variable: '--font-sans'
})

const title = 'Morphic'
const description =
  'A fully open-source AI-powered answer engine with a generative UI.'

export const metadata: Metadata = {
  metadataBase: new URL('https://morphic.sh'),
  title,
  description,
  openGraph: {
    title,
    description
  },
  twitter: {
    title,
    description,
    card: 'summary_large_image',
    creator: '@miiura'
  }
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  minimumScale: 1,
  maximumScale: 1
}

export default async function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  const user = await getUser({ throwIfError: false })

  const userMeta = user
    ? await db.query.T_userMeta.findFirst({
        where: eq(T_userMeta.id, user.id)
      })
    : null

  const chats = user
    ? await db.query.T_chat.findMany({
        where: eq(T_chat.userId, user.id)
      })
    : []

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn('font-sans antialiased', fontSans.variable)}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <SidebarProvider>
            {userMeta && <AppSidebar chats={chats} user={userMeta} />}
            <SidebarInset>
              <Header isLoggedIn={!!userMeta} />
              {children}
              <Footer />
              <Toaster />
            </SidebarInset>
          </SidebarProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
