import type { Config } from '@jest/types'

const config: Config.InitialOptions = {
    transform: {
        '^.+\\.tsx?$': 'ts-jest',
    },
    verbose: true,
    setupFilesAfterEnv: ['<rootDir>/__test__/setup.ts'],
    globals: {
        'ts-jest': {
            diagnostics: false,
        },
    },
}

export default config
