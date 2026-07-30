import natural from 'natural';

export interface CorrectionSuggestion {
  original: string;
  suggestion: string;
  distance: number;
}

export class SpellCheckService {
  private dictionary: natural.Spellcheck;

  constructor() {
    // In a production setup, we would load a massive dictionary text file.
    // For this prototype, we initialize with a basic array of words or a corpus.
    const corpus = ['digital', 'publication', 'platform', 'magazine', 'article', 'swathi', 'technology', 'system', 'business', 'intelligence', 'security'];
    this.dictionary = new natural.Spellcheck(corpus);
  }

  /**
   * Scans a text for likely OCR errors by identifying words not in the dictionary
   * and using Levenshtein distance to find the closest matches.
   */
  checkOcr(text: string): CorrectionSuggestion[] {
    const tokenizer = new natural.WordTokenizer();
    const words = tokenizer.tokenize(text) || [];
    
    const corrections: CorrectionSuggestion[] = [];

    // JaroWinkler is good for short strings and typos
    const jaroWinkler = natural.JaroWinklerDistance;

    for (const word of words) {
      if (word.length < 3) continue; // Ignore tiny words or punctuation noise
      
      const isCorrect = this.dictionary.isCorrect(word.toLowerCase());
      
      if (!isCorrect) {
        // Get suggestions
        const suggestions = this.dictionary.getCorrections(word.toLowerCase(), 2);
        
        if (suggestions.length > 0) {
          const topSuggestion = suggestions[0];
          if (!topSuggestion) continue;
          // Calculate similarity to provide a confidence score (1 = identical, 0 = completely different)
          const similarity = jaroWinkler(word.toLowerCase(), topSuggestion, undefined);
          
          // If the similarity is decent but not identical (i.e. it's likely an OCR error like "dig1tal")
          if (similarity > 0.7 && similarity < 1) {
            corrections.push({
              original: word,
              suggestion: topSuggestion,
              distance: Math.round(similarity * 100) // Convert to percentage
            });
          }
        }
      }
    }

    return corrections;
  }
}

export const spellCheckService = new SpellCheckService();
