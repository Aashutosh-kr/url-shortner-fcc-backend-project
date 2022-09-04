require("dotenv").config();
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const connectMongo = mongoose.connect(
	process.env.MONGO_URI,
	{ useNewUrlParser: true },
	console.log("connected to mongo")
);

const urlSchema = new Schema({
	input_url: { type: String, required: true },
	short_url: String,
});

const Url = mongoose.model("Url", urlSchema);

module.exports = { Url };
