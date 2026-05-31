import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Copy, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { formatDate } from "@/lib/utils";
import { CopyButton } from "@/components/copy-button";
import { getTranslations } from "next-intl/server";

interface ReleaseNoteDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function ReleaseNoteDetailPage({ params }: ReleaseNoteDetailPageProps) {
  const { id } = await params;
  const t = await getTranslations("releaseNotes");
  const tc = await getTranslations("common");

  const note = await prisma.releaseNote.findUnique({
    where: { id },
  });

  if (!note) {
    notFound();
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/release-notes">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h2 className="text-2xl font-bold tracking-tight">{note.version}</h2>
            <div className="flex items-center gap-2 mt-1">
              {note.releaseDate && <Badge variant="outline">{note.releaseDate}</Badge>}
            </div>
          </div>
        </div>
        {note.markdownOutput && (
          <CopyButton text={note.markdownOutput} label="Markdown copied" />
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          {note.markdownOutput && (
            <Card>
              <CardHeader>
                <CardTitle>{t("generatedNotes")}</CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="whitespace-pre-wrap text-sm bg-muted p-4 rounded-lg">
                  {note.markdownOutput}
                </pre>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{tc("details")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {note.summary && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{t("summary")}</p>
                  <p className="text-sm">{note.summary}</p>
                </div>
              )}
              {note.contributors && (
                <>
                  <Separator />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{t("contributors")}</p>
                    <p className="text-sm">{note.contributors}</p>
                  </div>
                </>
              )}
              <Separator />
              <div>
                <p className="text-sm font-medium text-muted-foreground">{tc("createdAt")}</p>
                <p className="text-sm">{formatDate(note.createdAt)}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
