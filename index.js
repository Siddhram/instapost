// const puppeteer = require('puppeteer');

// async function getInstagramImage(postUrl) {
//     let browser = null;
//     try {
//         // Launch browser with additional options for better reliability
//         browser = await puppeteer.launch({
//             headless: 'new', // Using new headless mode
//             args: ['--no-sandbox', '--disable-setuid-sandbox']
//         });

//         const page = await browser.newPage();

//         // Set viewport and user agent for better compatibility
//         await page.setViewport({ width: 1280, height: 800 });
//         await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');

//         // Navigate to the Instagram post with timeout
//         await page.goto(postUrl, { 
//             waitUntil: 'networkidle0',
//             timeout: 30000 
//         });

//         // Wait for the meta tag to be present
//         await page.waitForSelector('meta[property="og:image"]', { timeout: 5000 });

//         // Extract the image URL
//         const imageUrl = await page.evaluate(() => {
//             const imageElement = document.querySelector('meta[property="og:image"]');
//             return imageElement ? imageElement.content : null;
//         });

//         if (!imageUrl) {
//             throw new Error('Image URL not found');
//         }

//         console.log("Image URL:", imageUrl);
//         return imageUrl;

//     } catch (error) {
//         console.error("Error:", error.message);
//         throw error;
//     } finally {
//         // Ensure browser closes even if there's an error
//         if (browser) {
//             await browser.close();
//         }
//     }
// }

// // Example usage
// (async () => {
//     try {
//         await getInstagramImage('https://www.instagram.com/p/DEO5FxohDOz/?img_index=1&igsh=MTlmMTh6dWUxbnhlZA==');
//     } catch (error) {
//         console.error("Failed to get Instagram image:", error.message);
//     }
// })();
const express = require('express');
const cors = require('cors');
const puppeteer = require('puppeteer-core'); // Change to puppeteer-core

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

async function getInstagramImage(postUrl) {
    let browser = null;
    try {
        browser = await puppeteer.launch({
            headless: 'new',
            // For Windows, specify the Chrome path
            executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox'
            ]
        });

        // Rest of your code remains the same
        const page = await browser.newPage();
        await page.goto(postUrl, { waitUntil: 'networkidle0' });

        const imageUrl = await page.evaluate(() => {
            const imageElement = document.querySelector('meta[property="og:image"]');
            return imageElement ? imageElement.content : null;
        });

        if (!imageUrl) {
            throw new Error('Image URL not found');
        }

        return imageUrl;

    } catch (error) {
        console.error("Error:", error);
        throw error;
    } finally {
        if (browser) {
            await browser.close();
        }
    }
}

// Rest of your code remains the same

app.post('/get-instagram-image', async (req, res) => {
    const { postUrl } = req.body;
    if (!postUrl) {
        return res.status(400).json({ error: 'Missing postUrl parameter' });
    }
    try {
        const imageUrl = await getInstagramImage(postUrl);
        if (!imageUrl) {
            return res.status(404).json({ error: 'Image not found' });
        }
        res.json({ imageUrl });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch image', details: error.message });
    }
});

app.listen(PORT,"0.0.0.0", () => {
    console.log(`Server is running on port ${PORT}`);
});