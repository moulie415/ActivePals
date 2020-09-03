export default jest.mock('rn-fetch-blob', () => {
  return {
    fs: {
      dirs: {
        DocumentDir: ''
      },
      writeFile: () => Promise.resolve()
    }
  }
})