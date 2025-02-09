import { Interaction } from '@sourcegraph/cody-shared/src/chat/transcript/interaction'
import { type CodebaseContext } from '@sourcegraph/cody-shared/src/codebase-context'
import { type ContextMessage } from '@sourcegraph/cody-shared/src/codebase-context/messages'
import { type IntentDetector } from '@sourcegraph/cody-shared/src/intent-detector'
import { MAX_HUMAN_INPUT_TOKENS } from '@sourcegraph/cody-shared/src/prompt/constants'
import { truncateText } from '@sourcegraph/cody-shared/src/prompt/truncation'
import { type Message } from '@sourcegraph/cody-shared/src/sourcegraph-api'

async function getContextMessages(
    text: string,
    intentDetector: Pick<IntentDetector, 'isCodebaseContextRequired'>,
    codebaseContext: Pick<CodebaseContext, 'getContextMessages'>
): Promise<ContextMessage[]> {
    const contextMessages: ContextMessage[] = []

    const isCodebaseContextRequired = await intentDetector.isCodebaseContextRequired(text)

    if (isCodebaseContextRequired) {
        const codebaseContextMessages = await codebaseContext.getContextMessages(text, {
            numCodeResults: 8,
            numTextResults: 2,
        })

        contextMessages.push(...codebaseContextMessages)
    }

    return contextMessages
}

export async function interactionFromMessage(
    message: Message,
    intentDetector: Pick<IntentDetector, 'isCodebaseContextRequired'>,
    codebaseContext: Pick<CodebaseContext, 'getContextMessages'> | null
): Promise<Interaction | null> {
    if (!message.text) {
        return Promise.resolve(null)
    }

    const text = truncateText(message.text, MAX_HUMAN_INPUT_TOKENS)

    const contextMessages =
        codebaseContext === null ? Promise.resolve([]) : getContextMessages(text, intentDetector, codebaseContext)

    return Promise.resolve(
        new Interaction(
            { speaker: 'human', text, displayText: text },
            { speaker: 'assistant', text: '', displayText: '' },
            contextMessages,
            []
        )
    )
}
