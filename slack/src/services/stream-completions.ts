import { ANSWER_TOKENS } from '@sourcegraph/cody-shared/src/prompt/constants'
import { SourcegraphNodeCompletionsClient } from '@sourcegraph/cody-shared/src/sourcegraph-api/completions/nodeClient'
import {
    type CompletionCallbacks,
    type CompletionParameters,
    type Message,
} from '@sourcegraph/cody-shared/src/sourcegraph-api/completions/types'

import { DEFAULT_APP_SETTINGS, ENVIRONMENT_CONFIG } from '../constants'

import { OpenAICompletionsClient } from './openai-completions-client'

const { SOURCEGRAPH_ACCESS_TOKEN } = ENVIRONMENT_CONFIG

const DEFAULT_CHAT_COMPLETION_PARAMETERS: Omit<CompletionParameters, 'messages'> = {
    temperature: 0.2,
    maxTokensToSample: ANSWER_TOKENS,
    topK: -1,
    topP: -1,
}

const completionsClient = getCompletionsClient()

export function streamCompletions(messages: Message[], cb: CompletionCallbacks) {
    return completionsClient.stream({ messages, ...DEFAULT_CHAT_COMPLETION_PARAMETERS }, cb)
}

function getCompletionsClient() {
    const { OPENAI_API_KEY } = process.env

    if (OPENAI_API_KEY) {
        return new OpenAICompletionsClient(OPENAI_API_KEY)
    }

    return new SourcegraphNodeCompletionsClient({
        serverEndpoint: DEFAULT_APP_SETTINGS.serverEndpoint,
        accessToken: SOURCEGRAPH_ACCESS_TOKEN,
        debugEnable: DEFAULT_APP_SETTINGS.debug === 'development',
        customHeaders: {},
    })
}
