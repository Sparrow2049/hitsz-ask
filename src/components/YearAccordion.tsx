"use client";

import { useState } from "react";
import { Course, Resource, Role } from "@/lib/types";
import { ROLE_ORDER, ROLE_LABEL } from "@/lib/utils";
import ResourceCard from "./ResourceCard";
import EmptyState from "./EmptyState";

export default function YearAccordion({
  courses,
  resources,
}: {
  courses: Course[];
  resources: Resource[];
}) {
  // Nothing open by default — pick a year to see it, matching how this
  // was described: 4 options, one panel visible at a time.
  const [openYear, setOpenYear] = useState<Role | null>(null);

  return (
    <div className="space-y-2">
      {ROLE_ORDER.map((year) => {
        const yearCourseCodes = new Set(
          courses.filter((c) => c.year === year).map((c) => c.code)
        );
        const yearResources = resources.filter((r) =>
          yearCourseCodes.has(r.courseCode)
        );
        const isOpen = openYear === year;

        return (
          <div
            key={year}
            className="rounded-lg border border-border overflow-hidden"
          >
            <button
              type="button"
              onClick={() => setOpenYear(isOpen ? null : year)}
              aria-expanded={isOpen}
              className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left hover:bg-surface-raised transition-colors"
            >
              <span className="font-display text-lg text-text">
                {ROLE_LABEL[year]}
              </span>
              <span className="flex items-center gap-2 text-xs text-text-muted">
                {yearResources.length} resource
                {yearResources.length === 1 ? "" : "s"}
                <span aria-hidden className="text-sm">
                  {isOpen ? "−" : "+"}
                </span>
              </span>
            </button>

            {isOpen && (
              <div className="border-t border-border px-4 py-4 space-y-3">
                {yearResources.length === 0 ? (
                  <EmptyState
                    title={
                      yearCourseCodes.size === 0
                        ? "Soon to be added"
                        : "Nothing here yet"
                    }
                    description={
                      yearCourseCodes.size === 0
                        ? `No ${ROLE_LABEL[year].toLowerCase()} courses in the archive yet.`
                        : "Be the first to share something for this year."
                    }
                  />
                ) : (
                  yearResources.map((r) => (
                    <ResourceCard key={r.id} resource={r} showCourse />
                  ))
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
