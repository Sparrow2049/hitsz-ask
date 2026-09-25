import { auth } from "@/lib/auth";
import {
  listResourcesByEmail,
  listQuestionsByEmail,
  listStudyGroupsByEmail,
} from "@/lib/db";
import ResourceCard from "@/components/ResourceCard";
import QuestionCard from "@/components/QuestionCard";
import StudyGroupCard from "@/components/StudyGroupCard";
import EmptyState from "@/components/EmptyState";
import { voteView } from "@/lib/utils";

export default async function MyPostsPage() {
  const session = await auth();

  if (!session?.user?.email) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-10">
        <h1 className="font-display text-3xl text-text">My posts</h1>
        <p className="mt-4 text-sm text-text-muted">
          Sign in (top right) to see the resources, questions, and study
          sessions you&apos;ve posted.
        </p>
      </div>
    );
  }

  const email = session.user.email;
  const [resources, questions, studyGroups] = await Promise.all([
    listResourcesByEmail(email),
    listQuestionsByEmail(email),
    listStudyGroupsByEmail(email),
  ]);

  // Every item here is inherently the signed-in user's own — canManage is
  // always true. Still built without the raw email field, same as every
  // other page that renders these cards (they're "use client", and props
  // passed to a client component are visible in the page's payload).
  const resourcesView = resources.map((r) => ({
    id: r.id,
    courseCode: r.courseCode,
    title: r.title,
    type: r.type,
    url: r.url,
    addedBy: r.addedBy,
    createdAt: r.createdAt,
    canManage: true,
  }));
  const questionsView = questions.map((q) => ({
    id: q.id,
    courseCode: q.courseCode,
    title: q.title,
    body: q.body,
    askedBy: q.askedBy,
    resolved: q.resolved,
    createdAt: q.createdAt,
    answers: q.answers,
    canManage: true,
    ...voteView(q.upvotedBy, q.downvotedBy, email),
  }));
  const studyGroupsView = studyGroups.map((g) => ({
    id: g.id,
    topic: g.topic,
    description: g.description,
    date: g.date,
    time: g.time,
    place: g.place,
    maxJoiners: g.maxJoiners,
    createdBy: g.createdBy,
    createdAt: g.createdAt,
    canManage: true,
    joinedCount: g.joinedBy.length,
    hasJoined: g.joinedBy.includes(email),
  }));

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <h1 className="font-display text-3xl text-text">My posts</h1>
      <p className="mt-1.5 text-text-muted">
        Everything you&apos;ve shared, asked, or started — edit or remove
        any of it from here.
      </p>

      <section className="mt-8">
        <h2 className="text-sm text-text-muted mb-3">
          Resources ({resourcesView.length})
        </h2>
        <div className="space-y-3">
          {resourcesView.length === 0 ? (
            <EmptyState
              title="Nothing yet"
              description="Resources you add will show up here."
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
      </section>

      <section className="mt-8">
        <h2 className="text-sm text-text-muted mb-3">
          Questions ({questionsView.length})
        </h2>
        <div className="space-y-3">
          {questionsView.length === 0 ? (
            <EmptyState
              title="Nothing yet"
              description="Questions you ask will show up here."
            />
          ) : (
            questionsView.map((q) => (
              <QuestionCard
                key={q.id}
                question={q}
                showCourse
                canManage={q.canManage}
                upvotes={q.upvotes}
                downvotes={q.downvotes}
                myVote={q.myVote}
              />
            ))
          )}
        </div>
      </section>

      <section className="mt-8">
        <h2 className="text-sm text-text-muted mb-3">
          Study sessions ({studyGroupsView.length})
        </h2>
        <div className="space-y-3">
          {studyGroupsView.length === 0 ? (
            <EmptyState
              title="Nothing yet"
              description="Study sessions you start will show up here."
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
      </section>
    </div>
  );
}
