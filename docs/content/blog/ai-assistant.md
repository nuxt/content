---
title: Meet the AI Assistant for Docus
authors:
  - name: Hugo Richard
    avatar:
      src: https://avatars.githubusercontent.com/u/71938701?v=4
    to: https://x.com/hugorcd
    username: hugorcd
  - name: Baptiste Leproux
    avatar:
      src: https://avatars.githubusercontent.com/u/7290030?v=4
    to: https://x.com/_larbish
    username: larbish
categories: []
category: docus
date: 2026-02-04T00:00:00.000Z
description: Setup your assistant in seconds with a single environment variable. Fast and real-time search. Make it yours with custom tools.
draft: false
image:
  src: /blog/docus-assistant.png
  alt: Docus AI Assistant Interface
seo:
  title: Meet the AI Assistant for Docus | Add AI to Your Documentation
  description: AI-powered documentation search that actually works. Generate code, extend with custom tools. Zero infrastructure, just add your API key.
---

Documentation is only as valuable as the answers users can extract from it. We're introducing the Docus AI Assistant, a native, embedded chat experience that transforms how developers interact with your documentation.

The AI Assistant searches your content and generates code examples users can copy directly. The best part? **It activates with a single environment variable.**

:video{.w-full.h-auto.rounded-md autoplay controls loop muted playsinline src="https://res.cloudinary.com/nuxt/video/upload/v1770204403/studio/docus-assistant_e8xmxu.mp4"}

## The Documentation Discovery Problem

Users arrive at your docs with questions, not keywords. They scroll through navigation, guess search terms, and scan pages hoping to find what they need. Even well-organized documentation creates friction between the question in their mind and the answer on the page.

AI changes this dynamic. Instead of adapting their question to your navigation structure, users ask naturally and receive answers grounded in your actual documentation.

## Activation With One Environment Variable

Docus abstracts the AI setup complexity and enables your own AI assistant chat with one environment variable.

```bash [.env]
AI_GATEWAY_API_KEY=your-api-key
```

::note
The AI Assistant requires a **Vercel AI Gateway API key** (Vercel account needed) or zero config if you deploy to Vercel. Test it for free with $5 credits offer!
::

That's it. Deploy your docs and the AI Assistant activates automatically. No configuration files, no API setup, no infrastructure changes.

The assistant works through [Vercel AI Gateway](https://vercel.com/docs/ai-gateway), supporting OpenAI, Anthropic, Google, and other providers. Choose your preferred model and budget, the integration remains the same.

::prose-tip{to="https://docus.dev/en/ai/assistant#quick-start"}
Read the full setup guide in the Docus documentation.
::

## How It Works

### MCP Integration

The AI Assistant leverages the **Model Context Protocol (MCP)** to give AI models direct access to your documentation. Here's the simple architecture:

1. Docus automatically exposes an **MCP server** at `/mcp` that provides tools to search and retrieve your documentation
2. When you provide an `AI_GATEWAY_API_KEY`, AI models connect to your MCP server
3. The AI uses MCP tools to search your docs in real-time and provide accurate answers

This approach prevents hallucination by grounding every response in actual content. The AI can only answer based on what's in your documentation.

The MCP protocol is an open standard that allows AI models to interact with external data sources through well-defined tools. Docus implements this automatically, you just provide the API key.

### AI Customization

The real power of the MCP integration is **extensibility**. Docus uses `@nuxtjs/mcp-toolkit` under the hood. It allows to add custom tools that expand what the AI assistant can do beyond just searching documentation.

Want your AI to check API status, fetch live data, run code examples, or interact with your own services? Add custom MCP tools in your project:

```typescript [server/mcp/tools/check-api-status.ts]
export default defineMcpTool({
  description: 'Check the current status of the API',
  inputSchema: z.object({
    endpoint: z.string().describe('API endpoint to check')
  }),
  handler: async ({ endpoint }) => {
    const status = await checkEndpointStatus(endpoint)
    return {
      content: [{
        type: 'text',
        text: `API endpoint ${endpoint} is ${status}`
      }]
    }
  }
})
```

The AI assistant automatically discovers and uses your custom tools. Users can now ask **"Is the API down?"** and get real-time answers, not just documentation.

::note
You can override different aspects of your AI assistant with:

- **Custom Tools**: add any capability in `server/mcp/tools/` using `defineMcpTool`
- **Resources**: expose files or data through `server/mcp/resources/`
- **Prompts**: create reusable prompt templates in `server/mcp/prompts/`
- **Custom Handlers**: build separate MCP endpoints for specialized use cases
::

::prose-tip{to="https://docus.dev/ai/mcp#customization"}
Learn more about MCP customization in the Docus documentation.
::

### Questions Configuration

Users can ask questions without leaving the page they're reading. The assistant understands the current context and can reference the page you're viewing.

Configuration is optional but powerful. Pre-populate common questions, adjust UI visibility, customize keyboard shortcuts, or disable features you don't need in the `app.config.ts` file.

```typescript [app.config.ts]
export default defineAppConfig({
  docus: {
    ai: {
      floatingInput: true,
      explainWithAI: true,
      faqs: [
        {
          question: 'How do I install Docus?',
          category: 'Getting Started'
        },
        {
          question: 'Can I customize the theme?',
          category: 'Customization'
        }
      ]
    }
  }
})
```

### Internationalization

The AI Assistant automatically adapts to your documentation's language settings. All UI text translates based on user locale, and the assistant responds in the user's language.

If your docs support multiple languages, the assistant works across all of them without additional configuration. The same environment variable enables AI for every locale.

## Key Benefits

### Built for Developers

The AI Assistant integrates with how developers browse documentation:

- **Floating Input** (`Cmd/Ctrl+I`): Bottom-of-screen chat accessible via keyboard shortcut
- **Explain with AI Button**: Sidebar button that opens the assistant with current page context
- **Slideover Panel**: Persistent conversation history for continued interaction

### Code Generation

Beyond answering questions, the assistant generates code examples based on your documentation patterns. Users can copy implementations directly from the chat without hunting through example repositories.

The assistant understands your API structure, knows your conventions, and generates examples that match your documentation style.

### Privacy and Control

Your documentation content stays within your control. The AI Assistant queries your published docs, the same content publicly available on your site. No separate indexing, no data collection, no external databases.

You control the AI provider through Vercel AI Gateway, allowing you to choose models based on privacy requirements, latency needs, or cost constraints. Switch providers without changing your documentation code.

## Get Started Today

::prose-tip
**New to Docus?** Create a complete documentation site with AI assistant built-in:

```bash
npx skills add nuxt-content/docus
```

Then run `/create-docs` in your AI agent (Claude, Cursor, or any agent supporting skills) to generate everything automatically.
::

Already have a Docus site? Add the AI Assistant with one environment variable:

```bash [.env]
AI_GATEWAY_API_KEY=your-api-key
```

Deploy and the assistant activates automatically.

The AI Assistant represents a shift in how developers interact with documentation. Instead of searching for answers, they have a conversation. Instead of parsing examples, they generate code.

::prose-tip{to="https://docus.dev/ai/assistant"}
Read the complete AI Assistant documentation.
::

## What's Next

We're constantly exploring new ways to make documentation more interactive and helpful. The AI Assistant is just the beginning of what's possible when you combine great documentation with intelligent tooling.

Documentation is evolving from static reference material into an interactive learning environment, and we're excited to see where this journey takes us.
