import natural from 'natural';

export class NlpService {
  constructor() {
  }

  /**
   * Extracts top statistical keywords from a given text using TF-IDF.
   * Useful for auto-generating Tags and Metadata Keywords.
   */
  extractKeywords(text: string, topN: number = 10): string[] {
    // 1. Clean the text
    const tokenizer = new natural.WordTokenizer();
    const words = tokenizer.tokenize(text.toLowerCase()) || [];
    
    // 2. We use standard English stop words filter (implicit in natural's TfIdf)
    const localTfIdf = new natural.TfIdf();
    localTfIdf.addDocument(words);
    
    const terms: { term: string, tfidf: number }[] = [];
    
    localTfIdf.listTerms(0).forEach(item => {
      // Filter out overly short words or purely numerical words
      if (item.term.length > 3 && !/^\d+$/.test(item.term)) {
        terms.push(item);
      }
    });

    // Sort by importance
    terms.sort((a, b) => b.tfidf - a.tfidf);

    // Return the top N keywords
    return terms.slice(0, topN).map(t => t.term);
  }

  /**
   * Extremely naive language detection based on character sets and basic dictionaries.
   * In a real NLP stack, franc or cld3 would be preferred.
   */
  detectLanguage(text: string): string {
    // Basic heuristic: check for Telugu unicode block
    if (/[\u0C00-\u0C7F]/.test(text)) {
      return 'te';
    }
    // Check for Hindi unicode block
    if (/[\u0900-\u097F]/.test(text)) {
      return 'hi';
    }
    return 'en';
  }
}

export const nlpService = new NlpService();
