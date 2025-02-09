import { type Polly } from '@pollyjs/core'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

import { SourcegraphNodeCompletionsClient } from '@sourcegraph/cody-shared/src/sourcegraph-api/completions/nodeClient'

import { startPollyRecording } from '../testutils/polly'

import { expandQuery } from './symf'

describe('symf', () => {
    const client = new SourcegraphNodeCompletionsClient({
        accessToken: process.env.SRC_ACCESS_TOKEN ?? 'invalid',
        serverEndpoint: process.env.SRC_ENDPOINT ?? 'https://sourcegraph.com',
        customHeaders: {},
        debugEnable: true,
    })

    describe('expand-query', () => {
        let polly: Polly
        beforeAll(() => {
            polly = startPollyRecording({ recordingName: 'symf' })
        })

        function check(query: string, expectedHandler: (expandedTerm: string) => void): void {
            it(query, async () => {
                expectedHandler(await expandQuery(client, query))
            })
        }

        check('ocean', expanded =>
            expect(expanded).toMatchInlineSnapshot(
                '"current flow ocean salinity salt saltiness sea stream surf tidal tide water wave waves"'
            )
        )

        check('How do I write a file to disk in Go', expanded =>
            expect(expanded).toMatchInlineSnapshot(
                '"disk file files go golang harddrive storage write writefile writetofile"'
            )
        )

        check('Where is authentication router defined?', expanded =>
            expect(expanded).toMatchInlineSnapshot(
                '"auth authenticate authentication define defined definition route router routing"'
            )
        )

        check('parse file with tree-sitter', expanded =>
            expect(expanded).toMatchInlineSnapshot('"file files parser parsing sitter tree tree-sitter ts"')
        )

        check('scan tokens in C++', expanded =>
            expect(expanded).toMatchInlineSnapshot(
                '"c cin f getline in scan scan_f scanf stream string stringstream token tokenization tokenize tokens"'
            )
        )
        afterAll(async () => {
            await polly.stop()
        })
    })
})
