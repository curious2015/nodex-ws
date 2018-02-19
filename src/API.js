const log = require('./Log.js')
const Connection = require('./Connection.js')
const Database = require('./Database.js')
const Wallet = require('./Wallet.js')
const DataStore = require('./DataStore.js')
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
            database: undefined,
            
            loginRequestID: 1,
            databaseRequestID: 2,
            
        })

        map.get(this).connection.on("message", (data) => {
            this.message(data)
        })
        map.get(this).connection.on("open", () => {
            this.emit("open")
        })

        map.get(this).storage = new DataStore(map.get(this).events)
    }

    /**
     * Authenticate to the RPC server.
     * @param {string} user 
     * @param {string} password 
     */
    login(user, password) {
        map.get(this).connection.request(
            map.get(this).login_api_id,
            map.get(this).loginRequestID,
            "login",
            [
                user,
                password
            ]
        )
    }

    /**
     * Return instance of Database API or false
     */
    get database_api() {
        let db = map.get(this).database
        
        if(typeof db !== 'undefined') {
            return db
        }

        log.error("Database API has not been initialized with call to API.database()")
        return false
    }

    database() {
        map.get(this).connection.request(
            map.get(this).login_api_id,
            map.get(this).databaseRequestID,
            "database",
            []
        )
    }

    message(data) {
        data = JSON.parse(data)
        
        switch(data.id) {

            case map.get(this).loginRequestID:
                if(data.result === true) {
                    log.success("Logged in.")
                } else {
                    log.error("Unable to log in.")
                }
            break;

            case map.get(this).databaseRequestID:
                if(typeof data.result !== "undefined") {
                    log.success("Got Database API ID: " + data.result)
                    map.get(this).database = new Database(
                        data.result,
                        map.get(this).connection,
                        map.get(this).events,
                        map.get(this).storage
                    )
                    this.emit("database_api", map.get(this).database)
                } else {
                    log.error("Unable to obtain Database API ID.")
                }
            break;

            default:
                this.emit("message", data)
            break;
        }
    }

    getAsset(key) {
        return map.get(this).storage.getAsset(key)
    }

    getAssets(keys) {
        return map.get(this).storage.getAssets(keys)
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