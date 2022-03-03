var Client = require("./client");

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
        const length = this.clients.push({ client, id });
        const index = length - 1;
        return () => this.remove(index);
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
}

module.exports = ClientsManager;