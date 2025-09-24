import { notFound } from 'next/navigation';

interface ToolPageProps {
  params: { slug: string };
}

export default function ToolPage({ params }: ToolPageProps) {
  // For now, return a basic page structure
  // You can expand this with actual tool content based on the slug
  
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-4">
        Tool: {params.slug}
      </h1>
      <p className="text-muted-foreground">
        This is a placeholder for the {params.slug} tool page.
      </p>
    </div>
  );
}

// Optional: Add generateStaticParams if you have known tool slugs
// export async function generateStaticParams() {
//   return [
//     { slug: 'example-tool' },
//     // Add more known tool slugs here
//   ];
// }
