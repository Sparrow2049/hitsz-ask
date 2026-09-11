import Link from "next/link";
import { Course } from "@/lib/types";

export default function CourseFilterRow({
  courses,
  basePath,
  selected,
}: {
  courses: Course[];
  basePath: string;
  selected?: string;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      <Link
        href={basePath}
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
          href={`${basePath}?course=${c.code}`}
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
