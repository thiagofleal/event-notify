var express = require("express");
var cors = require("cors");
var fs = require("fs");
var bodyParser = require("body-parser");

var Client = require("./client");
var ClientsManager = require("./clients-manager");
var Generator = require("./generator");

var server = express();
var manager = new ClientsManager();

const clients = {};

server.use(bodyParser.json());
server.use(cors());

server.get("/:id/events", (request, response) => {
    const id = request.params.id.trim();
    const item = clients[id];

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
    const client = clients[id];

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
    while (!client.id || clients[id]) {
        client.id = Generator.randomString(12);
    }
    client.public = Generator.randomString(20);
    client.private = Generator.randomString(20);

    response.status(200).send(client);
    clients[id] = client;

    return true;
});

const filename = "clients.json";

function load() {
    const ret = [];

    if (fs.existsSync(filename)) {
        const content = fs.readFileSync(filename);
        const json = JSON.parse(content);

        for (const key in json) {
            clients[key] = json[key];
            ret.push(key);
        }
    }
    return ret;
}

server.post("/load", (request, response) => {
    const ret = load();
    response.status(200).send({
        count: ret.length,
        clients: ret
    });
    return true;
});

server.post("/persist", (request, response) => {
    const ids = request.body.ids || [];
    const content = {};
    const ret = [];

    if (!Array.isArray(ids)) {
        response.status(400).send({
            error: "Param \"ids\" must be array"
        });
        return false;
    }
    for (const id of ids) {
        if (clients[id]) {
            content[id] = clients[id];
            ret.push(id);
        }
    }
    fs.writeFileSync(filename, JSON.stringify(content));
    response.status(200).send({
        count: ret.length,
        clients: ret
    });
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
    const ret = load();

    console.log("Server started at port " + port);
    console.log("Load: ", ret);
});