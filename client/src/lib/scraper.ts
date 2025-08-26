import { fetch } from '@tauri-apps/plugin-http';
import FirecrawlApp from '@firecrawl/firecrawl-js';
import { useStore } from './store';

export class WebScraper {
  private getFirecrawlClient(): FirecrawlApp | null {
    const settings = useStore.getState().settings;
    const apiKey = settings.firecrawl?.apiKey;
    
    if (!apiKey || apiKey.trim() === '') {
      return null;
    }
    
    return new FirecrawlApp({ apiKey });
  }

  async scrapeUrl(url: string): Promise<{ content: string; metadata: any }> {
    const firecrawlClient = this.getFirecrawlClient();
    
    // If Firecrawl is not configured, fall back to the original scraping method
    if (!firecrawlClient) {
      console.log('Firecrawl API key not configured, using fallback scraper');
      return this.fallbackScrape(url);
    }

    try {
      console.log('Using Firecrawl to scrape:', url);
      
      // Use Firecrawl to scrape the URL
      const scrapeResult = await firecrawlClient.scrapeUrl(url, {
        formats: ['markdown', 'html'],
        includeTags: ['title', 'meta'],
        excludeTags: ['script', 'style', 'nav', 'footer', 'header'],
        onlyMainContent: true,
      });

      if (!scrapeResult.success) {
        throw new Error(`Firecrawl scraping failed: ${scrapeResult.error || 'Unknown error'}`);
      }

      const data = scrapeResult.data;
      if (!data) {
        throw new Error('No data returned from Firecrawl');
      }

      // Use markdown content if available, otherwise fall back to HTML
      const content = data.markdown || data.html || '';
      
      if (!content || content.trim() === '') {
        throw new Error('No content extracted from URL');
      }

      console.log('Firecrawl scraped content length:', content.length);

      // Create metadata from Firecrawl response
      const metadata = {
        url,
        title: data.metadata?.title || data.title || new URL(url).hostname,
        description: data.metadata?.description || data.description || '',
        dateScraped: new Date().toISOString(),
        type: 'website',
        scrapingMethod: 'firecrawl',
        // Include additional Firecrawl metadata if available
        ...(data.metadata && { firecrawlMetadata: data.metadata }),
      };

      return { content, metadata };
    } catch (error) {
      console.error('Firecrawl scraping failed:', error);
      
      // Fall back to the original scraping method if Firecrawl fails
      console.log('Falling back to traditional scraping method');
      return this.fallbackScrape(url);
    }
  }

  private async fallbackScrape(url: string): Promise<{ content: string; metadata: any }> {
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; MyBot/1.0;)',
          Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const text = await response.text();

      if (!text) {
        throw new Error('No content received from URL');
      }

      // Use DOMParser for better HTML parsing
      const parser = new DOMParser();
      const doc = parser.parseFromString(text, 'text/html');

      // Remove unwanted elements
      const elementsToRemove = doc.querySelectorAll('script, style, nav, footer, header');
      elementsToRemove.forEach(el => el.remove());

      // Get main content
      const mainContent = doc.querySelector('main, article, .content') || doc.body;
      const cleanText = mainContent.textContent || '';

      console.log('Fallback scraped content length:', cleanText.length);

      const metadata = {
        url,
        title: doc.title || new URL(url).hostname,
        description: doc.querySelector('meta[name="description"]')?.getAttribute('content') || '',
        dateScraped: new Date().toISOString(),
        type: 'website',
        scrapingMethod: 'fallback',
      };

      return { content: cleanText, metadata };
    } catch (error) {
      console.error('Failed to scrape URL:', error);
      throw error;
    }
  }
}
