# HTTP DSL

## Roadmap
- Try other http client because error handling and non-json handling in axios is annoying
- Make HttpClient return a success flag?
- Environment vars. Decide on syntax, should I prefix with env? Explicit vs implicit
- Secret variables (hidden with * while typing)
- Implement lexer and parser
- Some way to do a map() on response like $.addresses[*].city
- Support array variables that prompt the user to select from the list of options
- Generate cURL from request
- HTTP versions
- Remove token limit in lexer
- Parser error handling