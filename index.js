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

let short_url;
let num = async () => {
	short_url = await Url.countDocuments();
	console.log("short_url", short_url);
};
num();

// API for Shortening a url
app.post("/api/shorturl", async (req, res) => {
	const { url } = req.body;

	const domain = url.split("//")[1]?.split("/?")[0];
	const dnsCheck = dns.lookup(domain, async (err) => (err ? false : true));

	try {
		const check = url.includes("http://") || url.includes("https://");
		if (!check) {
			return res.json({
				error: "invalid url",
				message: "prefix url with http:// or https://",
			});
		}
		const oldUrl = await Url.findOne({ input_url: url });

		if (oldUrl) {
			return res.json({
				original_url: oldUrl.input_url,
				short_url: oldUrl.short_url,
			});
		}
		if (dnsCheck) {
			short_url++;
			const newUrl = await Url.create({
				input_url: url,
				short_url,
			});
			return res.json({ original_url: newUrl.input_url, short_url });
		} else {
			return res.json({ error: "invalid URL" });
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
