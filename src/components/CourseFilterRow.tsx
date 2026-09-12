import Link from "next/link";
import { Course } from "@/lib/types";

export default function CourseFilterRow({
  courses,
  basePath,
  selected,
  query,
}: {
  courses: Course[];
  basePath: string;
  selected?: string;
  query?: string;
}) {
  // Keep an active search term intact when switching course chips (and
  // vice versa — SearchBar does the same for `course` on its side).
  function hrefFor(courseCode?: string): string {
    const params = new URLSearchParams();
    if (courseCode) params.set("course", courseCode);
    if (query) params.set("query", query);
    const qs = params.toString();
    return qs ? `${basePath}?${qs}` : basePath;
  }

  return (
    <div className="flex flex-wrap gap-2">
      <Link
        href={hrefFor()}
        className={`rounded-full border px-3 py-1 text-xs transition-colors ${
          !selected
            ? "border-accent text-text"
            : "border-border text-text-muted hover:text-text"
        }`}
      >
        All
      </Link>
      {courses.map((c) => (
        <Link
          key={c.code}
          href={hrefFor(c.code)}
          className={`rounded-full border px-3 py-1 text-xs transition-colors ${
            selected === c.code
              ? "border-accent text-text"
              : "border-border text-text-muted hover:text-text"
          }`}
        >
          {c.code}
        </Link>
      ))}
    </div>
  );
}
