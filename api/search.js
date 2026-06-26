const axios = require("axios");

module.exports = async (req, res) => {
  const query = req.query.q;

  if (!query) {
    return res.status(200).json([]);
  }

  try {
    const response = await axios.get(
      "https://en.wikipedia.org/w/api.php",
      {
        headers: {
          "User-Agent": "Scorpio Search"
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
      thumbnail: "https://www.google.com/s2/favicons?sz=64&domain=wikipedia.org"
    }));

    res.status(200).json(results);

  } catch (err) {

    console.error(err);

    res.status(500).json({
      error: err.message
    });

  }
};