import { chromium } from 'playwright';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

// Load environment variables from .env file
dotenv.config();

const NODE_ENV = process.env.NODE_ENV || 'development';

// Log the current environment
console.log(`Running in ${process.env.NODE_ENV} environment`);

/**
 * Crawls a single page and extracts title, links, and body content
 * @param url The URL to crawl
 * @returns Object containing page title, array of links, and body content
 */
async function crawlPage(url: string): Promise<{ title: string, links: string[], bodyContent: string }> {
  // Launch a browser instance
  const browser = await chromium.launch({ headless: NODE_ENV !== 'development' });
  
  try {
    // Create a new page
    const page = await browser.newPage();
    
    // Navigate to the URL
    console.log(`Crawling: ${url}`);
    await page.goto(url, { waitUntil: 'networkidle' });
    
    // Extract title, links, and body content from the page
    const { title, links, bodyContent } = await page.evaluate(() => {
      const title = document.title;
      const anchors = Array.from(document.querySelectorAll('a'));
      const links = anchors
        .map(anchor => anchor.href)
        .filter(href => href && href.startsWith('http'));
      
      // Get only the body content
      const bodyContent = document.body.innerHTML;
      
      return { title, links, bodyContent };
    });
    
    console.log(`Found ${links.length} links on ${url}`);
    return { title, links, bodyContent };
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
 * Saves body content to a file
 * @param url The URL that was crawled
 * @param bodyContent The body content to save
 * @returns Path to the saved file
 */
async function saveHtmlContent(url: string, bodyContent: string): Promise<string> {
  // Create output directory if it doesn't exist
  const outputDir = path.join(process.cwd(), 'output');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  // Create a filename based on the URL
  const hostname = new URL(url).hostname;
  const timestamp = new Date().toISOString().replace(/:/g, '-');
  const filename = `${hostname}-${timestamp}.html`;
  const filePath = path.join(outputDir, filename);
  
  // Write the body content to the file
  await fs.promises.writeFile(filePath, bodyContent, 'utf8');
  
  console.log(`Body content saved to ${filePath}`);
  return filePath;
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
    
    // Save the body content to a file
    await saveHtmlContent(startUrl, result.bodyContent);
  } catch (error) {
    console.error('Error during crawling:', error);
  }
}

// Run the main function
main().catch(console.error);
