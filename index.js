'use strict'
const dotenv = require('dotenv')
const WebSocket = require('ws')

let Events = {
    login: 0,
    db_api: 1,
    get_account_by_name: 2,
    currentRequestID: 10
}

/**
 * Based on this bit of simple https://stackoverflow.com/a/41407246
 * LATER: create or use a logging library with colors
 */
const colors = {
    reset: "\x1b[0m",
    fgRed: "\x1b[31m",
    fgGreen: "\x1b[32m",
    fgYellow: "\x1b[33m",
    fgWhite: "\x1b[37m"
}

// Print to console log using a color. Revert color after.
function log(message, color)
{
    if(typeof color === 'undefined') {
        color = colors.fgWhite
    }

    console.log(color, message, colors.reset)
}

// Print given error to console in red
function logError(error)
{
    log(error, colors.fgRed)
}

/* Let's begin */
function init()
{
    let ws = new WebSocket(process.env.RPC_NODE, {perMessageDeflate: false})
    
    // Could be something in that library that already can do this.
    // Did not see one at a glance
    ws.jsend = request => {
        ws.send(JSON.stringify(request))
    }
    
    // This promise fires sometime after/during the websocket being established
    ws.on('open', () => {
        // ws.requestID++
        
        // Not yet sure how i'll setup this flow.
        // ws.send's callback fires before ws.message does.

        // Log in
        let request = {
            id: Events.login,
            method: "call",
            params: [
                1,
                "login",
                [process.env.DEX_USER, process.env.DEX_PASS]
            ]
        }

        ws.jsend(request)

        // Request access to db api
        request = {
            id: Events.db_api,
            method: "call",
            params: [
                1,
                "database",
                []
            ]
        }
        ws.jsend(request)

        // Lookup account by name.
        if(typeof process.env.DEX_USER_ID === 'undefined') {
            request = {
                id: Events.get_account_by_name,
                method: "call",
                params: [
                    process.env.DATABASE_API_ID,
                    "get_account_by_name",
                    [
                        process.env.DEX_USER
                    ]
                ]
            }
            ws.jsend(request)
        }
    })

    ws.on('message', router)

    // Shit broke
    ws.on('error', logError)
}

function router(data)
{
    data = JSON.parse(data);
    
    switch(data.id)
    {
        case Events.login:
            if(data.result === true) {
                log("Logged in", colors.fgGreen)
            }
        break;

        case Events.db_api:
            process.env.DATABASE_API_ID = data.result
            log("Database API ID: " + process.env.DATABASE_API_ID, colors.fgGreen)
        break;
        
        case Events.get_account_by_name:
            log("Got account for: " + process.env.DEX_USER, colors.fgGreen)
            // We can extract a whole lot more data about this account here
            process.env.DEX_USER_ID = data.result.id
        break;

        default:
            log(data)
        break;
    }
}

// Load environment variables
dotenv.load()

// Start
init()