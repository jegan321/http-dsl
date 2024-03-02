# HTTP DSL

## Roadmap
- Request bodies
- PRINT command
- Replace native fetch with node-fetch (need to fix commonjs bullshit)
- Environment vars. Decide on syntax, should I prefix with env? Explicit vs implicit
- Secret variables (hidden with * while typing)
- Some way to do a map() on response like $.addresses[*].city
- Make HttpClient return a success flag?
- Query params that automatically URL encode
- Support array variables that prompt the user to select from the list of options
- Generate cURL from request
- HTTP protocol versions
- Remove token limit in lexer
- Parser error handling
- Silent flag for request
- ASSERT command. Then it can be used for API smoke testing
- Support header colon being a separate token like "content-type : application/json"
- Remove Axios dependency
- Import file contents into a variable
- default content type to json?
- Refactor to make lexer get all the tokens and inject them into the parser