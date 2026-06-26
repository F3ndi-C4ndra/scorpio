const axios = require("axios");

module.exports = async (req, res) => {

    res.setHeader("Access-Control-Allow-Origin", "*");

    const { q } = req.query;

    if (!q) {
        return res.status(200).json([]);
    }

    try {

        const response = await axios.get(
            "https://en.wikipedia.org/w/api.php",
            {
                headers: {
                    "User-Agent": "Scorpio Search Engine/1.0"
                },
                params: {
                    action: "query",
                    list: "search",
                    srsearch: q,
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
                "https://www.google.com/s2/favicons?domain=wikipedia.org&sz=64"

        }));

        return res.status(200).json(results);

    } catch (err) {

        console.error(err);

        return res.status(500).json({
            error: "Failed to fetch search results."
        });

    }

};