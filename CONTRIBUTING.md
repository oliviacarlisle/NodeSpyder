# Contributing to NodeSpyder

Thank you for your interest in contributing to NodeSpyder! This document provides guidelines and instructions for contributing to this project.

## Code of Conduct

By participating in this project, you agree to maintain a respectful and inclusive environment for everyone. Please be kind and courteous to others, and consider the impact of your actions on the community.

## How to Contribute

### Reporting Bugs

If you find a bug, please create an issue in the GitHub repository with the following information:

1. A clear and descriptive title
2. Steps to reproduce the issue
3. Expected behavior
4. Actual behavior
5. Screenshots if applicable
6. Environment information (OS, Node.js version, etc.)

### Suggesting Enhancements

If you have an idea for an enhancement, please create an issue with the following information:

1. A clear and descriptive title
2. A detailed description of the proposed enhancement
3. Any relevant examples or mockups
4. Why this enhancement would be valuable to the project

### Pull Requests

1. Fork the repository
2. Create a new branch for your feature or bug fix: `git checkout -b feature/your-feature-name` or `bugfix/issue-description`
3. Make your changes and commit them with clear, descriptive commit messages
4. Push your branch to your fork: `git push origin feature/your-feature-name`
5. Open a Pull Request against the main repository

### Development Setup

To set up the development environment:

```bash
# Clone the repository
git clone https://github.com/oliviacarlisle/NodeSpyder.git
cd NodeSpyder

# Install dependencies
npm install

# Install Playwright browsers
npx playwright install
```

### Coding Standards

- Follow the existing code style in the project
- Write clear, descriptive variable and function names
- Add comments for complex sections of code
- Include TypeScript type annotations
- Write tests for new features when applicable

### Commit Message Guidelines

- Use concise, descriptive commit messages
- Start with a verb in the present tense (e.g., "Add feature" not "Added feature")
- Reference issue numbers when applicable

## Project Structure

- `index.ts` - Main entry point for the application
- `output/` - Directory for saved webpage content (not committed to git)
- `.github/` - GitHub-specific files including PR templates

## Review Process

All submissions require review. The maintainers will review your Pull Request and may suggest changes or improvements. Please be responsive to feedback to help get your contributions merged faster.

## Thank You

Your contributions are what make the open-source community such a wonderful place to learn, inspire, and create. We appreciate your time and effort! 