import Link from "next/link";
import { Course } from "@/lib/types";

export default function CourseBadge({ course }: { course: Course }) {
  return (
    <Link
      href={`/courses/${course.code}`}
      className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface-raised px-2.5 py-1 text-xs text-text-muted hover:text-text hover:border-accent/50 transition-colors"
    >
      <span className="font-medium text-text">{course.code}</span>
      <span>{course.name}</span>
    </Link>
  );
}
