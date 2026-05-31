import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Plus, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { formatDate } from "@/lib/utils";
import { DeleteButton } from "@/components/delete-button";
import { getTranslations } from "next-intl/server";

export default async function ReleaseNotesPage() {
  const t = await getTranslations("releaseNotes");
  const tc = await getTranslations("common");

  const notes = await prisma.releaseNote.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">{t("title")}</h2>
          <p className="text-muted-foreground">{t("subtitle")}</p>
        </div>
        <Link href="/release-notes/new">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            {t("newReleaseNote")}
          </Button>
        </Link>
      </div>

      {notes.length === 0 ? (
        <EmptyState
          icon={FileText}
          title={t("noNotes")}
          description={t("noNotesDesc")}
          action={
            <Link href="/release-notes/new">
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                {t("newReleaseNote")}
              </Button>
            </Link>
          }
        />
      ) : (
        <div className="space-y-4">
          {notes.map((note) => (
            <Card key={note.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <Link
                      href={`/release-notes/${note.id}`}
                      className="text-lg font-medium hover:underline"
                    >
                      {note.version}
                    </Link>
                    {note.summary && (
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                        {note.summary}
                      </p>
                    )}
                    <div className="flex items-center gap-2 mt-2">
                      {note.releaseDate && (
                        <Badge variant="outline">{note.releaseDate}</Badge>
                      )}
                      <span className="text-xs text-muted-foreground">
                        {formatDate(note.createdAt)}
                      </span>
                    </div>
                  </div>
                  <DeleteButton
                    endpoint={`/api/release-notes/${note.id}`}
                    itemName={note.version}
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
