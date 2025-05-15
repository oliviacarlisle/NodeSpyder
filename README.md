# NodeSpyder
A powerful and efficient web crawler built with Node.js that extracts links, images, and videos from websites. Now includes AI-powered product price extraction!

> **Note:** This project is currently under active development and is not yet production ready.

## Features
- Extracts all links from a given webpage
- Built with Playwright for robust browser automation
- Written in TypeScript for type safety
- Uses OpenAI's GPT models to extract product pricing from pages
- Returns structured JSON data with price information

## Installation
```bash
# Clone the repository
git clone https://github.com/oliviacarlisle/NodeSpyder.git
cd NodeSpyder

# Install dependencies
npm install

# Install Playwright browsers
npx playwright install
```

## Environment Setup
Create a `.env` file in the root directory with your OpenAI API key:
```
NODE_ENV=development
OPENAI_API_KEY=your_openai_api_key_here
```

## Usage
```bash
# Build the project
npm run build

# Run the crawler with a default URL (google.com)
npm start

# Run the crawler with a specific URL
npm start -- https://example.com
```

### Price Extraction
The tool uses OpenAI's GPT-4.1-mini model to extract product pricing information from HTML content. The extracted data is returned in JSON format with the following structure:

```json
{
  "currentPrice": 19.99,    // The current/reduced/sale price (number)
  "originalPrice": 29.99,   // The original/full price (number)
  "currency": "USD",        // The currency code (string)
  "onSale": true,           // Whether the product is on sale (boolean)
  "confidence": 0.95        // Confidence level from 0-1 (number)
}
```

If no price is found, the fields will be `null` for price and currency, with a confidence of 0.

### Image Extraction
The tool also extracts product images from HTML content using OpenAI's GPT-4.1-nano model, returning URLs and content types.

## Example Output
Here's an example of the full JSON output from crawling a product page:

```json
{
  "url": "https://www.thereformation.com/products/everett-linen-dress/1317269RDE.html?dwvar_1317269RDE_color=RDE",
  "title": "Everett Linen Dress",
  "description": "Wear me. Shop the Everett Linen Dress from Reformation, a sleeveless midi dress with a square neckline, fitted bust, relaxed skirt, and embroidery detailing.",
  "timestamp": "2025-05-15T02:13:55.421Z",
  "priceData": {
    "currentPrice": 298,
    "originalPrice": 298,
    "currency": "USD",
    "onSale": false,
    "confidence": 1
  },
  "imageData": {
    "productImages": [
      {
        "url": "https://media.thereformation.com/image/upload/f_auto,q_auto,dpr_1.0/w_800,c_scale//PRD-SFCC/1317269/RADIANCE/1317269.1.RADIANCE?_s=RAABAB0",
        "contentType": "image/jpeg"
      },
      {
        "url": "https://media.thereformation.com/image/upload/f_auto,q_auto:eco,dpr_auto/w_500/PRD-SFCC/1317269/RADIANCE/1317269.2.RADIANCE?_s=RAABAB0",
        "contentType": "image/jpeg"
      },
      {
        "url": "https://media.thereformation.com/image/upload/f_auto,q_auto:eco,dpr_auto/w_500/PRD-SFCC/1317269/RADIANCE/1317269.3.RADIANCE?_s=RAABAB0",
        "contentType": "image/jpeg"
      },
      {
        "url": "https://media.thereformation.com/image/upload/f_auto,q_auto:eco,dpr_auto/w_500/PRD-SFCC/1317269/RADIANCE/1317269.4.RADIANCE?_s=RAABAB0",
        "contentType": "image/jpeg"
      }
    ],
    "confidence": 1
  },
  "links": [
    "https://www.thereformation.com/products/everett-linen-dress/1317269RDE.html?dwvar_1317269RDE_color=RDE#main",
    "https://www.thereformation.com/stores.html",
    "https://www.thereformation.com/new",
    // ... additional links truncated for brevity
  ]
}
```

## Development
```bash
# Run the TypeScript compiler in watch mode
npm run dev -- https://example.com
```

## Contributing
Contributions are welcome! Please read the [contributing guidelines](CONTRIBUTING.md) for details on how to contribute to this project.
