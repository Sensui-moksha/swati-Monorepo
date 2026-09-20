import React from "react";
import { motion } from "framer-motion";
import { SearchResult } from "../../lib/api/endpoints/search";
import { useNavigate } from "@tanstack/react-router";

interface SearchResultItemProps {
  result: SearchResult;
  onClick?: () => void;
}

export const SearchResultItem: React.FC<SearchResultItemProps> = ({ result, onClick }) => {
  const navigate = useNavigate();
  const { source, highlights } = result;

  const handleClick = () => {
    const targetSlug = source.publicationId;
    if (targetSlug.startsWith("/")) {
      navigate({ to: targetSlug as any });
    } else {
      navigate({ to: "/publications/$slug", params: { slug: targetSlug } });
    }
    if (onClick) onClick();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.005 }}
      onClick={handleClick}
      className="flex flex-col gap-1.5 p-4 border border-rule rounded-xl bg-paper hover:border-primary hover:bg-secondary/40 cursor-pointer transition-all shadow-xs"
    >
      <div className="flex justify-between items-start">
        <div>
          <h4 className="text-base font-serif font-semibold text-foreground group-hover:text-primary leading-snug">
            {source.issueId || `Publication Page ${source.pageNumber}`}
          </h4>
          <span className="text-[10px] uppercase tracking-widest text-primary font-medium">
            {source.publicationId}
          </span>
        </div>
      </div>

      {highlights.length > 0 ? (
        <div className="text-xs text-muted-foreground leading-relaxed line-clamp-2 mt-1">
          <span dangerouslySetInnerHTML={{ __html: highlights[0] }} />
        </div>
      ) : (
        <div className="text-xs text-muted-foreground leading-relaxed line-clamp-2 mt-1">
          {source.ocrText}
        </div>
      )}
    </motion.div>
  );
};
