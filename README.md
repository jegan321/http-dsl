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

## Usage
Install globally with npm or your preferred package manager:
```sh
npm install -g http-dsl
```

Create a file that ends in `.http` with your code and run it with the `http` command:
```
echo "PRINT Hello world" > hello.http

http hello.http
```

## Documentation
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

To POST form data, set the Content-Type header and send the parameters as JSON key/value pairs
```
POST https://jsonplaceholder.typicode.com/users
Content-Type: application/x-www-form-urlencoded
{
    "name": "Leanne Graham",
    "username": "Bret",
    "email": "Sincere@april.biz"
}
```

Create variables using the `SET` keyword
```
SET id = 1
GET /users/{{ id }}
```

Everything is a string by default. In the above example, `id` is set to the string value `"1"`. However, by using the double curly brace syntax you can use any JavaScript expression.

```
SET number = {{ 1 }}
PRINT number + 1 = {{ number + 1 }}

SET boolean = {{ true }}
PRINT boolean is not {{ !boolean }}

SET array = {{ ['one', 'two', 'three'] }}
PRINT upper case: {{ 
  array.map(element => element.toUpperCase()).join(', ') 
}}
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

You can use the `PROMPT` command to set variables from user input. The below example will print `Enter value for "name":` to the terminal. 

```
PROMPT name
PRINT Hello, {{ name }}!
```

The `WRITE` command is used to write data to a text file

```
GET /users/1

WRITE output.json {{ response.body }}
```

Comments start with `#`
```
# This is a comment
PRINT Hello!
```

## Other Names
- RequestDSL
- RequestQL
- HTTPScript
- FetchDSL
