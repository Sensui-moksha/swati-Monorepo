import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useInfiniteQuery } from '@tanstack/react-query';
import { searchApi, SearchResult, SearchResponse } from '../../lib/api/endpoints/search';
import { SearchResultItem } from './SearchResultItem';
import { useDebounce } from '../../lib/hooks/useDebounce';
import { Search, X, Sparkles, BookOpen } from 'lucide-react';
import { DateFilterControl, DateFilterValue } from '../DateFilterControl';

interface GlobalSearchProps {
  isOpen: boolean;
  onClose: () => void;
}

const QUICK_TAGS = ['Weekly', 'Monthly', 'Originals', 'Vemuri Balaram', 'Short Stories'];

export const GlobalSearch: React.FC<GlobalSearchProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [dateFilter, setDateFilter] = useState<DateFilterValue>({ preset: 'all' });
  const debouncedQuery = useDebounce(query, 300);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isPending,
    isSuccess
  } = useInfiniteQuery({
    queryKey: ['globalSearch', debouncedQuery, dateFilter],
    queryFn: async ({ pageParam }) => {
      if (!debouncedQuery) return { total: 0, results: [], nextCursor: null } as SearchResponse;
      const filters = dateFilter.preset !== 'all' ? { year: parseInt(dateFilter.preset, 10) } : {};
      return searchApi.search(debouncedQuery, filters, pageParam as any[] | undefined);
    },
    initialPageParam: undefined as any[] | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    enabled: debouncedQuery.trim().length > 1
  });

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
        className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 pb-10 px-4 bg-background/80 backdrop-blur-md"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, y: -16, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          className="w-full max-w-2xl bg-paper border border-rule rounded-2xl shadow-2xl flex flex-col max-h-[80vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Search Input Header */}
          <div className="p-4 border-b border-rule flex items-center gap-3 bg-paper">
            <Search className="w-5 h-5 text-muted-foreground shrink-0" />
            <input
              type="text"
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search Swathi publications, weekly serials, articles..."
              className="w-full bg-transparent text-lg text-foreground outline-none placeholder:text-muted-foreground font-sans"
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="p-1 hover:bg-secondary rounded-full text-muted-foreground transition"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-secondary rounded-lg text-muted-foreground hover:text-foreground transition ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Filter Bar (Date Selector with Custom Date inputs) */}
          <div className="px-4 py-2.5 border-b border-rule bg-secondary/20">
            <DateFilterControl value={dateFilter} onChange={setDateFilter} compact />
          </div>

          {/* Quick Tags when query is empty */}
          {!debouncedQuery.trim() && (
            <div className="p-6 bg-secondary/20">
              <div className="text-xs uppercase tracking-widest text-muted-foreground mb-3 flex items-center gap-1.5 font-medium">
                <Sparkles className="w-3.5 h-3.5 text-primary" /> Popular Searches
              </div>
              <div className="flex flex-wrap gap-2">
                {QUICK_TAGS.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => setQuery(tag)}
                    className="px-3.5 py-1.5 bg-paper border border-rule rounded-full text-xs font-medium text-foreground/80 hover:border-primary hover:text-primary transition-colors shadow-xs"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Results Area */}
          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3" onScroll={handleScroll}>
            {isPending && debouncedQuery.trim().length > 1 && (
              <div className="flex items-center justify-center p-8 text-muted-foreground text-sm gap-2">
                <BookOpen className="w-4 h-4 animate-bounce text-primary" /> Searching publications...
              </div>
            )}
            
            {isSuccess && data?.pages[0]?.total === 0 && debouncedQuery.trim().length > 1 && (
              <div className="text-center py-10 px-4">
                <p className="text-muted-foreground text-sm font-medium">No results found for "{debouncedQuery}"</p>
                <p className="text-xs text-muted-foreground mt-1">Try searching for "Weekly", "Monthly", or "Balaram".</p>
              </div>
            )}

            {data?.pages.map((page, i) => (
              <React.Fragment key={i}>
                {page.results.map((result: SearchResult) => (
                  <SearchResultItem key={result.id} result={result} onClick={onClose} />
                ))}
              </React.Fragment>
            ))}

            {isFetchingNextPage && (
              <div className="flex justify-center p-4 text-xs text-muted-foreground">Loading more results...</div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
