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
  "price": 19.99,        // The numeric price value (number)
  "currency": "USD",     // The currency code (string)
  "confidence": 0.95     // Confidence level from 0-1 (number)
}
```

If no price is found, the fields will be `null` for price and currency, with a confidence of 0.

## Development
```bash
# Run the TypeScript compiler in watch mode
npm run dev -- https://example.com
```

## Contributing
Contributions are welcome! Please read the [contributing guidelines](CONTRIBUTING.md) for details on how to contribute to this project.
