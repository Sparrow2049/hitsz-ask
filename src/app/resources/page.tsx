import { getCourses, listResources } from "@/lib/db";
import ResourceCard from "@/components/ResourceCard";
import ResourceForm from "@/components/ResourceForm";
import EmptyState from "@/components/EmptyState";
import CourseFilterRow from "@/components/CourseFilterRow";
import SearchBar from "@/components/SearchBar";

export default async function ResourcesPage({
  searchParams,
}: {
  searchParams: Promise<{ course?: string; query?: string }>;
}) {
  const { course, query } = await searchParams;
  const courses = await getCourses();
  const resources = await listResources(course, query);

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <h1 className="font-display text-3xl text-text">Resources</h1>
      <p className="mt-1.5 text-text-muted">
        Notes, past papers, and repos — organized by course.
      </p>

      <div className="mt-6">
        <SearchBar placeholder="Search resources by course, title, or keyword…" />
      </div>

      <div className="mt-4">
        <CourseFilterRow
          courses={courses}
          basePath="/resources"
          selected={course}
          query={query}
        />
      </div>

      <div className="mt-6 space-y-3">
        {resources.length === 0 ? (
          <EmptyState
            title={query ? `No matches for "${query}"` : "Nothing here yet"}
            description={
              query
                ? "Try a different course, title, or keyword."
                : "Be the first to share something for this course."
            }
          />
        ) : (
          resources.map((r) => (
            <ResourceCard key={r.id} resource={r} showCourse={!course} />
          ))
        )}
      </div>

      <div className="mt-6">
        <ResourceForm courses={courses} lockedCourseCode={course} />
      </div>
    </div>
  );
}
