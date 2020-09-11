const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

app.post("/admin/reset-data", async (req, res) => {
	// FIXME: Error handling and feedback
	await axios.post("http://posts-clusterip-srv:4000/posts/reset-data")
	.catch(error => {
		console.log("Failed to reset posts data. Error: " + error);
	});	
	await axios.post("http://comments-clusterip-srv:4001/comments/reset-data")
	.catch(error => {
		console.log("Failed to reset comments data. Error: " + error);
	});	
	await axios.post("http://query-clusterip-srv:4002/cache/reset-data")
	.catch(error => {
		console.log("Failed to reset query cache data. Error: " + error);
	});	
	await axios.post("http://event-bus-srv:4005/event-bus/reset-data")
	.catch(error => {
			console.log("Failed to reset event-bus data. Error: " + error);
	});	

	res.status(200).send();
});

app.post("/admin/rebuild-cache", async (req, res) => {
	await axios.post("http://query-clusterip-srv:4002/cache/rebuild")
	.catch(error => {
		console.log("Failed to reset query cache data. Error: " + error);
	});

	res.status(200).send();
});

app.listen(4004, () => {
	console.log("Admin: Listening for admin actions on port 4004");
});