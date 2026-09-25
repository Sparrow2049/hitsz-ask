import { listStudyGroups } from "@/lib/db";
import { auth } from "@/lib/auth";
import StudyGroupCard from "@/components/StudyGroupCard";
import StudyGroupForm from "@/components/StudyGroupForm";
import EmptyState from "@/components/EmptyState";
import SearchBar from "@/components/SearchBar";
import { canManagePost } from "@/lib/utils";

export default async function StudyPage({
  searchParams,
}: {
  searchParams: Promise<{ query?: string }>;
}) {
  const { query } = await searchParams;
  const session = await auth();
  const email = session?.user?.email;
  const studyGroups = await listStudyGroups(query);
  const studyGroupsView = studyGroups.map(({ createdByEmail, joinedBy, ...g }) => ({
    ...g,
    canManage: canManagePost(session, createdByEmail),
    joinedCount: joinedBy.length,
    hasJoined: Boolean(email && joinedBy.includes(email)),
  }));

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <h1 className="font-display text-3xl text-text">Study Buddy</h1>
      <p className="mt-1.5 text-text-muted">
        Find (or start) a group study session — pick a topic, a place, and a
        time, and see who joins. Sessions disappear once their time passes.
      </p>

      <div className="mt-6">
        <SearchBar placeholder="Search by topic, description, or place…" />
      </div>

      <div className="mt-6 space-y-3">
        {studyGroupsView.length === 0 ? (
          <EmptyState
            title={query ? `No matches for "${query}"` : "No upcoming sessions"}
            description={
              query
                ? "Try a different topic, place, or keyword."
                : "Start one below and see who joins."
            }
          />
        ) : (
          studyGroupsView.map((g) => (
            <StudyGroupCard
              key={g.id}
              studyGroup={g}
              joinedCount={g.joinedCount}
              hasJoined={g.hasJoined}
              canManage={g.canManage}
            />
          ))
        )}
      </div>

      <div className="mt-6">
        <StudyGroupForm />
      </div>
    </div>
  );
}
