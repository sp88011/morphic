import { researcher } from '@/lib/agents/researcher'
import {
  convertToCoreMessages,
  createDataStreamResponse,
  DataStreamWriter,
  streamText
} from 'ai'
import { asc, eq } from 'drizzle-orm'
import { db } from '../drizzle/db'
import { T_message } from '../drizzle/schema'
import { convertToUIMessages } from '../utils'
import { getMaxAllowedTokens, truncateMessages } from '../utils/context-window'
import { isReasoningModel } from '../utils/registry'
import { handleStreamFinish } from './handle-stream-finish'
import { BaseStreamConfig } from './types'

export function createToolCallingStreamResponse(config: BaseStreamConfig) {
  return createDataStreamResponse({
    execute: async (dataStream: DataStreamWriter) => {
      const { userMessage, model, chatId, searchMode } = config
      const modelId = `${model.providerId}:${model.id}`

      try {
        //load all previous messages in chat
        const previousMessages = await db.query.T_message.findMany({
          where: eq(T_message.chatId, chatId),
          orderBy: [asc(T_message.createdAt)]
        })

        const converted = convertToUIMessages(
          previousMessages.map(m => m.message)
        )

        const messages = [...converted, userMessage]

        const coreMessages = convertToCoreMessages(messages)
        const truncatedMessages = truncateMessages(
          coreMessages,
          getMaxAllowedTokens(model)
        )

        let researcherConfig = await researcher({
          messages: truncatedMessages,
          model: modelId,
          searchMode
        })

        const result = streamText({
          ...researcherConfig,
          onFinish: async result => {
            await handleStreamFinish({
              userMessage,
              responseMessages: result.response.messages,
              //originalMessages: messages, //note that we're using `experimental_prepareRequestBody` to send only the last message so this does not include ALL original messages.
              model: modelId,
              chatId,
              dataStream,
              skipRelatedQuestions: isReasoningModel(modelId)
            })
          }
        })

        result.mergeIntoDataStream(dataStream)
      } catch (error) {
        console.error('Stream execution error:', error)
        throw error
      }
    },
    onError: error => {
      console.error('Stream error:', error)
      return error instanceof Error ? error.message : String(error)
    }
  })
}
