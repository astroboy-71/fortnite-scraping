//scraping href data for extracting detail data
const axios = require("axios");
const cheerio = require("cheerio");
const fs = require("fs");

async function fetchData(page) {
    const url = `https://fortnite.gg/creative?page=${page}`;

    const axiosOptions = {
        method: "GET",
        url,
        headers: {
            Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
            "Accept-Encoding": "gzip, deflate, br, zstd",
            "Accept-Language": "en-GB,en-US;q=0.9,en;q=0.8",
            "Cache-Control": "max-age=0",
            Referer: "https://fortnite.gg/creative",
            "Sec-Ch-Ua":
                '"Chromium";v="122", "Not(A:Brand";v="24", "Google Chrome";v="122"',
            "Sec-Ch-Ua-Mobile": "?0",
            "Sec-Ch-Ua-Platform": '"Windows"',
            "Sec-Fetch-Dest": "document",
            "Sec-Fetch-Mode": "navigate",
            "Sec-Fetch-Site": "same-origin",
            "Sec-Fetch-User": "?1",
            "Upgrade-Insecure-Requests": "1",
            "User-Agent": "Chrome/122.0.0.0 Safari/537.36",
        },
        withCredentials: true,
    };
    try {
        const response = await axios(axiosOptions);
        const htmlContent = response.data;
        const $ = cheerio.load(htmlContent);
        const pageData = [];

        $("a.island").each((index, element) => {
            const title = $(element).find("h3").text().trim();
            const href = "https://fortnite.gg" + $(element).attr("href");
            const imageUrl = $(element).find(".img img").attr("src").trim();
            const playersCount = $(element).find(".players").text().trim();

            pageData.push({
                title: title,
                href: href,
                imageUrl: imageUrl,
                players: playersCount,
            });
        });

        return pageData;
    } catch (error) {
        console.error(`Error fetching page ${page}:`, error);
        return [];
    }
}

async function fetchAllPages(startPage, endPage) {
    let allData = [];
    let globalIndex = 1;

    for (let page = startPage; page <= endPage; page++) {
        console.log(`Fetching data for page ${page}...`);
        const data = await fetchData(page);
        const annotatedPageData = data.map((item) => {
            return { no: globalIndex++, ...item };
        });

        allData = [...allData, ...annotatedPageData];
    }

    fs.writeFile(
        "fortniteIslands.json",
        JSON.stringify(allData, null, 2),
        (err) => {
            if (err) {
                console.error("Error writing JSON to file:", err);
            } else {
                console.log("Extracted data saved to fortniteIslands.json");
            }
        }
    );
}

fetchAllPages(1, 10);
