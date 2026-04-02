# Gemini CLI

Gemini CLI is a command-line tool that provides access to Google's Gemini AI models for various development tasks directly from the terminal.

## Features
- Terminal access to Gemini AI models
- Code generation and completion
- Code review and optimization
- Natural language to code conversion

## Installation
1. Install the CLI using npm:
   ```
   npm install -g @google/gemini-cli
   ```
2. Or use npx without installation:
   ```
   npx @google/gemini-cli
   ```

## Configuration
1. Get your API key from Google AI Studio
2. Set the API key as an environment variable:
   ```
   export GEMINI_API_KEY='your-api-key-here'
   ```
3. Or configure using the init command:
   ```
   gemini-cli init
   ```

## Usage
Common usage examples:
```
# Generate code
gemini-cli generate "write a function that..."

# Explain code
gemini-cli explain <file-path>

# Optimize code
gemini-cli optimize <file-path>

# Ask questions about code
gemini-cli ask "How does this algorithm work?" --context <file-path>
```

## Integration with Other CLIs
Gemini CLI can collaborate with other AI CLIs like Claude Code CLI by sharing prompts, context, and responses. See the main CLI directory documentation for coordination strategies.