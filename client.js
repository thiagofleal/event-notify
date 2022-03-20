var { Response } = require('express');

class Client
{
    /**
     * Creates a new client
     * @param { Response<any, Record<string, any>, number> } response
     */
    constructor(response) {
        this.response = response;
        this.data = null;
    }

    /**
     * Set data at client
     * @param {any?} data 
     */
    setData(data) {
        if (typeof data === "object") {
            this.data = Object.assign({}, { ...data });
        }
    }

    /**
     * Starts the response
     */
    start() {
        this.response.setHeader('Access-Control-Allow-Origin', '*');
        this.response.setHeader('Content-Type', 'text/event-stream');
    }

    /**
     * Notify the client
     * @param {string} event Event name
     */
    notify(event, data) {
        const id = (new Date()).valueOf();
        if (typeof data === "object") {
            data = JSON.stringify(data);
        }
        data = '' + data;
        this.response.write(`event: ${event}\nid: ${id}\ndata: ${data}\n\n`, err => {
            if (err) {
                console.error(err);
            }
        });
    }
}

module.exports = Client;