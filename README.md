# HTTP DSL

A simple scripting language for sending HTTP requests.

```
POST https://jsonplaceholder.typicode.com/todos
Content-Type: application/json
{
    "userId": 1,
    "title": "Walk the dogs",
    "completed": false
}

PRINT {{response}}
```

## Goals
- Easy to read and understand, even for someone who has never seen the syntax before
- Enables you to quickly test an API or create automated tests for regression testing

## Features
- Send HTTP requests using language primitives instead of an SDK or third party library
- Dynamic requests using variables and JavaScript expressions
- Easily create automated tests with the ASSERT command
- VSCode extension with syntax highlighting and shortcuts
- Read/write JSON files

## Sending HTTP Requests
The language is built around sending HTTP requests. The syntax is inspired by the HTTP protocol itself.

HTTP Protocol:
```
GET /users HTTP/1.1
Host: jsonplaceholder.typicode.com
Accept: application/json
```

Language syntax:
```
GET https://jsonplaceholder.typicode.com/users
Accept: application/json
```

## Other Commands

### Print
Prints to the console.
```
PRINT Hello, world!
```

### SET
Sets the value of a variable and creates the variable if it doesn't exist already.
```
SET name = John
```

### PROMPT
Prompts the user in the terminal for the value of a variable.
```
PROMPT password
```