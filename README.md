# HTTP DSL

## Roadmap
- Bug: response.body is not an object (it is a string) so you can't do map() on it
- Support multiple commands without a blank line between them
- Get symmetric stuff working as a POC
- Turn off prettier on spec files
- Replace native fetch with node-fetch (need to fix commonjs bullshit)
- Config flags for requests. --print, --write, etc
- Remove Axios dependency
- Built-in helper function for loading file contents: file('./data.json', { parse: false })
- Refactor to make lexer get all the tokens and inject them into the parser
- IMPORT command and EXPORT command
- IF statement

