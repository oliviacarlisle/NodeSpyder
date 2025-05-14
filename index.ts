import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { crawlPage, extractProductPrice, extractProductImages, saveHtmlContent, isValidUrl } from './src/utilities.js';

// Load environment variables from .env file
dotenv.config();

const NODE_ENV = process.env.NODE_ENV || 'development';

// Log the current environment
console.log(`Running in ${NODE_ENV} environment`);

/**
 * Measures and logs execution time of an async function
 * @param fn The async function to measure
 * @param label A label for logging the execution time
 * @returns The result of the function
 */
async function measureTime<T>(fn: () => Promise<T>, label: string): Promise<T> {
  const startTime = Date.now();
  try {
    return await fn();
  } finally {
    const endTime = Date.now();
    const executionTime = (endTime - startTime) / 1000; // Convert to seconds
    console.log(`${label} execution time: ${executionTime.toFixed(2)} seconds`);
  }
}

/**
 * Main function to run the crawler
 */
async function main() {
  // Get the URL from command line arguments
  const startUrl = process.argv[2] || 'https://google.com';
  
  // Validate URL
  if (!isValidUrl(startUrl)) {
    console.error(`Invalid URL: ${startUrl}`);
    console.log('Please provide a valid URL starting with http:// or https://');
    process.exit(1);
  }
  
  try {
    // Crawl the webpage
    console.log(`Starting crawl of ${startUrl}`);
    const result = await crawlPage(startUrl);
    
    console.log(`Page title: ${result.title}`);
    console.log(`Found ${result.links.length} links on ${startUrl}`);
    
    
    // Extract product price using OpenAI
    console.log('Extracting price data...');
    const priceData = await measureTime(
      async () => extractProductPrice(result.bodyContent),
      'Price extraction'
    );
    console.log('Extracted price data:');
    console.log(JSON.stringify(priceData, null, 2));
    
    // Extract product images using OpenAI
    console.log('Extracting image data...');
    const imageData = await measureTime(
      async () => extractProductImages(result.bodyContent),
      'Image extraction'
    );
    console.log('Extracted image data:');
    console.log(JSON.stringify(imageData, null, 2));
    
    // Save the body content to a file
    const savedFilePath = await saveHtmlContent(startUrl, result.bodyContent);
    console.log(`Body content saved to ${savedFilePath}`);
    
    // Save the extracted price data to a JSON file
    const outputDir = path.join(process.cwd(), 'output');
    const hostname = new URL(startUrl).hostname;
    const timestamp = new Date().toISOString().replace(/:/g, '-');
    const jsonFilename = `${hostname}-${timestamp}-data.json`;
    const jsonFilePath = path.join(outputDir, jsonFilename);
    
    // Create a combined object with both price data, image data and links
    const combinedData = {
      url: startUrl,
      title: result.title,
      priceData,
      imageData,
      links: result.links
    };
    
    await fs.promises.writeFile(jsonFilePath, JSON.stringify(combinedData, null, 2), 'utf8');
    console.log(`Page data saved to ${jsonFilePath}`);
  } catch (error) {
    console.error('Error during execution:', error);
  }
}

// Run the main function
main().catch(console.error);
