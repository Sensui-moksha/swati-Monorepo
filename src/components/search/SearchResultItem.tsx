import React from 'react';
import { motion } from 'framer-motion';
import { SearchResult } from '../../lib/api/endpoints/search';
import { useNavigate } from '@tanstack/react-router';

interface SearchResultItemProps {
  result: SearchResult;
  onClick?: () => void;
}

export const SearchResultItem: React.FC<SearchResultItemProps> = ({ result, onClick }) => {
  const navigate = useNavigate();
  const { source, highlights } = result;

  const handleClick = () => {
    // Navigate to the reader with the search query and page number
    navigate({
      to: `/reader/${source.publicationId}`,
      search: { page: source.pageNumber }
    });
    if (onClick) onClick();
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.01 }}
      onClick={handleClick}
      className="flex flex-col gap-2 p-4 border border-white/10 rounded-xl bg-black/40 hover:bg-white/5 cursor-pointer transition-colors backdrop-blur-md"
    >
      <div className="flex justify-between items-start">
        <div>
          <h4 className="text-sm font-semibold text-white/90">Page {source.pageNumber}</h4>
          <span className="text-xs text-white/50">{source.publicationId} {source.issueId ? `- ${source.issueId}` : ''}</span>
        </div>
      </div>
      
      {highlights.length > 0 ? (
        <div className="text-sm text-white/70 italic bg-black/30 p-3 rounded-lg border border-white/5 line-clamp-3">
          <span dangerouslySetInnerHTML={{ __html: `"...${highlights[0]}..."` }} />
        </div>
      ) : (
        <div className="text-sm text-white/50 italic line-clamp-2">
          {source.ocrText.substring(0, 150)}...
        </div>
      )}
    </motion.div>
  );
};
