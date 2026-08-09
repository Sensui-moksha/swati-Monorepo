import React, { useState } from "react";
import { apiClient as api } from "@/lib/api/client";

export const TaxonomyDashboard: React.FC = () => {
  const [text, setText] = useState("");
  const [results, setResults] = useState<{ keywords: string[]; summary: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const handleProcess = async () => {
    setLoading(true);
    try {
      const [kwRes, sumRes] = await Promise.all([
        api.post("/nlp/keywords", { text, topN: 8 }) as Promise<any>,
        api.post("/nlp/summarize", { text, numSentences: 3 }) as Promise<any>,
      ]);

      setResults({
        keywords: kwRes.data.data.keywords,
        summary: sumRes.data.data.summary,
      });
    } catch (error) {
      console.error(error);
      alert("Failed to process text.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold">Auto-Taxonomy & Summarization</h1>
      <p className="text-gray-600">
        Uses TF-IDF for statistical keyword extraction and TextRank for extractive summarization.
      </p>

      <div className="bg-white p-6 rounded shadow">
        <textarea
          className="w-full h-48 p-4 border rounded focus:ring focus:ring-blue-200"
          placeholder="Paste publication content here to generate metadata..."
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <div className="mt-4 flex justify-end">
          <button
            onClick={handleProcess}
            disabled={loading || !text}
            className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Processing..." : "Generate Metadata"}
          </button>
        </div>
      </div>

      {results && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded shadow border-t-4 border-indigo-500">
            <h2 className="text-xl font-bold mb-4">Extracted Tags (TF-IDF)</h2>
            <div className="flex flex-wrap gap-2">
              {results.keywords.map((kw) => (
                <span
                  key={kw}
                  className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm font-medium"
                >
                  #{kw}
                </span>
              ))}
            </div>
            {results.keywords.length === 0 && (
              <p className="text-gray-500 text-sm">No significant keywords found.</p>
            )}
          </div>

          <div className="bg-white p-6 rounded shadow border-t-4 border-green-500">
            <h2 className="text-xl font-bold mb-4">Generated Summary (TextRank)</h2>
            <p className="text-gray-700 leading-relaxed italic">"{results.summary}"</p>
          </div>
        </div>
      )}
    </div>
  );
};
