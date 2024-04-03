const axios = require("axios");
const fs = require("fs");

(async () => {
    try {
        const ids = require("./all-fortnite-id-data.json");

        function formatUnixToDateTime(unixTimestamp) {
            const date = new Date(unixTimestamp * 1000);
            return date.toLocaleString("en-US", {
                weekday: "long", // long-form weekday
                year: "numeric",
                month: "short", // short-form month
                day: "numeric",
                hour: "numeric",
                minute: "2-digit",
                hour12: true, // Use AM/PM
            });
        }

        // Helper function to calculate the timeline length in a human-readable format
        function formatTimelineLength(startTime, endTime) {
            const durationInSeconds = endTime - startTime;
            const hours = Math.floor(durationInSeconds / 3600);
            const minutes = Math.floor((durationInSeconds % 3600) / 60);
            return `${hours}h ${minutes}m`;
        }

        async function fetchDataForId(apiId) {
            const apiEndpoint = `https://fortnite.gg/player-count-discovery?id=${apiId}`;

            // Set your headers here
            const headers = {
                Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
                "Accept-Encoding": "gzip, deflate, br", // 'zstd' might not be supported by axios/http module
                "Accept-Language": "en-GB,en-US;q=0.9,en;q=0.8",
                "Cache-Control": "max-age=0",
                "Sec-Ch-Ua":
                    '"Google Chrome";v="123", "Not:A-Brand";v="8", "Chromium";v="123"',
                "Sec-Ch-Ua-Mobile": "?0",
                "Sec-Ch-Ua-Platform": '"Windows"',
                "Sec-Fetch-Dest": "document",
                "Sec-Fetch-Mode": "navigate",
                "Sec-Fetch-Site": "none",
                "Sec-Fetch-User": "?1",
                "Upgrade-Insecure-Requests": "1",
                "User-Agent": "Chrome/123.0.0.0 Safari/537.36",
            };

            try {
                const response = await axios.get(apiEndpoint, { headers });
                // Perform the data formatting here if needed
                return response.data;
            } catch (error) {
                console.error(`Error fetching data for ID ${apiId}: `, error);
                return null; // Return null if there's an error
            }
        }

        const allResults = [];

        for (let item of ids) {
            const data = await fetchDataForId(item.api_id);
            if (data) {
                console.log(
                    `Successfully fetched data for API ID: ${item.api_id}`
                );

                const discoveryData = data.discovery.map((entry) => {
                    const [type, startTime, endTime] = entry;
                    return {
                        type,
                        start: formatUnixToDateTime(startTime),
                        end: formatUnixToDateTime(endTime),
                        timelineLength: formatTimelineLength(
                            startTime,
                            endTime
                        ),
                    };
                });

                allResults.push({
                    no: item.no,
                    title: item.title,
                    discovery: discoveryData,
                });
            } else {
                console.log(`Failed to fetch data for API ID: ${item.api_id}`);
            }
        }

        // Write the response data to a file
        fs.writeFileSync(
            "allDiscovery.json",
            JSON.stringify(allResults, null, 2)
        );
    } catch (error) {
        console.error("Error fetching data: ", error);
    }
})();
