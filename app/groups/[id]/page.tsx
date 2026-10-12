import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { getGroupById } from "@/lib/data";
import { authOptions } from "@/lib/auth";
import TaskItem from "@/components/TaskItem";
import DeleteGroupButton from "@/components/DeleteGroupButton";
import NewTaskForm from "@/components/NewTaskForm";
import BookSearch from "@/components/BookSearch";
import AISubtaskSuggester from "@/components/AISubtaskSuggester";

export default async function GroupDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [group, session] = await Promise.all([
    getGroupById(id),
    getServerSession(authOptions),
  ]);

  if (!group) {
    notFound();
  }

  const isOwner = session?.user?.id === group.ownerId;

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">{group.name}</h1>
          <p className="text-emerald-600 mt-1">
            {group.subject} · {group.memberCount} members · Created by{" "}
            {group.owner.name}
          </p>
        </div>
        {isOwner && <DeleteGroupButton groupId={group.id} />}
      </div>

      {isOwner && (
        <div className="mt-4 flex flex-col gap-3">
          <NewTaskForm groupId={group.id} />
        </div>
      )}

      <div className="mt-8 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Tasks</h2>
      </div>

      <ul className="mt-3 flex flex-col gap-2">
        {group.tasks.length === 0 ? (
          <p className="text-sm text-gray-500 italic">No tasks created yet.</p>
        ) : (
          group.tasks.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              groupId={group.id}
              isOwner={isOwner}
            />
          ))
        )}
      </ul>

      <div className="mt-6">
        <AISubtaskSuggester groupId={group.id} />
      </div>

      <h2 className="mt-10 text-lg font-semibold">Reference Books</h2>
      <p className="mt-1 text-sm text-gray-500">
        Powered by the Open Library API — search for books related to{" "}
        {group.subject}.
      </p>
      <div className="mt-3">
        <BookSearch initialQuery={group.subject} />
      </div>
    </div>
  );
}