var express = require("express");
var cors = require("cors");
var bodyParser = require("body-parser");
var Client = require("./client");
var ClientsManager = require("./clients-manager");
var Generator = require("./generator");

var server = express();
var manager = new ClientsManager();

const clients = [];

server.use(bodyParser.json());
server.use(cors());

server.get("/:id/events", (request, response) => {
    const id = request.params.id.trim();
    const item = clients.find(c => c.id === id);

    if (item) {
        const data = request.query || {};
        const token = request.headers.authorization || data.token;

        if (token && token === item.public) {
            const client = new Client(response);
            client.start();
            client.setData(data);
            const remove = manager.add(client, id);

            request.on("close", () => remove());
            request.on("end", () => remove());
        } else {
            response.status(403).send({
                error: "Not authorized"
            });
        }
    } else {
        response.status(404).send({
            error: "Identifier not found"
        });
    }
});

server.post("/:id/emit", (request, response) => {
    const id = request.params.id.trim();
    const client = clients.find(c => c.id === id);

    if (client) {
        const { authorization } = request.headers;

        if (authorization === client.private) {
            const { event, data, where } = request.body || {};
            
            if (where && Array.isArray(where)) {
                manager.notifyWhere(id, where, event, data);
            } else if (id) {
                manager.notifyGroup(id, event, data);
            }
            response.status(200).send({
                message: "Event sent successful"
            });
            return true;
        } else {
            response.status(403).send({
                error: "Not authorized"
            });
        }
    } else {
        response.status(404).send({
            error: "Identifier not found"
        });
        return false;
    }
});

server.post("/", (request, response) => {
    const client = {};
    const { id } = request.body;

    if (id) {
        client.id = id;
    }
    while (!client.id || clients.find(c => c.id === client.id)) {
        client.id = Generator.randomString(12);
    }
    client.public = Generator.randomString(20);
    client.private = Generator.randomString(20);
    
    response.status(200).send(client);
    clients.push(client);
    
    return true;
});

let port = 8000;

const prefix = "--port=";
const arg = process.argv.find(a => a.startsWith(prefix));

if (arg) {
    const value = parseInt(arg.replace(prefix, ""));

    if (!isNaN(value)) {
        port = value;
    }
}

server.listen(port, () => {
    console.log("Server started at port " + port);
});