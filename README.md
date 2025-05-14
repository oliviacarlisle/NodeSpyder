# NodeSpyder
A powerful and efficient web crawler built with Node.js that extracts links, images, and videos from websites.

## Features
- Extracts all links from a given webpage
- Built with Playwright for robust browser automation
- Written in TypeScript for type safety

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

## Usage
```bash
# Build the project
npm run build

# Run the crawler with a default URL (example.com)
npm start

# Run the crawler with a specific URL
npm start -- https://example.com
```

## Development
```bash
# Run the TypeScript compiler in watch mode
npm run dev -- https://example.com
```
