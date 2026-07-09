interface JsonLdProps {
  schema: Record<string, unknown>;
}

// Escape </script> sequences so embedded JSON can't break out of the script tag.
const safeJsonLd = (schema: Record<string, unknown>) =>
  JSON.stringify(schema).replace(/<\//g, "<\\/");

export const JsonLd = ({ schema }: JsonLdProps) => (
  <script
    type="application/ld+json"
    dangerouslySetInnerHTML={{ __html: safeJsonLd(schema) }}
  />
);
