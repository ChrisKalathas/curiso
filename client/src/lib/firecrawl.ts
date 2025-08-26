import { fetch } from '@tauri-apps/plugin-http';

export interface FirecrawlResponse {
  success: boolean;
  data: {
    markdown: string;
    html: string;
    rawHtml: string;
    metadata: {
      title: string;
      description: string;
      url: string;
      favicon: string;
      language: string;
      keywords: string[];
      author: string;
      publishedTime: string;
      modifiedTime: string;
    };
  };
  error?: string;
}

export interface ProcessedWebsiteData {
  content: string;
  markdownContent: string;
  metadata: {
    url: string;
    title: string;
    description: string;
    dateScraped: string;
    type: 'website';
    language?: string;
    author?: string;
    publishedTime?: string;
    modifiedTime?: string;
    keywords?: string[];
  };
}

export class FirecrawlProcessor {
  private apiKey: string;
  private baseUrl: string = 'https://api.firecrawl.dev/v1';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async processUrl(url: string): Promise<ProcessedWebsiteData> {
    if (!this.apiKey) {
      throw new Error('Firecrawl API key is required');
    }

    try {
      const response = await fetch(`${this.baseUrl}/scrape`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: url,
          formats: ['markdown', 'html'],
          includeTags: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'blockquote', 'pre', 'code', 'ul', 'ol', 'li', 'table', 'thead', 'tbody', 'tr', 'td', 'th'],
          excludeTags: ['script', 'style', 'nav', 'footer', 'header', 'aside', 'form', 'button'],
          waitFor: 2000,
          timeout: 30000,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Firecrawl API error (${response.status}): ${errorText}`);
      }

      const result: FirecrawlResponse = await response.json();

      if (!result.success) {
        throw new Error(`Firecrawl processing failed: ${result.error || 'Unknown error'}`);
      }

      // Enhanced markdown processing
      let markdownContent = result.data.markdown || '';
      
      // Clean and enhance markdown formatting
      markdownContent = this.enhanceMarkdownFormatting(markdownContent);

      // Extract clean text content for embedding (remove markdown syntax)
      const cleanContent = this.extractCleanText(markdownContent);

      return {
        content: cleanContent,
        markdownContent: markdownContent,
        metadata: {
          url,
          title: result.data.metadata.title || new URL(url).hostname,
          description: result.data.metadata.description || '',
          dateScraped: new Date().toISOString(),
          type: 'website',
          language: result.data.metadata.language,
          author: result.data.metadata.author,
          publishedTime: result.data.metadata.publishedTime,
          modifiedTime: result.data.metadata.modifiedTime,
          keywords: result.data.metadata.keywords,
        },
      };
    } catch (error) {
      console.error('Firecrawl processing failed:', error);
      
      // Fallback to basic scraping if Firecrawl fails
      if (error instanceof Error && error.message.includes('API error')) {
        throw error; // Re-throw API errors as they might be configuration issues
      }
      
      throw new Error(`Failed to process URL with Firecrawl: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private enhanceMarkdownFormatting(markdown: string): string {
    // Remove excessive whitespace while preserving intentional spacing
    let enhanced = markdown.replace(/\n{3,}/g, '\n\n');
    
    // Ensure proper heading formatting
    enhanced = enhanced.replace(/^(#{1,6})\s*(.+)$/gm, (match, hashes, title) => {
      return `${hashes} ${title.trim()}`;
    });

    // Enhance code block formatting
    enhanced = enhanced.replace(/```(\w+)?\n([\s\S]*?)```/g, (match, lang, code) => {
      const language = lang || '';
      const cleanCode = code.trim();
      return `\`\`\`${language}\n${cleanCode}\n\`\`\``;
    });

    // Enhance inline code formatting
    enhanced = enhanced.replace(/`([^`]+)`/g, '`$1`');

    // Improve list formatting
    enhanced = enhanced.replace(/^[\s]*[-*+]\s+(.+)$/gm, '- $1');
    enhanced = enhanced.replace(/^[\s]*(\d+\.)\s+(.+)$/gm, '$1 $2');

    // Enhance blockquote formatting
    enhanced = enhanced.replace(/^>\s*(.+)$/gm, '> $1');

    // Clean up table formatting if present
    enhanced = enhanced.replace(/\|(.+)\|/g, (match, content) => {
      const cells = content.split('|').map((cell: string) => cell.trim());
      return `| ${cells.join(' | ')} |`;
    });

    return enhanced.trim();
  }

  private extractCleanText(markdown: string): string {
    // Remove markdown syntax for plain text content suitable for embeddings
    let cleanText = markdown;

    // Remove headers while keeping the text
    cleanText = cleanText.replace(/^#{1,6}\s*(.+)$/gm, '$1');

    // Remove code blocks
    cleanText = cleanText.replace(/```[\s\S]*?```/g, '');

    // Remove inline code
    cleanText = cleanText.replace(/`([^`]+)`/g, '$1');

    // Remove bold/italic formatting
    cleanText = cleanText.replace(/\*\*([^*]+)\*\*/g, '$1');
    cleanText = cleanText.replace(/\*([^*]+)\*/g, '$1');
    cleanText = cleanText.replace(/__([^_]+)__/g, '$1');
    cleanText = cleanText.replace(/_([^_]+)_/g, '$1');

    // Remove links but keep the text
    cleanText = cleanText.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');

    // Remove blockquotes
    cleanText = cleanText.replace(/^>\s*/gm, '');

    // Remove list markers
    cleanText = cleanText.replace(/^[\s]*[-*+]\s+/gm, '');
    cleanText = cleanText.replace(/^[\s]*\d+\.\s+/gm, '');

    // Remove table formatting
    cleanText = cleanText.replace(/\|/g, ' ');

    // Clean up whitespace
    cleanText = cleanText.replace(/\n{2,}/g, '\n\n');
    cleanText = cleanText.replace(/\s{2,}/g, ' ');

    return cleanText.trim();
  }
}