'use server'

import { getRedisClient, RedisWrapper } from '@/lib/redis/config'
import { ExtendedCoreMessage, SupabaseChat, type Chat } from '@/lib/types'
import { openai } from '@ai-sdk/openai'
import { generateObject } from 'ai'
import { and, asc, eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import { db } from '../drizzle/db'
import { T_chat, T_message } from '../drizzle/schema'
import { getUser } from './user'

async function getRedis(): Promise<RedisWrapper> {
  return await getRedisClient()
}

const CHAT_VERSION = 'v2'
function getUserChatKey(userId: string) {
  return `user:${CHAT_VERSION}:chat:${userId}`
}

export async function getChats(userId?: string | null) {
  if (!userId) {
    return []
  }

  try {
    const redis = await getRedis()
    const chats = await redis.zrange(getUserChatKey(userId), 0, -1, {
      rev: true
    })

    if (chats.length === 0) {
      return []
    }

    const results = await Promise.all(
      chats.map(async chatKey => {
        const chat = await redis.hgetall(chatKey)
        return chat
      })
    )

    return results
      .filter((result): result is Record<string, any> => {
        if (result === null || Object.keys(result).length === 0) {
          return false
        }
        return true
      })
      .map(chat => {
        const plainChat = { ...chat }
        if (typeof plainChat.messages === 'string') {
          try {
            plainChat.messages = JSON.parse(plainChat.messages)
          } catch (error) {
            plainChat.messages = []
          }
        }
        if (plainChat.createdAt && !(plainChat.createdAt instanceof Date)) {
          plainChat.createdAt = new Date(plainChat.createdAt)
        }
        return plainChat as Chat
      })
  } catch (error) {
    return []
  }
}

export async function getChat(id: string, userId: string = 'anonymous') {
  const redis = await getRedis()
  const chat = await redis.hgetall<Chat>(`chat:${id}`)

  if (!chat) {
    return null
  }

  // Parse the messages if they're stored as a string
  if (typeof chat.messages === 'string') {
    try {
      chat.messages = JSON.parse(chat.messages)
    } catch (error) {
      chat.messages = []
    }
  }

  // Ensure messages is always an array
  if (!Array.isArray(chat.messages)) {
    chat.messages = []
  }

  return chat
}

export async function clearChats(
  userId: string = 'anonymous'
): Promise<{ error?: string }> {
  const redis = await getRedis()
  const userChatKey = getUserChatKey(userId)
  const chats = await redis.zrange(userChatKey, 0, -1)
  if (!chats.length) {
    return { error: 'No chats to clear' }
  }
  const pipeline = redis.pipeline()

  for (const chat of chats) {
    pipeline.del(chat)
    pipeline.zrem(userChatKey, chat)
  }

  await pipeline.exec()

  revalidatePath('/')
  redirect('/')
}

export async function saveChat(chat: Chat, userId: string = 'anonymous') {
  try {
    const redis = await getRedis()
    const pipeline = redis.pipeline()

    const chatToSave = {
      ...chat,
      messages: JSON.stringify(chat.messages)
    }

    pipeline.hmset(`chat:${chat.id}`, chatToSave)
    pipeline.zadd(getUserChatKey(userId), Date.now(), `chat:${chat.id}`)

    const results = await pipeline.exec()

    return results
  } catch (error) {
    throw error
  }
}

export async function getSharedChat(id: string) {
  const redis = await getRedis()
  const chat = await redis.hgetall<Chat>(`chat:${id}`)

  if (!chat || !chat.sharePath) {
    return null
  }

  return chat
}

export async function shareChat(id: string, userId: string = 'anonymous') {
  const redis = await getRedis()
  const chat = await redis.hgetall<Chat>(`chat:${id}`)

  if (!chat || chat.userId !== userId) {
    return null
  }

  const payload = {
    ...chat,
    sharePath: `/share/${id}`
  }

  await redis.hmset(`chat:${id}`, payload)

  return payload
}

//--------------------------------
// Using Supabase for storage
//--------------------------------
export async function saveChatSupabase(chat: SupabaseChat) {
  try {
    const user = await getUser({ throwIfError: true })

    //if chat exists, make sure current user can access it
    const existingChat = await db.query.T_chat.findFirst({
      where: eq(T_chat.id, chat.id),
      columns: {
        userId: true
      }
    })

    if (!existingChat) {
      //create chat in DB

      let title = 'New chat'
      try {
        const { object } = await generateObject({
          model: openai('gpt-4o-mini'),
          schema: z.object({
            title: z
              .string()
              .describe(
                'A short title for the chat, no more than 100 characters'
              )
          }),
          prompt: `Generate a precise title that summarizes the topic for a chat started with this message: ${JSON.stringify(
            chat.messages[0]
          )}`
        })
        title = object.title
      } catch (e) {}

      await db.insert(T_chat).values({
        id: chat.id,
        userId: user.id,
        title
      })
    }

    //save messages to DB
    for (const message of chat.messages) {
      await db.insert(T_message).values({
        chatId: chat.id,
        message: message
      })
    }
  } catch (error) {
    throw error
  }
}

export async function getChatSupabase(id: string) {
  const chat = await db.query.T_chat.findFirst({
    where: eq(T_chat.id, id),
    with: { messages: { orderBy: [asc(T_message.createdAt)] } }
  })

  if (!chat) return null

  // Extract just the message content from each message record
  return {
    ...chat,
    messages: chat.messages.map(x => x.message) as ExtendedCoreMessage[]
  }
}

export async function deleteChat(id: string) {
  const user = await getUser({ throwIfError: true })

  await db
    .delete(T_chat)
    .where(and(eq(T_chat.id, id), eq(T_chat.userId, user.id)))

  revalidatePath('/')
}
