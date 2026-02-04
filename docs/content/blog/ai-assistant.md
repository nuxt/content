---
title: Meet the AI Assistant for Docus
description: Introducing the Docus AI Assistant. Instant answers, real-time search, and extensible with custom tools. Setup in seconds with a single environment variable.
seo:
  title: Meet the AI Assistant for Docus | Add AI to Your Documentation
  description: AI-powered documentation search that actually works. Cite sources, generate code, extend with custom tools. Zero infrastructure, just add your API key.
date: 2026-02-04T00:00:00.000Z
category: content
image:
  src: /blog/ai-assistant.png
  alt: Docus AI Assistant Interface
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
---

Documentation is only as valuable as the answers users can extract from it. We're introducing the Docus AI Assistant, a native, embedded chat experience that transforms how developers interact with your documentation.

The AI Assistant searches your content, cites sources with navigable links, and generates code examples users can copy directly. The best part? **It activates with a single environment variable.**

## The Documentation Discovery Problem

Users arrive at your docs with questions, not keywords. They scroll through navigation, guess search terms, and scan pages hoping to find what they need. Even well-organized documentation creates friction between the question in their mind and the answer on the page.

AI changes this dynamic. Instead of adapting their question to your navigation structure, users ask naturally and receive answers grounded in your actual documentation, with links to the source material.

## One Environment Variable, Full AI Integration

Adding AI to documentation typically means building search infrastructure, setting up vector databases, managing embeddings, and maintaining API integrations. Docus eliminates this complexity.

```bash [.env]
AI_GATEWAY_API_KEY=your-api-key
```

That's it. Deploy your docs and the AI Assistant activates automatically. No configuration files, no API setup, no infrastructure changes.

The assistant works through [Vercel AI Gateway](https://vercel.com/docs/ai-gateway), supporting OpenAI, Anthropic, Google, and other providers. Choose your preferred model and budget, the integration remains the same.

::prose-tip{to="https://docus.dev/ai/assistant"}
Read the full setup guide in the Docus documentation.
::

## How It Works: MCP Protocol Integration

The AI Assistant leverages the **Model Context Protocol (MCP)** to give AI models direct access to your documentation. Here's the simple architecture:

1. Docus automatically exposes an **MCP server** at `/mcp` that provides tools to search and retrieve your documentation
2. When you provide an `AI_GATEWAY_API_KEY`, AI models connect to your MCP server
3. The AI uses MCP tools to search your docs in real-time and cite sources accurately

This approach prevents hallucination by grounding every response in actual content. The AI can only answer based on what's in your documentation, and every answer includes source links for verification.

The MCP protocol is an open standard that allows AI models to interact with external data sources through well-defined tools. Docus implements this automatically, you just provide the API key.

## Extend the Assistant with Custom Tools

The real power of the MCP integration is **extensibility**. Docus uses `@nuxtjs/mcp-toolkit`, allowing you to add custom tools that expand what the AI assistant can do beyond just searching documentation.

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

The AI assistant automatically discovers and uses your custom tools. Users can now ask "Is the API down?" and get real-time answers, not just documentation.

### What You Can Add

- **Custom Tools**: Add any capability in `server/mcp/tools/` using `defineMcpTool`
- **Resources**: Expose files or data through `server/mcp/resources/`
- **Prompts**: Create reusable prompt templates in `server/mcp/prompts/`
- **Custom Handlers**: Build separate MCP endpoints for specialized use cases

You can even override built-in tools like `list-pages` or `get-page` to customize how the assistant searches your documentation.

::prose-tip{to="https://docus.dev/ai/mcp#customization"}
Learn more about MCP customization in the Docus documentation.
::

## Built for Developer Workflow

The AI Assistant integrates seamlessly into documentation browsing:

- **Floating Input** (`Cmd/Ctrl+I`): Bottom-of-screen chat accessible via keyboard shortcut
- **Explain with AI Button**: Sidebar button that opens the assistant with current page context
- **Slideover Panel**: Persistent conversation history for continued interaction

Users can ask questions without leaving the page they're reading. The assistant understands the current context and can reference the page you're viewing.

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

Configuration is optional but powerful. Pre-populate common questions, adjust UI visibility, customize keyboard shortcuts, or disable features you don't need.

## Automatic Internationalization

The AI Assistant automatically adapts to your documentation's language settings. All UI text translates based on user locale, and the assistant responds in the user's language.

If your docs support multiple languages, the assistant works across all of them without additional configuration. The same environment variable enables AI for every locale.

## Code Generation

Beyond answering questions, the assistant generates code examples based on your documentation patterns. Users can copy implementations directly from the chat without hunting through example repositories.

The assistant understands your API structure, knows your conventions, and generates examples that match your documentation style.

## Privacy and Control

Your documentation content stays within your control. The AI Assistant queries your published docs, the same content publicly available on your site. No separate indexing, no data collection, no external databases.

You control the AI provider through Vercel AI Gateway, allowing you to choose models based on privacy requirements, latency needs, or cost constraints. Switch providers without changing your documentation code.

## Get Started Today

Add the AI Assistant to your Docus documentation:

```bash
# Get an API key from Vercel AI Gateway
# Add to your .env file
echo "AI_GATEWAY_API_KEY=your-api-key" >> .env

# Deploy - the assistant activates automatically
```

The AI Assistant represents a shift in how developers interact with documentation. Instead of searching for answers, they have a conversation. Instead of parsing examples, they generate code.

::prose-tip{to="https://docus.dev/ai/assistant"}
Read the complete AI Assistant documentation.
::

## What's Next

We're exploring additional AI capabilities across the documentation experience:

- **Contextual Suggestions**: Proactive recommendations based on the current page
- **Code Explanations**: Inline AI explanations for complex code blocks
- **Migration Assistants**: AI-guided version upgrades with automatic code modifications

Documentation is evolving from static reference material into an interactive learning environment. The Docus AI Assistant is the first step.

---

**Ready to add AI to your docs?** The AI Assistant is available now in Docus. Get your API key, set one environment variable, and ship.
