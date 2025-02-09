import { type CodebaseContext } from '../../codebase-context'
import { type ContextFile } from '../../codebase-context/messages'
import { type Editor } from '../../editor'
import { type IntentDetector } from '../../intent-detector'
import { type BotResponseMultiplexer } from '../bot-response-multiplexer'
import { type Interaction } from '../transcript/interaction'

/** Tools and context recipes can use at the point they are invoked. */
export interface RecipeContext {
    editor: Editor
    intentDetector: IntentDetector
    codebaseContext: CodebaseContext
    responseMultiplexer?: BotResponseMultiplexer
    addEnhancedContext: boolean
    userInputContextFiles?: ContextFile[]
}

export type RecipeID =
    | 'chat-question'
    | 'code-question'
    | 'context-search'
    | 'local-indexed-keyword-search'
    | 'explain-code-detailed'
    | 'explain-code-high-level'
    | 'find-code-smells'
    | 'fixup'
    | 'generate-docstring'
    | 'generate-unit-test'
    | 'git-history'
    | 'improve-variable-names'
    | 'next-questions'
    | 'pr-description'
    | 'release-notes'
    | 'translate-to-language'

export enum RecipeType {
    Ask = 'ask',
    Edit = 'edit',
}

export interface Recipe {
    id: RecipeID
    title: string // Title Case
    multiplexerTopic?: string
    type?: RecipeType
    stopSequences?: string[]
    getInteraction(humanChatInput: string, context: RecipeContext): Promise<Interaction | null>
}
