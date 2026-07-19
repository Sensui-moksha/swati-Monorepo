import { motion } from "framer-motion";

export function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`skeleton ${className}`} />;
}

export function PendingPage() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
      className="min-h-[60vh] container-edit py-12"
      aria-busy="true"
      aria-live="polite"
    >
      <Skeleton className="h-4 w-32 mb-4" />
      <Skeleton className="h-10 w-2/3 mb-3" />
      <Skeleton className="h-4 w-full max-w-xl mb-10" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i}>
            <Skeleton className="aspect-[3/4] w-full" />
            <Skeleton className="h-3 w-20 mt-3" />
            <Skeleton className="h-4 w-full mt-2" />
          </div>
        ))}
      </div>
    </motion.div>
  );
}

export function InlineSpinner() {
  return (
    <motion.div
      className="inline-block h-4 w-4 rounded-full border-2 border-primary border-t-transparent"
      animate={{ rotate: 360 }}
      transition={{ repeat: Infinity, duration: 0.9, ease: "linear" }}
    />
  );
}
