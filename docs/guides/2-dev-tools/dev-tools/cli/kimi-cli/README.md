# Kimi CLI

Kimi CLI provides command-line access to Moonshot AI's Kimi model, offering AI-powered coding assistance directly from the terminal.

## Features
- Terminal-based access to Kimi AI model
- Long-context code understanding
- Multi-language code generation
- Code translation and refactoring

## Installation
1. Install using npm:
   ```
   npm install -g @moonshot/kimi-cli
   ```
2. Or run directly with npx:
   ```
   npx @moonshot/kimi-cli
   ```

## Configuration
1. Get your API key from Moonshot AI platform
2. Set the API key as an environment variable:
   ```
   export KIMI_API_KEY='your-api-key-here'
   ```
3. Or initialize with the setup command:
   ```
   kimi-cli setup
   ```

## Usage
Common commands:
```
# Generate code based on description
kimi-cli create "implement a REST API endpoint for user management"

# Translate code to another language
kimi-cli translate <file> --target-language python

# Refactor existing code
kimi-cli refactor <file> "optimize for performance"

# Analyze code quality
kimi-cli analyze <file>
```

## Integration with Other CLIs
Kimi CLI can complement other AI CLIs by providing unique long-context understanding capabilities. See the main CLI directory documentation for coordination approaches with other AI tools.