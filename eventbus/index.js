const express = require("express");
const axios = require("axios");
const { randomBytes } = require("crypto");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

// This should be a more complex object with timestamps to allow for point in time event playback. Overkill at this stage so going with a simple array. Lastest event is pushed in at end of array.
let events = [];

// Poor mans service discovery anyone? :D
const broadcastClientList = [
    // { clientID : "0", clientEndpoint : "http://posts-clusterip-srv:4000/events" },
    { clientID : "1", clientEndpoint : "http://comments-clusterip-srv:4001/events" },
    { clientID : "2", clientEndpoint : "http://query-clusterip-srv:4002/events" },
    { clientID : "3", clientEndpoint : "http://moderator-clusterip-srv:4003/events" }
];

app.post('/event-bus/reset-data', (req, res) => {
    events = [];
    res.status(200).send();
});

app.get("/events/metrics", (req, res) => {
    res.send({ 
        eventCount : events.length,
        subscriberCount : broadcastClientList.length
     });
});

app.get("/events", (req, res) => {
    res.status(200).send(events);
});

app.post("/events", (req, res) => {
    const event = req.body;
    const eventID = randomBytes(4).toString("hex");

    // Store new event
    event.eventID = eventID;
    events.push(event);

    // Broadcast to clients
    broadcastClientList.map(client => {
        axios.post(client.clientEndpoint, event)
            .then(response => {
                // console.log("Published event to client. ID: " + client.clientID);
            })
            .catch((e) => {
                console.log("Failed to publish new event with ID: " + eventID + " to client with ID: " + client.clientID + ". Error: " + e);
        });
    });

    res.send({ "eventID" : eventID });
});

app.listen(4005, () => {
    console.log("EventBus v0.0.1: Listening for Blog events on port 4005");
});