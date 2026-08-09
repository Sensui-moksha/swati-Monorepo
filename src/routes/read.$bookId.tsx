import { createFileRoute, useParams, useSearch } from "@tanstack/react-router";
import { PdfBookViewer } from "@/components/PdfBookViewer";
import { useEffect, useState } from "react";
import { apiClient } from "@/lib/api/client";

export const Route = createFileRoute("/read/$bookId")({
  component: ReadPdfRoute,
  validateSearch: (search: Record<string, unknown>) => {
    return {
      page: Number(search?.page ?? 1),
    };
  },
});

function ReadPdfRoute() {
  const { bookId } = Route.useParams();
  const searchParams = Route.useSearch();
  const [publication, setPublication] = useState<any>(null);

  useEffect(() => {
    // Fetch publication details to get the fileUri
    // Assuming we have an endpoint /publications/:id
    apiClient
      .get<any>(`/publications/${bookId}`)
      .then((res: any) => setPublication(res?.data?.data || res?.data || res))
      .catch(console.error);
  }, [bookId]);

  if (!publication) {
    return (
      <div className="h-screen bg-black flex items-center justify-center text-white">
        Loading...
      </div>
    );
  }

  // Extract the file URI (might need adjustment based on your publication schema)
  const fileUri =
    publication.fileUri ||
    publication.coverImage?.replace("cover", "pdf") ||
    `/documents/${bookId}.pdf`;

  return (
    <div className="w-screen h-screen overflow-hidden bg-black">
      <PdfBookViewer
        pdfUrl={fileUri}
        title={publication.title}
        isOpen={true}
        onClose={() => window.history.back()}
        initialPage={searchParams.page}
      />
    </div>
  );
}
