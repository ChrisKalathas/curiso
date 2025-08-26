import { useStore } from '@/lib/store';
import OpenAI from 'openai';

export interface SummaryOptions {
  maxLength?: number;
  focus?: 'technical' | 'general' | 'business' | 'academic';
  includeKeyPoints?: boolean;
  language?: string;
}

export class AISummaryService {
  private getAvailableAIProvider() {
    const settings = useStore.getState().settings;
    
    // Check for available API keys in order of preference
    if (settings.openai.apiKey) {
      return {
        type: 'openai',
        apiKey: settings.openai.apiKey,
        model: 'gpt-4o-mini'
      };
    }
    
    if (settings.anthropic.apiKey) {
      return {
        type: 'anthropic',
        apiKey: settings.anthropic.apiKey,
        model: 'claude-3-haiku-20240307'
      };
    }

    if (settings.google.apiKey) {
      return {
        type: 'google',
        apiKey: settings.google.apiKey,
        model: 'gemini-1.5-flash'
      };
    }

    if (settings.groq.apiKey) {
      return {
        type: 'groq',
        apiKey: settings.groq.apiKey,
        model: 'llama-3.1-8b-instant'
      };
    }

    throw new Error('No AI provider API key found. Please configure OpenAI, Anthropic, Google, or Groq API key in settings.');
  }

  async generateSummary(content: string, url: string, options: SummaryOptions = {}): Promise<string> {
    const provider = this.getAvailableAIProvider();
    const {
      maxLength = 200,
      focus = 'general',
      includeKeyPoints = true,
      language = 'English'
    } = options;

    const systemPrompt = this.buildSystemPrompt(focus, maxLength, includeKeyPoints, language);
    const userPrompt = this.buildUserPrompt(content, url);

    switch (provider.type) {
      case 'openai':
        return this.generateOpenAISummary(provider.apiKey, provider.model, systemPrompt, userPrompt);
      case 'anthropic':
        return this.generateAnthropicSummary(provider.apiKey, provider.model, systemPrompt, userPrompt);
      case 'google':
        return this.generateGoogleSummary(provider.apiKey, provider.model, systemPrompt, userPrompt);
      case 'groq':
        return this.generateGroqSummary(provider.apiKey, provider.model, systemPrompt, userPrompt);
      default:
        throw new Error(`Unsupported AI provider: ${provider.type}`);
    }
  }

  private buildSystemPrompt(focus: string, maxLength: number, includeKeyPoints: boolean, language: string): string {
    const focusInstructions = {
      technical: 'Focus on technical concepts, methodologies, code examples, and implementation details.',
      general: 'Provide a balanced overview covering the main topics and important information.',
      business: 'Emphasize business implications, market insights, strategies, and actionable information.',
      academic: 'Highlight research findings, theories, methodologies, and scholarly insights.'
    };

    let prompt = `You are an expert content analyst. Create a concise, informative summary of web content in ${language}.

**Guidelines:**
- Maximum length: ${maxLength} words
- Focus: ${focusInstructions[focus as keyof typeof focusInstructions]}
- Write in clear, professional language
- Maintain objectivity and accuracy
- Preserve important technical terms and concepts`;

    if (includeKeyPoints) {
      prompt += `
- Include key points or takeaways when relevant
- Use bullet points for multiple important items when appropriate`;
    }

    return prompt;
  }

  private buildUserPrompt(content: string, url: string): string {
    // Truncate content if too long to avoid token limits
    const maxContentLength = 8000;
    const truncatedContent = content.length > maxContentLength 
      ? content.substring(0, maxContentLength) + '...'
      : content;

    return `Please summarize the following web content from ${url}:

${truncatedContent}`;
  }

  private async generateOpenAISummary(apiKey: string, model: string, systemPrompt: string, userPrompt: string): Promise<string> {
    try {
      const openai = new OpenAI({ 
        apiKey,
        dangerouslyAllowBrowser: true 
      });

      const completion = await openai.chat.completions.create({
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        max_tokens: 300,
        temperature: 0.3,
      });

      return completion.choices[0]?.message?.content?.trim() || 'Summary generation failed';
    } catch (error) {
      console.error('OpenAI summary generation failed:', error);
      throw new Error(`OpenAI summary failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async generateAnthropicSummary(apiKey: string, model: string, systemPrompt: string, userPrompt: string): Promise<string> {
    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model,
          max_tokens: 300,
          system: systemPrompt,
          messages: [
            { role: 'user', content: userPrompt }
          ]
        })
      });

      if (!response.ok) {
        throw new Error(`Anthropic API error: ${response.status}`);
      }

      const data = await response.json();
      return data.content?.[0]?.text?.trim() || 'Summary generation failed';
    } catch (error) {
      console.error('Anthropic summary generation failed:', error);
      throw new Error(`Anthropic summary failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async generateGoogleSummary(apiKey: string, model: string, systemPrompt: string, userPrompt: string): Promise<string> {
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `${systemPrompt}\n\n${userPrompt}`
            }]
          }],
          generationConfig: {
            maxOutputTokens: 300,
            temperature: 0.3,
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Google AI API error: ${response.status}`);
      }

      const data = await response.json();
      return data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || 'Summary generation failed';
    } catch (error) {
      console.error('Google AI summary generation failed:', error);
      throw new Error(`Google AI summary failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async generateGroqSummary(apiKey: string, model: string, systemPrompt: string, userPrompt: string): Promise<string> {
    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          max_tokens: 300,
          temperature: 0.3,
        })
      });

      if (!response.ok) {
        throw new Error(`Groq API error: ${response.status}`);
      }

      const data = await response.json();
      return data.choices?.[0]?.message?.content?.trim() || 'Summary generation failed';
    } catch (error) {
      console.error('Groq summary generation failed:', error);
      throw new Error(`Groq summary failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}