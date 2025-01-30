# UseScraper MCP Server

[![smithery badge](https://smithery.ai/badge/usescraper-server)](https://smithery.ai/server/usescraper-server)
This is a TypeScript-based MCP server that provides web scraping capabilities using the UseScraper API. It exposes a single tool 'scrape' that can extract content from web pages in various formats.

<a href="https://glama.ai/mcp/servers/oqq8he02cy"><img width="380" height="200" src="https://glama.ai/mcp/servers/oqq8he02cy/badge" alt="UseScraper Server MCP server" /></a>


## Features

### Tools
- `scrape` - Extract content from a webpage
  - **Parameters**:
    - `url` (required): The URL of the webpage to scrape
    - `format` (optional): The format to save the content (text, html, markdown). Default: markdown
    - `advanced_proxy` (optional): Use advanced proxy to circumvent bot detection. Default: false
    - `extract_object` (optional): Object specifying data to extract

## Installation

### Installing via Smithery

To install UseScraper for Claude Desktop automatically via [Smithery](https://smithery.ai/server/usescraper-server):

```bash
npx -y @smithery/cli install usescraper-server --client claude
```

### Manual Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/your-repo/usescraper-server.git
   cd usescraper-server
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Build the server:
   ```bash
   npm run build
   ```

## Configuration

To use with Claude Desktop, add the server config:

On MacOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
On Windows: `%APPDATA%/Claude/claude_desktop_config.json`

```json
{
  "mcpServers": {
    "usescraper-server": {
      "command": "node",
      "args": ["/path/to/usescraper-server/build/index.js"],
      "env": {
        "USESCRAPER_API_KEY": "your-api-key-here"
      }
    }
  }
}
```

Replace `/path/to/usescraper-server` with the actual path to the server and `your-api-key-here` with your UseScraper API key.

## Usage

Once configured, you can use the 'scrape' tool through the MCP interface. Example usage:

```json
{
  "name": "scrape",
  "arguments": {
    "url": "https://example.com",
    "format": "markdown"
  }
}
```

## Development

For development with auto-rebuild:
```bash
npm run watch
```

### Debugging

Since MCP servers communicate over stdio, debugging can be challenging. We recommend using the [MCP Inspector](https://github.com/modelcontextprotocol/inspector), which is available as a package script:

```bash
npm run inspector
```

The Inspector will provide a URL to access debugging tools in your browser.
