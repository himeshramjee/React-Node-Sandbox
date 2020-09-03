const express = require("express");
const axios = require("axios");
const { randomBytes } = require("crypto");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

const events = {};
const broadcastClientList = [
    { clientID : "0", clientEndpoint : "http://localhost:4000/events" },
    { clientID : "1", clientEndpoint : "http://localhost:4001/events" }
];

app.get("/events", (req, res) => {
    console.log("EventBus: Processing GET to /events...");
    res.send({ 
        eventCount : Object.keys(events) ? Object.keys(events).length : 0,
        subscriberCount : broadcastClientList.length
     });
});

app.post("/events", (req, res) => {
    console.log("EventBus: Processing POST to /events...");
    const event = req.body;
    const eventID = randomBytes(4).toString("hex");

    // Store new event
    event["eventID"] = eventID;
    events[eventID] = event;

    // Broadcast to clients
    broadcastClientList.map(client => {
        axios.post(client.clientEndpoint, event)
            .then(response => {
                // console.log("Published event to client. ID: " + client.clientID);
            })
            .catch((e) => {
                console.log("Failed to publish new event with ID: " + eventID + " to client with ID: " + client.clientID + ". Error: " + e);
                // console.log(e);
        });
    });

    res.send({ "eventID" : eventID });
});

app.listen(4005, () => {
    console.log("EventBus: Listening for Blog events on port 4005");
});