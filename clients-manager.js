var Client = require("./client");

function evaluateCondition(where, args) {
    if (where.length !== 3) {
        return false;
    }
    switch (where[1]) {
        case "==":
            return args && args[where[0]] && args[where[0]] == where[2];
        case "!=":
            return args && args[where[0]] && args[where[0]] != where[2];
        case ">":
            return args && args[where[0]] && args[where[0]] > where[2];
        case "<":
            return args && args[where[0]] && args[where[0]] < where[2];
        case  ">=":
            return args && args[where[0]] && args[where[0]] >= where[2];
        case "<=":
            return args && args[where[0]] && args[where[0]] <= where[2];
        case "IN":
            return args && args[where[0]] && where[2].includes(args[where[0]]);
        case "AND":
            return evaluateCondition(where[0], args) && evaluateCondition(where[2], args);
        case "OR":
            return evaluateCondition(where[0], args) || evaluateCondition(where[2], args);
    }
}

class ClientsManager
{
    constructor() {
        this.clients = [];
    }

    /**
     * Add a client
     * @param { Client } client Client to add
     * @param { string } id Id of group
     * @returns Callback to remove the client
     */
    add(client, id) {
        const i = this.clients.push({ client, id });
        return () => {
            const index = this.clients.findIndex(i => i.client === client && i.id === id);
            this.remove(index);
        }
    }

    /**
     * Gets a client
     * @param {number} index 
     * @returns Client at index
     */
    get(index) {
        return this.clients[index].client;
    }

    /**
     * Remove a client
     * @param {number} index 
     */
    remove(index) {
        this.clients.splice(index, 1);
    }

    /**
     * Notify client at index
     * @param {number} index Index of client to notify
     * @param {any?} data Data to send to client
     */
    notify(index, event, data) {
        this.notifyClient(this.clients[index].client, event, data);
    }

    /**
     * Notify a client
     * @param {Client} client Client to notify
     * @param {string} event Event name
     * @param {any?} data Data to send
     */
    notifyClient(client, event, data) {
        client.notify(event, data);
    }

    /**
     * Notify all client
     * @param {any?} data Data to send to client
     */
    notifyAll(event, data) {
        for (let c of this.clients) {
            this.notifyClient(c.client, event, data);
        }
    }

    /**
     * Notify all clients at group
     * @param {string} id Id of group to notify
     * @param {string} event Event name
     * @param {any?} data Data to send
     */
    notifyGroup(id, event, data) {
        this.clients.filter(c => c.id == id).forEach(c => {
            this.notifyClient(c.client, event, data);
        });
    }

    /**
     * Notify clients that matches the conditions
     * @param {string} id Id of group to notify
     * @param {Array<any>} where Conditions to match
     * @param {strin} event Event name
     * @param {any?} data Data to sent
     */
    notifyWhere(id, where, event, data) {
        this.clients.filter(c => c.id == id && evaluateCondition(where, c.client.data)).forEach(c => {
            this.notifyClient(c.client, event, data)
        })
    }
}

module.exports = ClientsManager;