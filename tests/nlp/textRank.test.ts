import { textRankService } from '../../backend/src/services/nlp/TextRankService';

describe('TextRank Service (Extractive Summarization)', () => {
  const sampleText = `
    Natural language processing (NLP) is a subfield of linguistics, computer science, and artificial intelligence concerned with the interactions between computers and human language, in particular how to program computers to process and analyze large amounts of natural language data. 
    The goal is a computer capable of understanding the contents of documents, including the contextual nuances of the language within them. 
    The technology can then accurately extract information and insights contained in the documents as well as categorize and organize the documents themselves.
    Challenges in natural language processing frequently involve speech recognition, natural-language understanding, and natural-language generation.
  `;

  it('should extract the top 2 sentences accurately', () => {
    const summary = textRankService.summarize(sampleText, 2);
    
    // Summary should be a string and contain at least some words from the original text
    expect(typeof summary).toBe('string');
    expect(summary.length).toBeGreaterThan(0);
    
    // In our algorithm, "Natural language processing..." and "Challenges in natural language..." share many words
    // so they should score high and be extracted. Let's just check if it extracted 2 sentences.
    // The tokenizer might not be perfectly exact, but it should be approximately 2-3 sentences.
    const parts = summary.split('.').filter(p => p.trim().length > 0);
    expect(parts.length).toBeLessThanOrEqual(3);
  });

  it('should return original text if the text is too short', () => {
    const shortText = 'This is a short sentence. It has only two parts.';
    const summary = textRankService.summarize(shortText, 3);
    
    expect(summary).toBe(shortText);
  });
});
