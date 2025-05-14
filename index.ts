import { chromium } from 'playwright';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

const NODE_ENV = process.env.NODE_ENV || 'development';

// Log the current environment
console.log(`Running in ${process.env.NODE_ENV} environment`);

/**
 * Crawls a single page and extracts title and all links
 * @param url The URL to crawl
 * @returns Object containing page title and array of links
 */
async function crawlPage(url: string): Promise<{ title: string, links: string[] }> {
  // Launch a browser instance
  const browser = await chromium.launch({ headless: NODE_ENV !== 'development' });
  
  try {
    // Create a new page
    const page = await browser.newPage();
    
    // Navigate to the URL
    console.log(`Crawling: ${url}`);
    await page.goto(url, { waitUntil: 'networkidle' });
    
    // Extract title and all links from the page
    const { title, links } = await page.evaluate(() => {
      const title = document.title;
      const anchors = Array.from(document.querySelectorAll('a'));
      const links = anchors
        .map(anchor => anchor.href)
        .filter(href => href && href.startsWith('http'));
      
      return { title, links };
    });
    
    console.log(`Found ${links.length} links on ${url}`);
    return { title, links };
  } finally {
    // Add delay to observe the browser before closing
    if (NODE_ENV === 'development') {
      console.log('Waiting 5 seconds before closing browser...');
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
    // Make sure to close the browser
    await browser.close();
  }
}

/**
 * Validates if a string is a valid URL
 * @param urlString The string to validate
 * @returns True if valid URL, false otherwise
 */
function isValidUrl(urlString: string): boolean {
  try {
    const url = new URL(urlString);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch (error) {
    return false;
  }
}

/**
 * Main function to run the crawler
 */
async function main() {
  const startUrl = process.argv[2] || 'https://google.com';
  
  if (!isValidUrl(startUrl)) {
    console.error(`Invalid URL: ${startUrl}`);
    console.log('Please provide a valid URL starting with http:// or https://');
    process.exit(1);
  }
  
  try {
    const result = await crawlPage(startUrl);
    console.log(`Page title: ${result.title}`);
    console.log('Links found:');
    result.links.forEach((link, index) => {
      console.log(`${index + 1}. ${link}`);
    });
  } catch (error) {
    console.error('Error during crawling:', error);
  }
}

// Run the main function
main().catch(console.error);
