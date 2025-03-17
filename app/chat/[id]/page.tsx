import { Chat } from '@/components/chat'
import { getChatSupabase } from '@/lib/actions/chat'
import { getUser } from '@/lib/actions/user'
import { getModels } from '@/lib/config/models'
import { convertToUIMessages } from '@/lib/utils'

export default async function Page({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const user = await getUser({ throwIfError: false })

  // Get messages from the database
  // if user exists, then the chat may exist in the database
  const chat = user ? await getChatSupabase(id) : null

  const messages = convertToUIMessages(chat?.messages ?? [])

  console.log('server messages', messages)
  const models = await getModels()

  return <Chat id={id} models={models} savedMessages={messages} />
}
