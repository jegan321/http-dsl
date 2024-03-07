# HTTP DSL

## Roadmap
- Add line number to error messages
- IF statement
- Turn off prettier on spec files
- Parser error handling
- Catch any http client errors so the stacktrace is never printed

- Replace native fetch with node-fetch (need to fix commonjs bullshit)
- Generate cURL from request
- Silent flag for request
- Support header colon being a separate token like "content-type : application/json"
- Remove Axios dependency
- Built-in helper function for loading file contents: file('./data.json')
- Built-in helper function for base64: base64('john.egan:password1'). Maybe do one for basic auth?
- Refactor to make lexer get all the tokens and inject them into the parser
- Treat semicolons like newlines?
- REPL up arrow
- IMPORT command
- Secret variables (hidden with * while typing)
- Testing framework: ASSERT command, maybe TEST command to set up a test case, run test cases in parallel
- Support multiple commands without a blank line between them
