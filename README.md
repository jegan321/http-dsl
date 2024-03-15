# HTTP DSL

## Roadmap
- DEFAULT HOST https://api.example.com
- Bug: response.body is not an object (it is a string) so you can't do map() on it
- Add line number to error messages
- Support multiple commands without a blank line between them
- Get symmetric stuff working as a POC
- Turn off prettier on spec files
- Parser error handling
- Replace native fetch with node-fetch (need to fix commonjs bullshit)
- Silent flag for request
- Remove Axios dependency
- Built-in helper function for loading file contents: file('./data.json')
- Refactor to make lexer get all the tokens and inject them into the parser
- IMPORT command
- Make stacktraces print during non-production mode?
- IF statement