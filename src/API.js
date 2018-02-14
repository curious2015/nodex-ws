const log = require('./Log.js')
const Connection = require('./Connection.js')
const EventEmitter = require('events').EventEmitter

let map = new WeakMap()

/**
 * This is our main gateway api class
 * Further reading: http://docs.bitshares.org/api/access.html
 */
class API {
    constructor(node_url, options) {
        map.set(this, {
            connection: new Connection(node_url, options),
            events: new EventEmitter(),
            login_api_id: 1,
            database_api_id: undefined,
            loginRequestID: 1,
            databaseRequestID: 2
        })

        map.get(this).connection.on("message", (data) => {
            this.message(data)
        })
        map.get(this).connection.on("open", () => {
            this.emit("open")
        })
    }

    /**
     * Authenticate to the RPC server.
     * @param {string} user 
     * @param {string} password 
     */
    login(user, password) {
        // Build a login request
        let request = map.get(this).connection
            .buildRequest(
                map.get(this).login_api_id,
                map.get(this).loginRequestID,
                "login",
                [
                    user,
                    password
                ]
            )
        // send it
        map.get(this).connection.send(request)
    }

    database() {
        let request = map.get(this).connection
            .buildRequest(
                map.get(this).databaseRequestID,
                map.get(this).loginRequestID,
                "database",
                []
            )

        map.get(this).connection.send(request)
    }

    message(data) {
        data = JSON.parse(data)
        
        switch(data.id) {

            case map.get(this).loginRequestID:
                if(data.result === true) {
                    log.success("Logged in")
                } else {
                    log.error("Unable to log in")
                }
            break;

            default:
                this.emit("message", data)
            break;
        }
    }

    on(event, callback) {
        map.get(this).events.on(event, callback)
    }

    emit(event, data) {
        map.get(this).events.emit(event, data)
    }
    
    /*
    block() {}
    network_broadcast() {}
    
    history() {}
    network_node() {}
    crypto() {}
    asset() {}
    debug() {}
    enable_api() {}
    */
}

module.exports = API