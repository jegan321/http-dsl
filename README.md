# FetchDSL

A simple scripting language for sending HTTP requests.

```
POST https://jsonplaceholder.typicode.com/todos
Content-Type: application/json
{
    "userId": 1,
    "title": "Walk the dogs",
    "completed": false
}

PRINT {{ response.body }}
```

## Goals
- Easy to read and understand, even for someone who has never seen the syntax before
- Enables you to quickly use an API or create automated regression tests

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

Send a POST request with a body by writing the JSON followed by a blank line:

```
POST https://jsonplaceholder.typicode.com/users
Content-Type: application/json
{
    "name": "Leanne Graham",
    "username": "Bret",
    "email": "Sincere@april.biz"
}

PRINT Created user!
```

GET, POST, PUT, DELETE, PATCH and OPTIONS are supported.
```
PATCH https://jsonplaceholder.typicode.com/users/1
Content-Type: application/json
{
    "email": "Sincere1@april.biz"
}

PRINT Updated user email!
```

The `Content-Type` header is optional if you want to send `application/json`
```
POST https://jsonplaceholder.typicode.com/users
{
    "name": "Leanne Graham",
    "username": "Bret",
    "email": "Sincere@april.biz"
}

```

You can change the default value for `Content-Type` or any other header
```
DEFAULT HEADER Content-Type = application/json
DEFAULT HEADER Accept = */*
```

You can also set a default host
```
DEFAULT HOST https://jsonplaceholder.typicode.com

GET /users/1

PRINT User 1: {{ response.body.username}}

GET /users/2

PRINT User 2: {{ response.body.username}}
```

Create variables using the `SET` keyword
```
SET id = 3
GET /users/{{ id }}
```

By default, everything is a string. In the above example `id` is set to the string value `"2"`. However, by using the double curly brace syntax (`{{foo}}`) you can use any JavaScript expression.

```
SET number = {{ 1 }}
PRINT number + 1 = {{ number + 1 }}

SET boolean = {{ true }}
PRINT boolean is not {{ !boolean }}

SET array = {{ ['one', 'two', 'three'] }}
PRINT array length is {{ array.length }}
```

```
GET /users

PRINT User's names: {{ response.body.map(u => u.name).join(', ')}}
```

The variable `request` will always contain information about the most recent request. Same for the `response` variable.

```
POST /comments
{
    "postId": 1,
    "body": "Hello, world!"
}

PRINT {{ request }}
PRINT {{ response }}
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

## Other Names
- RequestDSL
- RequestQL
- HTTPScript
- FetchDSL
