# Codex CLI

Codex CLI provides command-line access to OpenAI's Codex model, enabling developers to generate, explain, and optimize code directly from the terminal.

## Features
- Command-line access to Codex AI model
- Code generation from natural language
- Code completion and suggestions
- Code analysis and debugging

## Installation
1. Install the CLI globally:
   ```
   npm install -g @openai/codex-cli
   ```
2. Alternative usage without installation:
   ```
   npx @openai/codex-cli
   ```

## Configuration
1. Obtain your OpenAI API key from the dashboard
2. Set the API key as an environment variable:
   ```
   export OPENAI_API_KEY='your-api-key-here'
   ```
3. Or run the configuration command:
   ```
   codex-cli configure
   ```

## Usage
Common commands:
```
# Generate code from description
codex-cli generate "function to calculate factorial"

# Complete code from partial input
codex-cli complete <partial-file>

# Explain existing code
codex-cli explain <file-path>

# Fix bugs in code
codex-cli fix <buggy-file> "The function throws an error when input is zero"
```

## Integration with Other CLIs
Codex CLI can work in conjunction with other AI CLIs to leverage different strengths of various models. See the main CLI directory documentation for best practices on coordinating multiple AI tools.