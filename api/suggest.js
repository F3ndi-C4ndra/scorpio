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

    res.status(200).json(response.data[1]);

  } catch {

    res.status(200).json([]);

  }

};