"use client";

import { useState } from "react";
import { Course, Resource } from "@/lib/types";
import { groupCoursesBySchool } from "@/lib/utils";
import ResourceCard from "./ResourceCard";
import EmptyState from "./EmptyState";

type ResourceView = Omit<Resource, "addedByEmail"> & { canManage: boolean };

export default function SchoolAccordion({
  courses,
  resources,
}: {
  courses: Course[];
  // Already stripped of addedByEmail and annotated with canManage by the
  // page that renders this — see src/app/resources/page.tsx.
  resources: ResourceView[];
}) {
  // Nothing open by default — pick a school to see it, one panel visible
  // at a time. Inside a school, courses are split by class year.
  const [openSchool, setOpenSchool] = useState<string | null>(null);

  const schools = groupCoursesBySchool(courses);

  return (
    <div className="space-y-2">
      {schools.map((group) => {
        // Each year (or the year-less block, for General electives) gets
        // just its own courses' resources, newest first as given.
        const years = group.years.map((y) => {
          const codes = new Set(y.courses.map((c) => c.code));
          return {
            ...y,
            resources: resources.filter((r) => codes.has(r.courseCode)),
          };
        });
        const total = years.reduce((n, y) => n + y.resources.length, 0);
        const isOpen = openSchool === group.school;

        return (
          <div
            key={group.school}
            className="rounded-lg border border-border overflow-hidden"
          >
            <button
              type="button"
              onClick={() => setOpenSchool(isOpen ? null : group.school)}
              aria-expanded={isOpen}
              className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left hover:bg-surface-raised transition-colors"
            >
              <span className="font-display text-lg text-text">
                {group.label}
              </span>
              <span className="flex items-center gap-2 text-xs text-text-muted">
                {total} resource{total === 1 ? "" : "s"}
                <span aria-hidden className="text-sm">
                  {isOpen ? "−" : "+"}
                </span>
              </span>
            </button>

            {isOpen && (
              <div className="border-t border-border px-4 py-4 space-y-5">
                {total === 0 ? (
                  <EmptyState
                    title="Nothing here yet"
                    description="Be the first to share something for this group."
                  />
                ) : (
                  years.map((y) =>
                    y.resources.length === 0 ? null : (
                      <section key={y.year} className="space-y-3">
                        {y.label && (
                          <h3 className="text-xs uppercase tracking-wide text-text-muted">
                            {y.label}
                            <span className="ml-2 normal-case tracking-normal">
                              {y.resources.length}
                            </span>
                          </h3>
                        )}
                        {y.resources.map((r) => (
                          <ResourceCard
                            key={r.id}
                            resource={r}
                            showCourse
                            canManage={r.canManage}
                          />
                        ))}
                      </section>
                    )
                  )
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
