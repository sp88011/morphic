import { UIMessage } from 'ai'
import { Model } from '../types/models'

export interface BaseStreamConfig {
  userMessage: UIMessage
  model: Model
  chatId: string
  searchMode: boolean
}
