# HTTP DSL

## Roadmap
- Bug: Entire URL cannot be an expression. Lexer bug probably
- Test duplicate query params
- Remove token limit in lexer
- default content type to json. Add function to header util to check if content type exists
- Replace native fetch with node-fetch (need to fix commonjs bullshit)
- Environment vars. Decide on syntax, should I prefix with env? Explicit vs implicit
- Secret variables (hidden with * while typing)
- Make HttpClient return a success flag?
- Support array variables that prompt the user to select from the list of options
- Generate cURL from request
- HTTP protocol versions
- Parser error handling
- Silent flag for request
- ASSERT command. Then it can be used for API smoke testing
- Support header colon being a separate token like "content-type : application/json"
- Remove Axios dependency
- Built-in helper function for loading file contents: file('./data.json')
- Built-in helper function for base64: base64('john.egan:password1'). Maybe do one for basic auth?
- Refactor to make lexer get all the tokens and inject them into the parser
- Catch any http client errors so the stacktrace is never printed
- Treat semicolons like newlines?
- JS transpiler
- Turn off prettier on spec files
- REPL up arrow
- Add line number to error messages
- IMPORT command
