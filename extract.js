//extracting detail data
const axios = require("axios");
const cheerio = require("cheerio");
const fs = require("fs");

const fortniteIslands = JSON.parse(
    fs.readFileSync("fortniteIslands.json", "utf8")
);

async function fetchData(url) {
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
        const title = $(".island-detail h1").first().text().trim();
        const imageURL = $("#island-img").attr("src");
        const creator = $(".island-detail a").first().text().trim();
        const tags = [];
        $(".tags a").each((index, element) => {
            const tagText = $(element).text().trim();
            tags.push(tagText);
        });

        let descriptions = [];
        $(".desc").each((index, element) => {
            const desc = $(element)
                .html()
                .replace(/<br\s*\/?>/gi, "\n")
                .trim(); // Replace <br> with newlines
            descriptions.push(desc);
        });

        const createdIn = $("td.grey")
            .filter(function () {
                return $(this).text().trim() === "Created In:";
            })
            .next("td")
            .text()
            .trim();

        const releaseDate = $("td.grey")
            .filter(function () {
                return $(this).text().trim() === "Release Date:";
            })
            .next("td")
            .text()
            .trim();

        const lastUpdate = $("td.grey")
            .filter(function () {
                return $(this).text().trim() === "Last Update:";
            })
            .next("td")
            .text()
            .trim();

        const ageRating = $(".fn-assets-header td.grey")
            .filter(function () {
                return $(this).text().trim() === "Age Rating:";
            })
            .next("td")
            .text()
            .trim();

        const islandID = $(".copy-code").data("code");

        const playersRightNowText = $(
            ".chart-stats .chart-stats-div .chart-stats-title"
        )
            .first()
            .text()
            .trim();
        const playersRightNow = parseInt(
            playersRightNowText.replace(/,/g, ""),
            10
        );

        if (isNaN(playersRightNow)) {
            console.error("Could not parse 'Players right now' as a number.");
            playersRightNow = 0; // You can handle NaN however suits your application
        }

        const pageData = {
            title,
            imageURL,
            creator,
            tags,
            descriptions,
            createdIn,
            releaseDate,
            lastUpdate,
            ageRating,
            islandID,
            playersRightNow,
        };

        return pageData;
    } catch (error) {
        console.error(`Error fetching page ${page}:`, error);
        return [];
    }
}

async function scrapeAll() {
    let allIslandData = [];
    let globalIndex = 1;

    for (const island of fortniteIslands) {
        console.log(`Scraping data for island: ${island.no}`);
        try {
            const data = await fetchData(island.href); // Use the href from each island in the JSON
            allIslandData.push({ no: globalIndex++, ...data });
        } catch (error) {
            console.error(`Error scraping data for island:`, error);
        }
    }

    // Now write the cumulative scrape result to a single JSON file
    const jsonContent = JSON.stringify(allIslandData, null, 2); // Pretty-print with 2 spaces indentation
    fs.writeFileSync("all-fortnite-data.json", jsonContent, "utf8");
    console.log("All island JSON data has been saved.");
}

scrapeAll();
