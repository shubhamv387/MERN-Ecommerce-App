import { Config } from '@jest/types'

const config: Config.InitialOptions = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  verbose: true,
  forceExit: true,
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true,

  collectCoverage: true,
  collectCoverageFrom: ['src/**/*.{ts,js}', '!vendor/**/*.{js,ts}', '!**/node_modules/**'],
  coverageProvider: 'v8',
  coverageThreshold: {
    global: {
      branches: 100,
      functions: 100,
      lines: 100,
      statements: 100,
    },
  },
  maxConcurrency: 5,
}

export default config
