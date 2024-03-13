# HTTP DSL

## Roadmap
- Write tests for PRINT on its own (just newline)
- DEFAULT HOST https://api.example.com
- Bug: response.body is not an object (it is a string) so you can't do map() on it
- Add line number to error messages
- IF statement
- Get symmetric stuff working as a POC
- Turn off prettier on spec files
- Parser error handling
- Replace native fetch with node-fetch (need to fix commonjs bullshit)
- Silent flag for request
- Support header colon being a separate token like "content-type : application/json"
- Remove Axios dependency
- Built-in helper function for loading file contents: file('./data.json')
- Built-in helper function for base64: base64('john.egan:password1'). Maybe do one for basic auth?
- Refactor to make lexer get all the tokens and inject them into the parser
- IMPORT command
- Testing framework: ASSERT command, maybe TEST command to set up a test case, run test cases in parallel
- Support multiple commands without a blank line between them
- Make stacktraces print during non-production mode?