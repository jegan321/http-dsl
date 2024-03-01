# HTTP DSL

## Roadmap
- PRINT command
- Environment vars. Decide on syntax, should I prefix with env? Explicit vs implicit
- Secret variables (hidden with * while typing)
- Some way to do a map() on response like $.addresses[*].city

- Make HttpClient return a success flag?
- Support array variables that prompt the user to select from the list of options
- Generate cURL from request
- HTTP protocol versions
- Remove token limit in lexer
- Parser error handling
- Silent flag for request
- ASSERT command. Then it can be used for API smoke testing
- Support header colon being a separate token like "content-type : application/json"
- Remove Axios dependency
