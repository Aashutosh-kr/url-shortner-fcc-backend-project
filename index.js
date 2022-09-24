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

// API for Shortening a url
app.post("/api/shorturl", async (req, res) => {
	const { url } = req.body;
	const domain = url.split("//");

	try {
		const check = url.includes("http://") || url.includes("https://");
		if (!check) {
			return res.json({
				error: "invalid url",
				message: "prefix url with http:// or https://",
			});
		}

		const oldUrl = await Url.findOne({ input_url: url });
		return oldUrl
			? res.json({
					original_url: oldUrl.input_url,
					short_url: oldUrl.short_url,
			  })
			: dns.lookup(domain[2], async (err) => {
					return err
						? res.json({ error: "invalid URL" })
						: await Url.create({
								input_url: url,
								short_url: (await Url.find().countDocuments()) + 1,
						  });
			  });
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
