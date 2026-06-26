const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.static("public"));

const PORT = process.env.PORT || 3000;

/*
=========================
SEARCH API
=========================
*/

app.get("/search", async (req, res) => {
  const query = req.query.q;

  if (!query) {
    return res.json([]);
  }

  try {

const response = await axios.get(
  "https://en.wikipedia.org/w/api.php",
  {
    headers: {
      "User-Agent": "MiniSearchEngine/1.0"
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
      thumbnail: `https://www.google.com/s2/favicons?sz=64&domain=wikipedia.org`
    }));

    res.json(results);

  } catch (error) {

    console.error(error);

    res.status(500).json({
        error: error.message
    });

}
});

/*
=========================
AUTOCOMPLETE
=========================
*/

app.get("/suggest", async (req, res) => {
  const query = req.query.q;

  try {

    const response = await axios.get(
      "https://en.wikipedia.org/w/api.php",
      {
        params: {
          action: "opensearch",
          search: query,
          limit: 5,
          namespace: 0,
          format: "json",
          origin: "*"
        }
      }
    );

    res.json(response.data[1]);

  } catch (err) {
    res.json([]);
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});