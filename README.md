# HTTP DSL

## Roadmap
- Comments
- Replace the Command type with just token type
- Query params that automatically URL encode
- IMPORT command
- Remove token limit in lexer
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
- Import file contents into a variable
- default content type to json?
- Refactor to make lexer get all the tokens and inject them into the parser
- Catch any http client errors so the stacktrace is never printed
- Treat semicolons like newlines?
- JS transpiler
- Turn off prettier on spec files
- Built-in helper function for basic auth
- REPL up arrow
- Add line number to error messages
