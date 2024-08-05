export const mockConsoleLog = () => {
  let originalConsoleLog: Console['log']

  beforeAll(() => {
    originalConsoleLog = console.log
    console.log = jest.fn()
  })

  afterAll(() => {
    console.log = originalConsoleLog
  })
}
