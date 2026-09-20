import React from "react";
import { X, Bookmark, Search, List } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ReaderSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onJump: (page: number) => void;
}

export const ReaderSidebar: React.FC<ReaderSidebarProps> = ({ isOpen, onClose, onJump }) => {
  if (!isOpen) return null;

  return (
    <div className="w-72 bg-stone-900 border-r border-stone-800 flex flex-col h-full z-40 relative shadow-xl transform transition-transform duration-300">
      <div className="h-11 flex items-center justify-between px-3 border-b border-stone-800/80 bg-stone-950/50">
        <span className="text-xs font-semibold text-stone-200 tracking-wider uppercase">Menu</span>
        <button
          onClick={onClose}
          className="p-1 hover:bg-stone-800 rounded text-stone-400 hover:text-white transition"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <Tabs defaultValue="toc" className="flex-1 flex flex-col overflow-hidden">
        <TabsList className="grid grid-cols-3 bg-stone-950 border-b border-stone-800 p-0 rounded-none h-10">
          <TabsTrigger
            value="toc"
            className="text-[10px] uppercase font-bold rounded-none data-[state=active]:bg-stone-800 data-[state=active]:text-amber-400"
          >
            <List className="h-3.5 w-3.5 mr-1" /> TOC
          </TabsTrigger>
          <TabsTrigger
            value="bookmarks"
            className="text-[10px] uppercase font-bold rounded-none data-[state=active]:bg-stone-800 data-[state=active]:text-amber-400"
          >
            <Bookmark className="h-3.5 w-3.5 mr-1" /> Marks
          </TabsTrigger>
          <TabsTrigger
            value="search"
            className="text-[10px] uppercase font-bold rounded-none data-[state=active]:bg-stone-800 data-[state=active]:text-amber-400"
          >
            <Search className="h-3.5 w-3.5 mr-1" /> Search
          </TabsTrigger>
        </TabsList>

        <ScrollArea className="flex-1">
          <TabsContent value="toc" className="m-0 p-4">
            <div className="text-sm text-stone-500 italic text-center mt-10">
              Table of Contents is not available for this publication.
            </div>
            {/* Implementation for TOC mapping goes here */}
          </TabsContent>
          <TabsContent value="bookmarks" className="m-0 p-4">
            <div className="text-sm text-stone-500 italic text-center mt-10">No bookmarks yet.</div>
          </TabsContent>
          <TabsContent value="search" className="m-0 p-4">
            <div className="text-sm text-stone-500 italic text-center mt-10">
              Search results will appear here.
            </div>
          </TabsContent>
        </ScrollArea>
      </Tabs>
    </div>
  );
};
