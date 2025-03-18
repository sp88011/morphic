import { redirect } from 'next/navigation'
import { uuidv7 } from 'uuidv7'

// Disable caching for this route
export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function Page() {
  const randomId = uuidv7()
  redirect(`/chat/${randomId}`)
}
