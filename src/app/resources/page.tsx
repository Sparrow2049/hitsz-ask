import { getCourses, listResources } from "@/lib/db";
import { auth } from "@/lib/auth";
import ResourceCard from "@/components/ResourceCard";
import ResourceForm from "@/components/ResourceForm";
import EmptyState from "@/components/EmptyState";
import SearchBar from "@/components/SearchBar";
import YearAccordion from "@/components/YearAccordion";
import { canManagePost } from "@/lib/utils";

export default async function ResourcesPage({
  searchParams,
}: {
  searchParams: Promise<{ query?: string }>;
}) {
  const { query } = await searchParams;
  const session = await auth();
  const courses = await getCourses();
  const resources = await listResources(undefined, query);
  const resourcesView = resources.map(({ addedByEmail, ...r }) => ({
    ...r,
    canManage: canManagePost(session, addedByEmail),
  }));

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
            {resourcesView.length === 0 ? (
              <EmptyState
                title={`No matches for "${query}"`}
                description="Try a different course, title, or keyword."
              />
            ) : (
              resourcesView.map((r) => (
                <ResourceCard
                  key={r.id}
                  resource={r}
                  showCourse
                  canManage={r.canManage}
                />
              ))
            )}
          </div>
        ) : (
          <YearAccordion courses={courses} resources={resourcesView} />
        )}
      </div>

      <div className="mt-6">
        <ResourceForm courses={courses} />
      </div>
    </div>
  );
}
