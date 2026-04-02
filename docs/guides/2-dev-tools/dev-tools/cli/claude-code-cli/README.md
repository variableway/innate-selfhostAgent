# Claude Code CLI

Claude Code CLI is a command-line interface that allows developers to interact with Anthropic's Claude AI model for coding tasks directly from the terminal.

## Features
- Terminal-based AI coding assistance
- Context-aware code generation
- Code explanation and debugging
- Integration with file systems

## Installation
1. Ensure you have Node.js installed on your system
2. Install the CLI globally using npm:
   ```
   npm install -g @anthropic/claude-code-cli
   ```
3. Alternatively, you can use npx to run it without installation:
   ```
   npx @anthropic/claude-code-cli
   ```

## Configuration
1. Obtain your API key from Anthropic's console
2. Set the API key as an environment variable:
   ```
   export CLAUDE_API_KEY='your-api-key-here'
   ```
3. Or run the setup command:
   ```
   claude-code-cli setup
   ```

## Usage
Basic usage examples:
```
# Get code explanation
claude-code-cli explain <filename>

# Generate code for a specific purpose
claude-code-cli generate "create a function that..."

# Debug code
claude-code-cli debug <filename>
```

## Integration with Other CLIs
Claude Code CLI can work alongside other AI CLIs by sharing context and exchanging information. See the documentation in the main CLI directory for details on how to coordinate with other AI tools.