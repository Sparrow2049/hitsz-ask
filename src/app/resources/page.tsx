import { getCourses, listResources } from "@/lib/db";
import ResourceCard from "@/components/ResourceCard";
import ResourceForm from "@/components/ResourceForm";
import EmptyState from "@/components/EmptyState";
import SearchBar from "@/components/SearchBar";
import YearAccordion from "@/components/YearAccordion";

export default async function ResourcesPage({
  searchParams,
}: {
  searchParams: Promise<{ query?: string }>;
}) {
  const { query } = await searchParams;
  const courses = await getCourses();
  const resources = await listResources(undefined, query);

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <h1 className="font-display text-3xl text-text">Resources</h1>
      <p className="mt-1.5 text-text-muted">
        Notes, past papers, and repos — organized by course.
      </p>

      <div className="mt-6">
        <SearchBar placeholder="Search resources by course, title, or keyword…" />
      </div>

      <div className="mt-6">
        {query ? (
          <div className="space-y-3">
            {resources.length === 0 ? (
              <EmptyState
                title={`No matches for "${query}"`}
                description="Try a different course, title, or keyword."
              />
            ) : (
              resources.map((r) => (
                <ResourceCard key={r.id} resource={r} showCourse />
              ))
            )}
          </div>
        ) : (
          <YearAccordion courses={courses} resources={resources} />
        )}
      </div>

      <div className="mt-6">
        <ResourceForm courses={courses} />
      </div>
    </div>
  );
}
