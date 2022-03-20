var express = require("express");
var bodyParser = require("body-parser");
var Client = require("./client");
var ClientsManager = require("./clients-manager");

var server = express();
var manager = new ClientsManager();

server.use(bodyParser.json());

server.get("/:id/events", (request, response) => {
    const client = new Client(response);
    client.start();
    const id = request.params.id;
    const data = request.query || {};
    client.setData(data);
    const remove = manager.add(client, id);

    request.on("close", remove);
    request.on("end", remove);
});

server.post("/:id/emit", (request, response) => {
    const id = request.params.id;
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
});

server.listen(8000, () => {
    console.log("Server started.");
});