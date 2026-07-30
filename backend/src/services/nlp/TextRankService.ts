import natural from 'natural';

export class TextRankService {
  /**
   * Generates an extractive summary using a basic word-overlap graph (TextRank-lite).
   * It splits the text into sentences, scores each sentence based on shared vocabulary
   * with the rest of the document, and extracts the top scoring ones.
   */
  summarize(text: string, numSentences: number = 3): string {
    const tokenizer = new natural.SentenceTokenizer([]);
    const sentences = tokenizer.tokenize(text);
    
    if (!sentences || sentences.length <= numSentences) {
      return text;
    }

    const wordTokenizer = new natural.WordTokenizer();
    const scores = new Array(sentences.length).fill(0);

    // Build sentence vocabularies
    const sentenceVocabs = sentences.map(s => {
      const words = wordTokenizer.tokenize(s.toLowerCase()) || [];
      return new Set(words.filter(w => w.length > 3)); // filter small noise
    });

    // Score sentences by computing Jaccard similarity between every pair of sentences
    for (let i = 0; i < sentences.length; i++) {
      for (let j = 0; j < sentences.length; j++) {
        if (i === j) continue;
        
        const setA = sentenceVocabs[i];
        const setB = sentenceVocabs[j];
        if (!setA || !setB) continue;
        
        let intersection = 0;
        for (const w of setA) {
          if (setB.has(w)) intersection++;
        }
        
        // Add similarity score to sentence i
        scores[i] += intersection / (Math.log(setA.size + 1) + Math.log(setB.size + 1));
      }
    }

    // Map sentences to their scores
    const scoredSentences = sentences.map((sentence, idx) => ({
      sentence,
      score: scores[idx],
      originalIndex: idx // Preserve reading order
    }));

    // Sort by highest score
    scoredSentences.sort((a, b) => b.score - a.score);

    // Take the top N sentences
    const topSentences = scoredSentences.slice(0, numSentences);

    // Sort them back into chronological reading order
    topSentences.sort((a, b) => a.originalIndex - b.originalIndex);

    return topSentences.map(s => s.sentence).join(' ');
  }
}

export const textRankService = new TextRankService();
