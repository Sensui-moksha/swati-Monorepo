import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useInfiniteQuery } from '@tanstack/react-query';
import { searchApi, SearchResult, SearchResponse } from '../../lib/api/endpoints/search';
import { SearchResultItem } from './SearchResultItem';
import { useDebounce } from '../../lib/hooks/useDebounce'; // Assuming a useDebounce hook exists or I'll use a simple timeout

interface GlobalSearchProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GlobalSearch: React.FC<GlobalSearchProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 500);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isPending,
    isSuccess
  } = useInfiniteQuery({
    queryKey: ['globalSearch', debouncedQuery],
    queryFn: async ({ pageParam }) => {
      if (!debouncedQuery) return { total: 0, results: [], nextCursor: null } as SearchResponse;
      return searchApi.search(debouncedQuery, {}, pageParam as any[] | undefined);
    },
    initialPageParam: undefined as any[] | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    enabled: debouncedQuery.length > 2
  });

  // Basic Infinite Scroll Handler
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, clientHeight, scrollHeight } = e.currentTarget;
    if (scrollHeight - scrollTop <= clientHeight * 1.5 && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-start justify-center pt-20 pb-10 px-4 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="w-full max-w-3xl bg-[#111111] border border-white/10 rounded-2xl shadow-2xl flex flex-col max-h-[80vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Search Input Header */}
          <div className="p-4 border-b border-white/10 flex items-center gap-4">
            <svg className="w-6 h-6 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search across the entire 30TB archive..."
              className="w-full bg-transparent text-xl text-white outline-none placeholder:text-white/30"
            />
            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg text-white/50 transition">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Results Area */}
          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3" onScroll={handleScroll}>
            {isPending && debouncedQuery.length > 2 && (
              <div className="flex justify-center p-8 text-white/50">Searching the archive...</div>
            )}
            
            {isSuccess && data?.pages[0]?.total === 0 && debouncedQuery.length > 2 && (
              <div className="flex justify-center p-8 text-white/50">No results found for "{debouncedQuery}"</div>
            )}

            {data?.pages.map((page, i) => (
              <React.Fragment key={i}>
                {page.results.map((result: SearchResult) => (
                  <SearchResultItem key={result.id} result={result} onClick={onClose} />
                ))}
              </React.Fragment>
            ))}

            {isFetchingNextPage && (
              <div className="flex justify-center p-4 text-white/50">Loading more results...</div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
