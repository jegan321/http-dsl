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

## Commands

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