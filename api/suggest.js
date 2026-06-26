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
                params: {

                    action: "opensearch",

                    search: q,

                    limit: 5,

                    namespace: 0,

                    format: "json",

                    origin: "*"

                }
            }
        );

        return res.status(200).json(response.data[1]);

    } catch (err) {

        console.error(err);

        return res.status(500).json([]);

    }

};