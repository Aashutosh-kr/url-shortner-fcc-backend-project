require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();
const { Url } = require("./db");
const bodyParser = require("body-parser");
const dns = require("dns");

// Basic Configuration
const port = process.env.PORT || 8000;

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));

app.use("/public", express.static(`${process.cwd()}/public`));

app.get("/", function (req, res) {
	res.sendFile(process.cwd() + "/views/index.html");
});

// Your first API endpoint
app.get("/api/hello", function (req, res) {
	res.json({ greeting: "hello API" });
});

// API for Shortening a url
app.post("/api/shorturl", async (req, res) => {
	const { url } = req.body;
	try {
		if (url.slice(0, 7) === "http://" || url.slice(0, 8) === "https://") {
			let shortUrl = (await Url.find().countDocuments()) + 1;

			const oldUrl = await Url.findOne({ input_url: url });
			return oldUrl
				? res.json({
						original_url: oldUrl.input_url,
						short_url: oldUrl.short_url,
				  })
				: await Url.create({
						input_url: url,
						short_url: shortUrl,
				  });
		} else {
			return res.json({ err: "Invalid url" });
		}
	} catch (error) {
		console.error(error.message);
		return res.json({ err: error.message });
	}
});

// API for redirecting to the original url
app.get("/api/shorturl/:short_url", async (req, res) => {
	const { short_url } = req.params;
	try {
		const url = await Url.findOne({ short_url });
		return url
			? res.redirect(url.input_url)
			: res.json({ err: "No url found" });
	} catch (error) {
		console.error(error.message);
		return res.json({ err: error.message });
	}
});

app.listen(port, function () {
	console.log(`Listening on port ${port}`);
});
