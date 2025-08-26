# Enhanced URL Processing with Firecrawl Integration

This document describes the enhanced URL processing feature that uses Firecrawl to extract formatted markdown content and generate AI summaries from websites.

## Features

### 1. Firecrawl Integration
- **Advanced Web Scraping**: Uses Firecrawl API for superior content extraction
- **Markdown Formatting**: Automatically converts web content to properly formatted markdown
- **Enhanced Metadata**: Extracts comprehensive metadata including author, publish date, keywords, etc.
- **Fallback Support**: Gracefully falls back to basic scraping if Firecrawl is unavailable

### 2. AI-Powered Summaries
- **Multi-Provider Support**: Works with OpenAI, Anthropic, Google AI, and Groq
- **Intelligent Summaries**: Generates concise, relevant summaries of web content
- **Configurable Options**: Supports different focus areas (technical, general, business, academic)
- **Error Handling**: Provides meaningful feedback when summary generation fails

### 3. Enhanced User Interface
- **Rich Display**: Shows processing status, AI summaries, and formatted content
- **Expandable Content**: Users can view formatted markdown content in collapsible sections
- **Status Indicators**: Clear visual feedback on processing status
- **Error Messages**: Detailed error information when processing fails

## Setup Instructions

### 1. Configure Firecrawl API Key
1. Sign up for a Firecrawl account at [firecrawl.dev](https://firecrawl.dev)
2. Get your API key from the dashboard
3. In Curiso.ai, go to Settings → API Keys
4. Enter your Firecrawl API key (format: `fc-...`)

### 2. Configure AI Provider
For AI summaries to work, you need at least one AI provider configured:
- **OpenAI**: Recommended for best results
- **Anthropic**: Good alternative with Claude models
- **Google AI**: Free tier available with Gemini
- **Groq**: Fast inference with Llama models

## Usage

### Adding a Website
1. Navigate to Settings → RAG
2. Ensure RAG is enabled
3. Enter a website URL in the input field
4. Click "Add Website"
5. Wait for processing to complete

### Processing Steps
1. **Firecrawl Processing**: Extracts content and converts to markdown
2. **AI Summary Generation**: Creates an intelligent summary
3. **Content Chunking**: Splits content for vector storage
4. **Embedding Generation**: Creates embeddings for RAG search

### Viewing Results
- **Status Badge**: Shows completion status (completed/processing/error)
- **AI Summary**: Displayed in blue highlight box
- **Formatted Content**: Expandable section showing markdown
- **Metadata**: URL, title, description, and processing date

## Error Handling

### Common Issues and Solutions

#### Firecrawl API Errors
- **Invalid API Key**: Check your Firecrawl API key in settings
- **Rate Limiting**: Wait before processing more URLs
- **Invalid URL**: Ensure the URL is accessible and properly formatted

#### AI Summary Failures
- **No API Key**: Configure at least one AI provider in settings
- **API Errors**: Check API key validity and account status
- **Content Too Long**: Large pages may exceed token limits

#### Network Issues
- **Connection Timeout**: Check internet connection
- **Blocked Domains**: Some websites may block automated access
- **CORS Errors**: Use Firecrawl for better compatibility

### Fallback Behavior
1. If Firecrawl fails → Falls back to basic web scraping
2. If AI summary fails → Shows error message but continues processing
3. If both fail → Shows detailed error information

## Technical Details

### Supported Content Types
- **HTML Pages**: All standard web pages
- **Documentation Sites**: Technical documentation
- **Blog Posts**: Articles and blog content
- **News Articles**: News and media content
- **Academic Papers**: Research publications (when available online)

### Markdown Features
- **Headings**: Proper heading hierarchy (H1-H6)
- **Code Blocks**: Syntax-highlighted code sections
- **Lists**: Ordered and unordered lists
- **Tables**: Formatted table structures
- **Blockquotes**: Quote formatting
- **Links**: Preserved link references

### AI Summary Options
- **Length**: Configurable summary length (default: 150 words)
- **Focus**: Different focus areas for specialized content
- **Key Points**: Bullet-pointed highlights when relevant
- **Language**: Multi-language support

## Best Practices

### URL Selection
- Use specific page URLs rather than homepage URLs
- Ensure URLs are publicly accessible
- Avoid URLs requiring authentication when possible

### API Usage
- Monitor Firecrawl API usage to avoid rate limits
- Configure multiple AI providers for redundancy
- Use appropriate summary lengths to save tokens

### Content Management
- Regularly review and clean up processed websites
- Use descriptive URLs for better organization
- Remove outdated or irrelevant content

## Troubleshooting

### Performance Issues
- Large websites may take longer to process
- Multiple simultaneous requests may be rate-limited
- Consider processing websites during off-peak hours

### Content Quality
- Some websites may have poor content structure
- Dynamic content may not be fully captured
- Consider manual content curation for critical information

### Storage Considerations
- Processed content is stored locally in IndexedDB
- Large amounts of content may impact browser performance
- Regularly clean up unnecessary content

## Future Enhancements

### Planned Features
- **Batch URL Processing**: Process multiple URLs simultaneously
- **Content Refresh**: Automatic re-processing of updated content
- **Advanced Filtering**: Filter content by type, date, or relevance
- **Export Options**: Export processed content in various formats

### Integration Possibilities
- **Bookmark Import**: Import URLs from browser bookmarks
- **RSS Feeds**: Automatic processing of RSS feed content
- **Team Sharing**: Share processed content across team members
- **Analytics**: Track content usage and relevance

## Support

For issues related to:
- **Firecrawl API**: Contact Firecrawl support
- **AI Providers**: Check respective provider documentation
- **Curiso.ai Integration**: Report issues on the GitHub repository

## Version History

- **v1.0**: Initial implementation with Firecrawl and AI summaries
- **v1.1**: Enhanced error handling and fallback mechanisms
- **v1.2**: Improved UI and content display options