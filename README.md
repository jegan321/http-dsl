# HTTP DSL

## Roadmap
- Automatically use a variable called host if the url starts with /. See next line:
- SET host = https://example.com; GET /users
- Change curly braces to be JS expressions
- PRINT command
- IMPORT command
- Remove token limit in lexer
- Check for open square bracket when lexing multi-line strings (arrays)
- Replace native fetch with node-fetch (need to fix commonjs bullshit)
- Environment vars. Decide on syntax, should I prefix with env? Explicit vs implicit
- Secret variables (hidden with * while typing)
- Make HttpClient return a success flag?
- Query params that automatically URL encode
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

