import React, { useState } from "react";
import { apiClient as api } from "@/lib/api/client";

export const OcrReviewDashboard: React.FC = () => {
  const [textToScan, setTextToScan] = useState("");
  const [corrections, setCorrections] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const handleScan = async () => {
    setLoading(true);
    try {
      const res = (await api.post("/nlp/ocr-check", { text: textToScan })) as any;
      setCorrections(res.data.data.corrections);
    } catch (error) {
      console.error(error);
      alert("Failed to scan text.");
    } finally {
      setLoading(false);
    }
  };

  const applyCorrection = (index: number, suggestion: string) => {
    const correction = corrections[index];
    const newText = textToScan.replace(new RegExp(`\\b${correction.original}\\b`, "g"), suggestion);
    setTextToScan(newText);

    // Remove from the corrections list
    setCorrections((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold">OCR Proofreading Tools</h1>
      <p className="text-gray-600">
        Uses Dictionary match and Levenshtein distance to detect extraction errors in publications.
      </p>

      <div className="bg-white p-6 rounded shadow">
        <textarea
          className="w-full h-64 p-4 border rounded focus:ring focus:ring-indigo-200"
          placeholder="Paste raw OCR text here..."
          value={textToScan}
          onChange={(e) => setTextToScan(e.target.value)}
        />
        <div className="mt-4 flex justify-end">
          <button
            onClick={handleScan}
            disabled={loading || !textToScan}
            className="px-6 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50"
          >
            {loading ? "Scanning..." : "Detect Errors"}
          </button>
        </div>
      </div>

      {corrections.length > 0 && (
        <div className="bg-white p-6 rounded shadow space-y-4">
          <h2 className="text-xl font-semibold text-red-600">Possible OCR Errors Detected</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full text-left">
              <thead>
                <tr className="bg-gray-50 border-b">
                  <th className="p-3">Original Word</th>
                  <th className="p-3">Confidence</th>
                  <th className="p-3">Suggested Correction</th>
                  <th className="p-3">Action</th>
                </tr>
              </thead>
              <tbody>
                {corrections.map((corr, idx) => (
                  <tr key={idx} className="border-b">
                    <td className="p-3 font-mono text-red-500 line-through">{corr.original}</td>
                    <td className="p-3">{corr.distance}% match</td>
                    <td className="p-3 font-bold text-green-600">{corr.suggestion}</td>
                    <td className="p-3">
                      <button
                        onClick={() => applyCorrection(idx, corr.suggestion)}
                        className="px-3 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200 text-sm"
                      >
                        Apply Fix
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
