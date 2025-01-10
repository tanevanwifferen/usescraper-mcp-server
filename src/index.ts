#!/usr/bin/env node

/**
 * UseScraper MCP Server
 * This server provides tools to scrape websites using the UseScraper API.
 * It exposes a single tool 'scrape' that accepts a URL and optional parameters
 * to extract content from web pages in various formats (text, html, markdown).
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from '@modelcontextprotocol/sdk/types.js';
import axios from 'axios';

const API_KEY = process.env.USESCRAPER_API_KEY;
if (!API_KEY) {
  throw new Error('USESCRAPER_API_KEY environment variable is required');
}

interface ScrapeArgs {
  url: string;
  format?: 'text' | 'html' | 'markdown';
  advanced_proxy?: boolean;
  extract_object?: Record<string, any>;
}

const isScrapeArgs = (args: any): args is ScrapeArgs =>
  typeof args === 'object' &&
  args !== null &&
  typeof args.url === 'string' &&
  (args.format === undefined ||
    ['text', 'html', 'markdown'].includes(args.format)) &&
  (args.advanced_proxy === undefined ||
    typeof args.advanced_proxy === 'boolean') &&
  (args.extract_object === undefined ||
    (typeof args.extract_object === 'object' &&
      args.extract_object !== null));

class UseScraperServer {
  private server: Server;
  private axiosInstance;

  constructor() {
    this.server = new Server(
      {
        name: 'usescraper-server',
        version: '0.1.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.axiosInstance = axios.create({
      baseURL: 'https://api.usescraper.com/scraper',
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    this.setupToolHandlers();
    
    // Error handling
    this.server.onerror = (error) => console.error('[MCP Error]', error);
    process.on('SIGINT', async () => {
      await this.server.close();
      process.exit(0);
    });
  }

  private setupToolHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        {
          name: 'scrape',
          description: 'Scrape content from a webpage using UseScraper API',
          inputSchema: {
            type: 'object',
            properties: {
              url: {
                type: 'string',
                description: 'URL to scrape',
              },
              format: {
                type: 'string',
                enum: ['text', 'html', 'markdown'],
                description: 'Format to save crawled page content. Strongly recommended to keep as markdown for optimal AI processing (default: markdown)',
              },
              advanced_proxy: {
                type: 'boolean',
                description: 'Use advanced proxy to circumvent bot detection (default: false)',
              },
              extract_object: {
                type: 'object',
                description: 'Optional object specifying data to extract',
              },
            },
            required: ['url'],
          },
        },
      ],
    }));

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      if (request.params.name !== 'scrape') {
        throw new McpError(
          ErrorCode.MethodNotFound,
          `Unknown tool: ${request.params.name}`
        );
      }

      if (!isScrapeArgs(request.params.arguments)) {
        throw new McpError(
          ErrorCode.InvalidParams,
          'Invalid scrape arguments'
        );
      }

      try {
        const response = await this.axiosInstance.post('/scrape', {
          url: request.params.arguments.url,
          format: request.params.arguments.format || 'markdown',
          advanced_proxy: request.params.arguments.advanced_proxy || false,
          extract_object: request.params.arguments.extract_object || {},
        });

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(response.data, null, 2),
            },
          ],
        };
      } catch (error) {
        if (axios.isAxiosError(error)) {
          return {
            content: [
              {
                type: 'text',
                text: `UseScraper API error: ${
                  error.response?.data?.message ?? error.message
                }`,
              },
            ],
            isError: true,
          };
        }
        throw error;
      }
    });
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('UseScraper MCP server running on stdio');
  }
}

const server = new UseScraperServer();
server.run().catch(console.error);
