const http = require("http");
const https = require("https");

const server = http.createServer((req, res) => {
  if (req.url === "/getTimeStories" && req.method === "GET") {
    const url = "https://time.com";

    https
      .get(url, (response) => {
        let htmlContent = "";

        response.on("data", (chunk) => {
          htmlContent += chunk;
        });

        response.on("end", () => {
          const latestStories = extractLatestStories(htmlContent);

          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify(latestStories));
        });
      })
      .on("error", (error) => {
        console.error(`Error fetching Time.com: ${error.message}`);
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Unable to fetch Time.com" }));
      });
  } else {
    res.writeHead(404, { "Content-Type": "text/plain" });
    res.end("Not Found");
  }
});

const extractLatestStories = (htmlContent) => {
  const latestStories = [];
  let startIndex = htmlContent.indexOf("<article");

  for (let i = 0; i < 6; i++) {
    startIndex = htmlContent.indexOf("<h3", startIndex);
    const titleStart = htmlContent.indexOf(">", startIndex) + 1;
    const titleEnd = htmlContent.indexOf("</h3>", titleStart);
    const title = extractText(htmlContent, titleStart, titleEnd);

    const linkStart = htmlContent.indexOf('href="', titleEnd) + 6;
    const linkEnd = htmlContent.indexOf('"', linkStart);
    const link =
      "https://time.com" + extractText(htmlContent, linkStart, linkEnd);

    startIndex = linkEnd;

    latestStories.push({ title, link });
  }

  return latestStories;
};

const extractText = (html, start, end) => {
  // Basic HTML tag removal
  return html
    .slice(start, end)
    .replace(/<\/?[^>]+(>|$)/g, "")
    .trim();
};

const PORT = 80;
server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

// RUN THIS CODE USING: node server.js

