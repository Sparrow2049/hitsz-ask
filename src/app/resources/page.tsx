import { getCourses, listResources } from "@/lib/db";
import ResourceCard from "@/components/ResourceCard";
import ResourceForm from "@/components/ResourceForm";
import EmptyState from "@/components/EmptyState";
import CourseFilterRow from "@/components/CourseFilterRow";

export default async function ResourcesPage({
  searchParams,
}: {
  searchParams: Promise<{ course?: string }>;
}) {
  const { course } = await searchParams;
  const courses = await getCourses();
  const resources = await listResources(course);

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <h1 className="font-display text-3xl text-text">Resources</h1>
      <p className="mt-1.5 text-text-muted">
        Notes, past papers, and repos — organized by course.
      </p>

      <div className="mt-6">
        <CourseFilterRow
          courses={courses}
          basePath="/resources"
          selected={course}
        />
      </div>

      <div className="mt-6 space-y-3">
        {resources.length === 0 ? (
          <EmptyState
            title="Nothing here yet"
            description="Be the first to share something for this course."
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
