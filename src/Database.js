const log = require('./Log.js')
//const Balances = require('./graphene/Balances.js')
const Asset = require('./graphene/Asset.js')
let map = new WeakMap()

function createEventIds(api_event_id, seed, events) {
    let ids = {}
    events.map(name => {
        ids[name] = api_event_id + seed++
    })

    return ids
}

/* Further reading: http://docs.bitshares.org/api/database.html */
class Database {
    
    /**
     * @param {integer} api_id 
     * @param {Connection} connection 
     * @param {EventEmitter} eventEmitter 
     * @param {DataStore} storage 
     */
    constructor(api_id, connection, eventEmitter, storage) {
        let api_event_id = 1000
        let api_event_seed = 0

        map.set(this, {
            api_id: api_id,
            connection: connection,
            events: eventEmitter,
            storage: storage,
            // These can be scoped into a range unique to this api
            // api_id + range + id
            // eh, could be something wiser in place
            event_ids: createEventIds(
                api_event_id,
                api_event_seed,
                [
                    // Objects
                    'get_objects',
                    // Blocks and transactions
                    'get_block_header',
                    'get_block_header_batch',
                    'get_block',
                    'get_transaction',
                    // Globals
                    'get_chain_properties',
                    'get_global_properties',
                    'get_config',
                    'get_chain_id',
                    'get_dynamic_global_properties',
                    // Keys
                    'get_key_references',
                    'is_public_key_registered',

                    // Accounts
                    'get_accounts',
                    'get_full_accounts',
                    'get_account_by_name',
                    'get_account_references',
                    'lookup_account_names',
                    'lookup_accounts',
                    'get_account_count',
                    // Balances
                    'get_account_balances',
                    'get_named_account_balances',
                    'get_balance_objects',
                    'get_vested_balances',
                    'get_vesting_balances',

                    //
                    // Assets
                    // 
                    'get_assets',
                    'list_assets',
                    'lookup_asset_symbols',

                    'get_limit_orders',
                    'get_ticker',
                    
                ]
            )
        })

        //log.error(map.get(this).event_ids)

        // Handle incoming websocket messages in this class
        map.get(this).connection.on("message", data => this.message(data))
    }

    

    /*
    - Subscriptions
    set_subscribe_callback(callback(variant), notify_remove_create)
    set_pending_transaction_callback(callback(variant))
    set_block_applied_callback(callback(block_id))
    cancel_all_subscriptions()

    - Markets / feeds
    #get_limit_orders(id_a, id_b, limit) asset id
    get_call_orders(id_a, limit) asset id
    get_settle_orders(id_a, limit) asset_id
    get_margin_positions(account_id)
    get_collateral_bids(asset_id, limit, start)
    subscribe_to_market(callback(variant), asset_a, asset_b) asset id
    unsubscribe_from_market(asset_a, asset_b) asset id
    #get_ticker(base, quote, skip_order_book = false)
    get_24_volume(base, quote)
    get_order_book(base, quote, limit=50)
    get_trade_history(base, quote, start, stop, limit=100)
    get_trade_history_by_sequence(base, quote, start, stop, limit=100)

    - Witnesses
    get_witnesses(witness_ids)
    get_witness_by_account(account_id)
    lookup_witness_accounts(name, limit)
    get_witness_count()

    - Committee members
    get_committee_members(committee_member_ids)
    get_committee_member_by_account(account_id)
    lookup_committee_member_accounts(name, limit)
    get_committee_count()

    - Workers
    get_all_workers()
    get_workers_by_account(account_id)
    get_worker_count()

    - Votes
    lookup_vote_ids(votes)

    - Authority / Validation
    get_transaction_hex(transaction)
    get_required_signatures(transaction, available_keys)
    get_potential_signatures(transaction)
    get_potential_address_signatures(transaction)
    verify_authority(transaction)
    verify_account_authority(name_or_id, signers)
    validate_transaction(transaction)
    get_required_fees(operations, asset_id)

    - Proposed transactions
    get_proposed_transactions(account_id)

    - Blinded balances
    get_blinded_balances(commitments) ???

this.connection.request(
    this.apiD,
    this.event_ids.,
    "",
    []
)
if(typeof callback !== 'undefined') {
    this.once("db.", callback)
}
    */

    //
    // Objects
    //

    /**
     * Get objects for ids
     * @param {array} ids array of object ids
     * @param {function} callback 
     */
    get_objects(ids, callback) {
        this.connection.request(
            this.apiID,
            this.event_ids.get_objects,
            "get_objects",
            [ids]
        )

        if(typeof callback !== 'undefined') {
            this.once("db.get_objects", callback)
        }
    }

    //
    // Blocks and transactions
    //

    /**
     * Get a block header
     * @param {integer} block_num block id
     * @param {function} callback 
     */
    get_block_header(block_num, callback) {
        this.connection.request(
            this.apiD,
            this.event_ids.get_block_header,
            "get_block_header",
            [block_num]
        )

        if(typeof callback !== 'undefined') {
            this.once("db.get_block_header", callback)
        }
    }

    /**
     * Get multiple block's headers
     * @param {array} block_nums array of block ids
     * @param {function} callback 
     */
    get_block_header_batch(block_nums, callback) {
        this.connection.request(
            this.apiD,
            this.event_ids.get_block_header_batch,
            "get_block_header_batch",
            [block_nums]
        )

        if(typeof callback !== 'undefined') {
            this.once("db.get_block_header_batch", callback)
        }
    }

    /**
     * Get a block by its id
     * @param {integer} block_num block id
     * @param {function} callback 
     */
    get_block(block_num, callback) {
        this.connection.request(
            this.apiD,
            this.event_ids.get_block,
            "get_block",
            [block_num]
        )

        if(typeof callback !== 'undefined') {
            this.once("db.get_block", callback)
        }
    }

    /**
     * Get a specific transaction from a block
     * @param {integer} block_num block id
     * @param {integer} transaction_id signed transaction id in given block id
     * @param {function} callback 
     */
    get_transaction(block_num, transaction_id, callback) {
        this.connection.request(
            this.apiD,
            this.event_ids.get_transaction,
            "get_transaction",
            [
                block_num,
                transaction_id
            ]
        )

        if(typeof callback !== 'undefined') {
            this.once("db.get_transaction", callback)
        }
    }

    //
    // Globals
    //

    /**
     * Get chain properties object
     * @param {function} callback 
     */
    get_chain_properties(callback) {
        this.connection.request(
            this.apiD,
            this.event_ids.get_chain_properties,
            "get_chain_properties",
            []
        )
        if(typeof callback !== 'undefined') {
            this.once("db.get_chain_properties", callback)
        }
    }

    /**
     * Get `current` global properties object
     * @param {function} callback 
     */
    get_global_properties(callback) {
        this.connection.request(
            this.apiD,
            this.event_ids.get_global_properties,
            "get_global_properties",
            []
        )
        if(typeof callback !== 'undefined') {
            this.once("db.get_global_properties", callback)
        }
    }

    /**
     * Get compiled constants
     * @param {function} callback 
     */
    get_config(callback) {
        this.connection.request(
            this.apiD,
            this.event_ids.get_config,
            "get_config",
            []
        )
        if(typeof callback !== 'undefined') {
            this.once("db.get_config", callback)
        }
    }

    /**
     * Get the chain ID
     * @param {function} callback 
     */
    get_chain_id(callback) {
        this.connection.request(
            this.apiD,
            this.event_ids.get_chain_id,
            "get_chain_id",
            []
        )
        if(typeof callback !== 'undefined') {
            this.once("db.get_chain_id", callback)
        }
    }

    /**
     * Get dynamic global properties?
     * What exactly is this?
     * @param {function} callback 
     */
    get_dynamic_global_properties(callback) {
        this.connection.request(
            this.apiD,
            this.event_ids.get_dynamic_global_properties,
            "get_dynamic_global_properties",
            []
        )
        if(typeof callback !== 'undefined') {
            this.once("db.get_dynamic_global_properties", callback)
        }
    }

    //
    // Keys
    //

    /**
     * Get account IDs with public keys
     * @param {array} keys public keys as strings
     * @param {function} callback 
     */
    get_key_references(keys, callback) {
        this.connection.request(
            this.apiID,
            this.event_ids.get_key_references,
            "get_key_references",
            [keys]
        )

        if(typeof callback !== 'undefined') {
            this.once("db.get_key_references", callback)
        }
    }

    /**
     * Is an account id(other?) associated with this public key?
     * @param {string} key public key
     * @param {function} callback 
     */
    is_public_key_registered(key, callback) {
        this.connection.request(
            this.apiID,
            this.event_ids.is_public_key_registered,
            "is_public_key_registered",
            [key]
        )

        if(typeof callback !== 'undefined') {
            this.once("db.is_public_key_registered", callback)
        }
    }

    //
    // Accounts
    //

    /**
     * Get account objects by list of account ids
     * @param {array} account_ids 
     * @param {function} callback 
     */
    get_accounts(account_ids, callback) {
        this.connection.request(
            this.apiID,
            this.event_ids.get_accounts,
            "get_accounts",
            [account_ids]
        )

        if(typeof callback !== 'undefined') {
            this.once("db.get_accounts", callback)
        }
    }

    /**
     * Get "full accounts" with a list of ids or names
     * @param {array} name_or_ids 
     * @param {boolean} subscribe 
     * @param {function} callback 
     */
    get_full_accounts(name_or_ids, subscribe, callback) {
        this.connection.request(
            this.apiID,
            this.event_ids.get_full_accounts,
            "get_full_accounts",
            [
                name_or_ids,
                subscribe
            ]
        )

        if(typeof callback !== 'undefined') {
            this.once("db.get_full_accounts", callback)
        }
    }

    /**
     * Return an account object by username
     * @param {string} name account name
     * @param {function} callback 
     */
    get_account_by_name(name, callback) {
        this.connection.request(
            this.apiID,
            this.event_ids.get_account_by_name,
            "get_account_by_name",
            [name]
        )

        if(typeof callback !== 'undefined') {
            this.once("db.get_account_by_name", callback)
        }
    }

    /**
     * Get accounts that refer to this account in their owner/active permissions
     * @param {string} account_id 
     * @param {function} callback 
     */
    get_account_references(account_id, callback) {
        this.connection.request(
            this.apiID,
            this.event_ids.get_account_references,
            "get_account_references",
            [account_id]
        )

        if(typeof callback !== 'undefined') {
            this.once("db.get_account_references", callback)
        }
    }

    /**
     * Look up a list of accounts by their names
     * @param {array} names account names
     * @param {function} callback 
     */
    lookup_account_names(names, callback) {
        this.connection.request(
            this.apiID,
            this.event_ids.lookup_account_names,
            "lookup_account_names",
            [names]
        )

        if(typeof callback !== 'undefined') {
            this.once("db.lookup_account_names", callback)
        }
    }

    /**
     * Search for accounts like given account name/string
     * @param {string} name 
     * @param {integer} limit returned results MAX 1000, default 100
     * @param {function} callback 
     */
    lookup_accounts(name, limit, callback) {
        // Limit should exist, be positive and less than 1k
        if(!limit || limit < 0 || limit > 1000) {
            limit = 100
        }

        this.connection.request(
            this.apiID,
            this.event_ids.lookup_accounts,
            "lookup_accounts",
            [
                name,
                limit
            ]
        )

        if(typeof callback !== 'undefined') {
            this.once("db.lookup_accounts", callback)
        }
    }

    /**
     * Get a total count of accounts
     * @param {function} callback 
     */
    get_account_count(callback) {
        this.connection.request(
            this.apiID,
            this.event_ids.get_account_count,
            "get_account_count",
            []
        )

        if(typeof callback !== 'undefined') {
            this.once("db.get_account_count", callback)
        }
    }

    /**
     * Check account balances
     * @param {string} account_id 
     * @param {array} assets - asset ids
     * @param {function} callback 
     */
    get_account_balances(account_id, assets, callback) {
        // LATER: error check asset ids... as a start
        this.connection.request(
            this.apiID,
            this.event_ids.get_account_balances,
            "get_account_balances",
            [
                account_id,
                assets
            ]
        )

        if(typeof callback !== 'undefined') {
            this.once("db.get_account_balances", callback)
        }
    }
    
    /**
     * Get a specific account's balances for specified assets
     * @param {string} name account name
     * @param {array} asset_ids 
     * @param {function} callback 
     */
    get_named_account_balances(name, asset_ids, callback) {
        this.connection.request(
            this.apiID,
            this.event_ids.get_named_account_balances,
            "get_named_account_balances",
            [
                name,
                asset_ids
            ]
        )

        if(typeof callback !== 'undefined') {
            this.once("db.get_named_account_balances", callback)
        }
    }

    /**
     * Get unclaimed balance objects for base58 addresses (legacy?)
     * @param {array} addrs array of base58 addresses?
     * @param {function} callback 
     */
    get_balance_objects(addrs, callback) {
        log.error("DB.get_balance_objects is not implemented")
        // this.connection.request(
        //     this.apiID,
        //     this.event_ids.get_balance_objects,
        //     "get_balance_objects",
        //     [
        //         addrs
        //     ]
        // )

        // if(typeof callback !== 'undefined') {
        //     this.once("db.get_balance_objects", callback)
        // }
    }

    /**
     * Get vested balances for balance objects?
     * @param {array} objs 
     * @param {*} callback 
     */
    get_vested_balances(objs, callback) {
        log.error("DB.get_vested_balances is not implemented")
        // this.connection.request(
        //     this.apiID,
        //     this.event_ids.get_vested_balances,
        //     "get_vested_balances",
        //     [objs]
        // )

        // if(typeof callback !== 'undefined') {
        //     this.once("db.get_vested_balances", callback)
        // }
    }

    /**
     * Get the vesting balances for an account
     * @param {string} account_id 
     * @param {function} callback 
     */
    get_vesting_balances(account_id, callback) {
        this.connection.request(
            this.apiID,
            this.event_ids.get_vesting_balances,
            "get_vesting_balances",
            [account_id]
        )

        if(typeof callback !== 'undefined') {
            this.once("db.get_vesting_balances", callback)
        }
    }

    //
    // Assets
    //

    /**
     * Return a list of assets by asset_ids
     * @param {Array} asset_ids 
     * @param {function} callback 
     */
    get_assets(asset_ids, callback) {
        this.connection.request(
            this.apiID,
            this.event_ids.get_assets,
            "get_assets",
            [
                asset_ids
            ]
        )

        if(typeof callback !== 'undefined') {
            this.once("db.get_assets", callback)
        }
    }

    /**
     * Search for an asset by its symbol
     * @param {string} symbol asset symbol
     * @param {integer} limit result limit. max 100
     * @param {function} callback 
     */
    list_assets(symbol, limit, callback) {
        if(!limit || limit < 1) {
            limit = 1
        }
        this.connection.request(
            this.apiID,
            this.event_ids.list_assets,
            "list_assets",
            [
                symbol,
                limit
            ]
        )

        if(typeof callback !== 'undefined') {
            this.once("db.list_assets", callback)
        }
    }
    
    /**
     * Get a list of assets using a list of symbols
     * @param {array} symbols array asset symbol names
     * @param {function} callback 
     */
    lookup_asset_symbols(symbols, callback) {
        // We could/should check local asset collection first.
        // Then we could build and emit a replica locally
        this.connection.request(
            this.apiID,
            this.event_ids.lookup_asset_symbols,
            "lookup_asset_symbols",
            [
                JSON.parse(symbols)
            ]
        )

        if(typeof callback !== 'undefined') {
            this.once("db.lookup_asset_symbols", callback)
        }
    }

    /**
     * Get limit orders for asset pair
     * @param {string} asset_id_a 
     * @param {string} asset_id_b 
     * @param {int} limit - Maximum of 100, Default 20
     * @param {function} callback 
     */
    get_limit_orders(asset_id_a, asset_id_b, limit, callback) {
        if(typeof limit === 'undefined') {
            limit = 20
        }

        this.connection.request(
            this.apiID,
            this.event_ids.get_limit_orders,
            "get_limit_orders",
            [
                asset_id_a,
                asset_id_b,
                limit
            ]
        )

        if(typeof callback !== 'undefined') {
            this.once("db.get_limit_orders", callback)
        }
    }

    /**
     * Get the ticker price for asset pair
     * @param {string} asset_id_base 
     * @param {string} asset_id_quote 
     * @param {function} callback 
     */
    get_ticker(asset_id_base, asset_id_quote, callback) {
        this.connection.request(
            this.apiID,
            this.event_ids.get_ticker,
            "get_ticker",
            [
                asset_id_base,
                asset_id_quote
            ]
        )

        if(typeof callback !== 'undefined') {
            this.once("db.get_ticker", callback)
        }
    }

    /**
     * @return {Connection} Connection instance
     */
    get connection() {
        return map.get(this).connection
    }

    /**
     * @return {object} event_ids
     */
    get event_ids() {
        return map.get(this).event_ids
    }

    /**
     * @return {integer} the API ID given for this instance
     */
    get apiID() {
        return map.get(this).api_id
    }

    /**
     * Attach an event to EventEmitter 
     * @param {string} event event name
     * @param {function} callback 
     */
    on(event, callback) {
        map.get(this).events.on(event, callback)
    }

    /**
     * Attach a event to EventEmitter to be fired only once
     * @param {string} event event name
     * @param {function} callback 
     */
    once(event, callback) {
        map.get(this).events.once(event, callback)
    }

    /**
     * Emit an event using EventEmitter
     * @param {string} event event name
     * @param {anything} data 
     */
    emit(event, data) {
        map.get(this).events.emit(event, data)
    }

    /**
     * Handles incoming websocket responses related to database api
     * @param {string} data response data as JSON string
     */
    message(data) {
        data = JSON.parse(data)
        let events = map.get(this).event_ids

        if(typeof data.error !== 'undefined') {
            log.error(data.error)
        }

        switch(data.id) {

            //
            // Objects
            //
            case events.get_objects:
                this.emit("db.get_objects", data.result)
            break;

            //
            // Blocks and transactions
            //
            case events.get_block_header:
                this.emit("db.get_block_header", data.result)
            break;

            case events.get_block_header_batch:
                this.emit("db.get_block_header_batch", data.result)
            break;

            case events.get_block:
                this.emit("db.get_block", data.result)
            break;

            case events.get_transaction:
                if(data.error) {
                    log.error(data.error.message)
                }
                this.emit("db.get_transaction", data.result)
            break;

            //
            // Globals
            // 
            case events.get_chain_properties:
                this.emit("db.get_chain_properties", data.result)
            break;

            case events.get_global_properties:
                this.emit("db.get_global_properties", data.result)
            break;

            case events.get_config:
                this.emit("db.get_config", data.result)
            break;

            case events.get_chain_id:
                this.emit("db.get_chain_id", data.result)
            break;

            case events.get_dynamic_global_properties:
                this.emit("db.get_dynamic_global_properties", data.result)
            break;
            
            //
            // Keys
            //
            case events.get_key_references:
                this.emit("db.get_key_references", data.result)
            break;

            case events.is_public_key_registered:
                this.emit("db.is_public_key_registered", data.result)
            break;

            //
            // Accounts
            //
            case events.get_accounts:
                this.emit("db.get_accounts", data.result)
            break;

            case events.get_full_accounts:
                this.emit("db.get_full_accounts", data.result)
            break;

            case events.get_account_by_name:
                this.emit("db.get_account_by_name", data.result)
            break;

            case events.get_account_references:
                this.emit("db.get_account_references", data.result)
            break;

            case events.lookup_account_names:
                this.emit("db.lookup_account_names", data.result)
            break;

            case events.lookup_accounts:
                this.emit("db.lookup_accounts", data.result)
            break;

            case events.get_account_count:
                this.emit("db.get_account_count", data.result)
            break;
            
            //
            // Balances
            //
            case events.get_account_balances:
                //let x = new Balances(data.result)
                this.emit("db.get_account_balances", data.result)
            break;
            
            case events.get_named_account_balances:
                this.emit("db.get_named_account_balances", data.result)
            break;

            case events.get_balance_objects:
                this.emit("db.get_balance_objects", data.result)
            break;

            case events.get_vested_balances:
                this.emit("db.get_vested_balances", data.result)
            break;

            case events.get_vesting_balances:
                this.emit("db.get_vesting_balances", data.result)
            break;

            //
            // Assets
            //
            
            case events.get_assets:
                // After assets have been stored, we'll pass the stored assets
                // back to get_assets
                this.once('store.assets.stored', (assets) => {
                    this.emit('db.get_assets', assets)
                })

                // Store retrieved assets
                this.emit('store.assets', data.result)
            break;

            case events.list_assets:
                this.emit("db.list_assets", data.result)
            break;
            
            case events.lookup_asset_symbols:
                this.emit("db.lookup_asset_symbols", data.result)
            break;







            case events.get_limit_orders:
                this.emit("db.get_limit_orders", data.result)
            break;

            case events.get_ticker:
                this.emit("db.get_ticker", data.result)
            break;
        }
    }
}

module.exports = Database