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
const puppeteer = require('puppeteer-core');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

async function getInstagramImage(postUrl) {
    let browser = null;
    try {
        console.log('Launching browser...');
        browser = await puppeteer.launch({
            headless: 'new',
            executablePath: '/usr/bin/google-chrome-stable',  // Fixed path
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-gpu'
            ]
        });

        console.log('Creating new page...');
        const page = await browser.newPage();

        await page.setViewport({ width: 1280, height: 800 });
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');

        console.log(`Navigating to URL: ${postUrl}`);
        await page.goto(postUrl, { 
            waitUntil: 'networkidle0',
            timeout: 30000 
        });

        console.log('Extracting image URL...');
        const imageUrl = await page.evaluate(() => {
            const imageElement = document.querySelector('meta[property="og:image"]');
            return imageElement ? imageElement.content : null;
        });

        if (!imageUrl) {
            console.log('No image URL found');
            throw new Error('Image URL not found');
        }

        console.log('Successfully found image URL:', imageUrl);
        return imageUrl;

    } catch (error) {
        console.error('Error in getInstagramImage:', error.message);
        throw error;
    } finally {
        if (browser) {
            console.log('Closing browser...');
            await browser.close();
        }
    }
}

// Rest of your code remains the same...
// Main endpoint to get Instagram image
app.post('/get-instagram-image', async (req, res) => {
    try {
        const { postUrl } = req.body;
        
        if (!postUrl) {
            console.log('Missing postUrl in request');
            return res.status(400).json({ 
                success: false, 
                error: 'Missing postUrl parameter' 
            });
        }

        console.log('Processing request for URL:', postUrl);
        const imageUrl = await getInstagramImage(postUrl);
        
        if (!imageUrl) {
            console.log('No image URL found');
            return res.status(404).json({ 
                success: false, 
                error: 'Image not found' 
            });
        }

        console.log('Successfully processed request');
        res.json({ 
            success: true, 
            imageUrl 
        });

    } catch (error) {
        console.error('Error processing request:', error.message);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to fetch image',
            details: error.message
        });
    }
});

// Start server
app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Health check available at /health`);
    console.log(`Instagram image scraper available at /get-instagram-image`);
});

// Error handling for uncaught exceptions
process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
});

process.on('unhandledRejection', (error) => {
    console.error('Unhandled Rejection:', error);
});