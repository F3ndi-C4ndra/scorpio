const express = require("express");
const axios = require("axios");
const cors = require("cors");
const path = require("path");

const app = express();

app.use(cors());

// Static files
app.use(express.static(__dirname));

// Home
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
});

/*
=========================
SEARCH API
=========================
*/

app.get("/search", async (req, res) => {

    const query = req.query.q;

    if (!query) return res.json([]);

    try {

        const response = await axios.get(
            "https://en.wikipedia.org/w/api.php",
            {
                headers: {
                    "User-Agent": "Scorpio Search Engine"
                },
                params: {
                    action: "query",
                    list: "search",
                    srsearch: query,
                    format: "json",
                    origin: "*"
                }
            }
        );

        const results = response.data.query.search.map(item => ({
            title: item.title,
            snippet: item.snippet.replace(/<\/?[^>]+(>|$)/g, ""),
            url: `https://en.wikipedia.org/wiki/${encodeURIComponent(item.title)}`,
            thumbnail:
                "https://www.google.com/s2/favicons?sz=64&domain=wikipedia.org"
        }));

        res.json(results);

    } catch (err) {

        console.error(err);

        res.status(500).json({
            error: err.message
        });

    }

});

/*
=========================
AUTOCOMPLETE
=========================
*/

app.get("/suggest", async (req, res) => {

    try {

        const response = await axios.get(
            "https://en.wikipedia.org/w/api.php",
            {
                params: {
                    action: "opensearch",
                    search: req.query.q,
                    limit: 5,
                    namespace: 0,
                    format: "json",
                    origin: "*"
                }
            }
        );

        res.json(response.data[1]);

    } catch {

        res.json([]);

    }

});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server running on ${PORT}`);
});