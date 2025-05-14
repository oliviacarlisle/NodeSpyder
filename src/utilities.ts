import { chromium, BrowserContextOptions } from 'playwright';
import fs from 'fs';
import path from 'path';
import OpenAI from 'openai';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Crawls a single page and extracts title, links, and body content
 * @param url The URL to crawl
 * @returns Object containing page title, array of links, and body content
 */
export async function crawlPage(url: string): Promise<{ title: string, links: string[], bodyContent: string }> {
  // Launch a browser instance
  const browser = await chromium.launch({ 
    headless: process.env.NODE_ENV !== 'development', 
    args: [
      '--disable-blink-features=AutomationControlled',  // hides webdriver flag
    ]
  });

  // baseline context options
  const contextOpts: BrowserContextOptions = {
    viewport: { width: 1366, height: 768 },
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36',
    locale: 'en-US',
    timezoneId: 'America/New_York',
    javaScriptEnabled: true,
  };

  const context = await browser.newContext(contextOpts);
  // Create a new page
  const page = await context.newPage();

  await page.addInitScript(() => {
    // 1. navigator.webdriver → false
    Object.defineProperty(navigator, 'webdriver', {
      get: () => false,
    });

    // 2. Fake a consistent WebGL fingerprint
    const getParameter = WebGLRenderingContext.prototype.getParameter;
    WebGLRenderingContext.prototype.getParameter = function(parameter) {
      // return a constant for UNMASKED_VENDOR_WEBGL & UNMASKED_RENDERER_WEBGL
      if (parameter === 37445) return 'Google Inc. (Apple)';  
      if (parameter === 37446) return 'ANGLE (Apple, ANGLE Metal Renderer: Apple M4 Max, Unspecified Version)';
      return getParameter.call(this, parameter);
    };

    Object.defineProperty(navigator, 'languages', {
      get: () => ['en-US', 'en'],
    });
  });

  try {

    // Navigate to the URL
    console.log(`Crawling: ${url}`);
    await page.goto(url, { waitUntil: 'load' });

    try {
      await page.waitForLoadState('networkidle', { timeout: 5000 });
      console.log('networkidle happened!');
    } catch (e) {
      console.log('networkidle did not happen within 5 s');
    }
    
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
    if (process.env.NODE_ENV === 'development') {
      console.log('Waiting 5 seconds before closing browser...');
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
    // Make sure to close the browser
    await browser.close();
  }
}

/**
 * Extracts product price from HTML content using OpenAI
 * @param bodyContent The HTML content to analyze
 * @returns JSON object with extracted price information
 */
export async function extractProductPrice(bodyContent: string): Promise<any> {
 
  // Log original length
  console.log('Original bodyContent length:', bodyContent.length);
 
  // First trim the string to remove whitespace from beginning and end
  bodyContent = bodyContent.trim();
  
  // Remove excessive whitespace and newlines (collapse multiple spaces to single space)
  bodyContent = bodyContent.replace(/\s+/g, ' ');
 
  // Log cleaned length
  console.log('Cleaned bodyContent length:', bodyContent.length);
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [
        {
          role: "system",
          content: `You are a helpful assistant that extracts product pricing information from HTML content.
Extract the information according to this JSON schema:
{
  "type": "object",
  "properties": {
    "currentPrice": { 
      "type": ["number", "null"],
      "description": "The current/reduced/sale price without currency symbol (e.g., 19.99)" 
    },
    "originalPrice": { 
      "type": ["number", "null"],
      "description": "The original/full price without currency symbol (e.g., 29.99), same as currentPrice if no discount" 
    },
    "currency": { 
      "type": ["string", "null"],
      "description": "The currency code (e.g., 'USD', 'EUR', 'GBP')" 
    },
    "onSale": { 
      "type": "boolean",
      "description": "Whether the product appears to be on sale/discount" 
    },
    "confidence": { 
      "type": "number",
      "description": "A value between 0 and 1 indicating confidence in the extraction" 
    }
  },
  "required": ["currentPrice", "originalPrice", "currency", "onSale", "confidence"]
}

If no price is found, return currentPrice and originalPrice as null, currency as null, onSale as false, and confidence as 0.`
        },
        {
          role: "user",
          content: `Extract the product pricing information as JSON from this HTML content: ${bodyContent.substring(0, Math.min(1000000, bodyContent.length))}`
        }
      ],
      response_format: { type: "json_object" }
    });
    
    // Log token usage information
    console.log('Token usage:', {
      promptTokens: response.usage?.prompt_tokens || 0,
      completionTokens: response.usage?.completion_tokens || 0,
      totalTokens: response.usage?.total_tokens || 0
    });
    
    console.log('Price extraction completed');
    const content = response.choices[0].message.content || '{}';
    return JSON.parse(content);
  } catch (error) {
    console.error('Error extracting product price:', error);
    return { 
      currentPrice: null,
      originalPrice: null,
      currency: null,
      onSale: false,
      confidence: 0,
      error: String(error)
    };
  }
}

/**
 * Extracts product images from HTML content using OpenAI
 * @param bodyContent The HTML content to analyze
 * @returns JSON object with extracted image information
 */
export async function extractProductImages(bodyContent: string): Promise<any> {
  // Log original length
  console.log('Original bodyContent length:', bodyContent.length);
 
  // Trim and clean the content
  bodyContent = bodyContent.trim();
  bodyContent = bodyContent.replace(/\s+/g, ' ');
 
  // Log cleaned length
  console.log('Cleaned bodyContent length:', bodyContent.length);

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4.1-nano",
      messages: [
        {
          role: "system",
          content: `You are a helpful assistant that extracts product image information from HTML content.
Extract the information according to this JSON schema:
{
  "type": "object",
  "properties": {
    "productImages": { 
      "type": "array",
      "items": { "type": "string" },
      "description": "Array of URLs for all product images, including the main product image and additional gallery images" 
    },
    "confidence": { 
      "type": "number",
      "description": "A value between 0 and 1 indicating confidence in the extraction" 
    }
  },
  "required": ["productImages", "confidence"]
}

If no images are found, return an empty array for productImages and confidence as 0.`
        },
        {
          role: "user",
          content: `Extract the product image information as JSON from this HTML content: ${bodyContent.substring(0, Math.min(1000000, bodyContent.length))}`
        }
      ],
      response_format: { type: "json_object" }
    });
    
    // Log token usage information
    console.log('Token usage:', {
      promptTokens: response.usage?.prompt_tokens || 0,
      completionTokens: response.usage?.completion_tokens || 0,
      totalTokens: response.usage?.total_tokens || 0
    });
    
    console.log('Image extraction completed');
    const content = response.choices[0].message.content || '{}';
    const extractedData = JSON.parse(content);
    
    // Validate and enhance image information
    const validatedImages = [];
    if (extractedData.productImages && Array.isArray(extractedData.productImages)) {
      // Process each image URL
      const imagePromises = extractedData.productImages.map((url: string) => verifyImageUrl(url));
      const imageResults = await Promise.all(imagePromises);
      
      // Filter and map the results
      for (let i = 0; i < extractedData.productImages.length; i++) {
        const url = extractedData.productImages[i];
        const verification = imageResults[i];
        
        if (verification.isImage) {
          validatedImages.push({
            url: url,
            contentType: verification.contentType
          });
        }
      }
    }
    
    // Return the enhanced result
    return {
      productImages: validatedImages,
      confidence: extractedData.confidence || 0
    };
  } catch (error) {
    console.error('Error extracting product images:', error);
    return { 
      productImages: [],
      confidence: 0,
      error: String(error)
    };
  }
}

/**
 * Saves body content to a file
 * @param url The URL that was crawled
 * @param bodyContent The body content to save
 * @returns Path to the saved file
 */
export async function saveHtmlContent(url: string, bodyContent: string): Promise<string> {
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
export function isValidUrl(urlString: string): boolean {
  try {
    const url = new URL(urlString);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch (error) {
    return false;
  }
}

/**
 * Verifies if a URL points to an image by checking the Content-Type header
 * @param url The URL to verify
 * @returns Object containing verification result and content type if available
 */
export async function verifyImageUrl(url: string): Promise<{ isImage: boolean, contentType: string | null, error?: string }> {
  try {
    // Check if the URL is valid first
    if (!isValidUrl(url)) {
      return { isImage: false, contentType: null, error: 'Invalid URL format' };
    }

    // Make a HEAD request to check headers without downloading the entire resource
    const response = await fetch(url, { method: 'HEAD' });
    
    if (!response.ok) {
      return { 
        isImage: false, 
        contentType: null, 
        error: `HTTP error: ${response.status} ${response.statusText}` 
      };
    }
    
    // Get the Content-Type header
    const contentType = response.headers.get('Content-Type');
    
    // Check if the content type indicates an image
    const isImage = contentType ? contentType.startsWith('image/') : false;
    
    return {
      isImage,
      contentType,
      error: isImage ? undefined : 'URL does not point to an image'
    };
  } catch (error) {
    return {
      isImage: false,
      contentType: null,
      error: `Error verifying image URL: ${error instanceof Error ? error.message : String(error)}`
    };
  }
} 

