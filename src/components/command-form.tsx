"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { commandTemplateSchema, type CommandTemplateInput } from "@/lib/validations";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Project } from "@prisma/client";
import { useTranslations } from "next-intl";

interface CommandFormProps {
  initialData?: Partial<CommandTemplateInput>;
  commandId?: string;
  projects: Project[];
}

export function CommandForm({ initialData, commandId, projects }: CommandFormProps) {
  const router = useRouter();
  const isEditing = !!commandId;
  const t = useTranslations("commands");
  const tc = useTranslations("common");
  const tt = useTranslations("toasts");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CommandTemplateInput>({
    resolver: zodResolver(commandTemplateSchema),
    defaultValues: {
      name: initialData?.name || "",
      description: initialData?.description || "",
      command: initialData?.command || "",
      workingDirectory: initialData?.workingDirectory || "",
      projectId: initialData?.projectId || "",
      category: initialData?.category || "custom",
    },
  });

  const onSubmit = async (data: CommandTemplateInput) => {
    try {
      const url = isEditing ? `/api/commands/${commandId}` : "/api/commands";
      const method = isEditing ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || tt("failedToCreate"));
      }

      toast.success(isEditing ? tt("commandUpdated") : tt("commandCreated"));
      router.push("/commands");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : tt("failedToCreate"));
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{t("commandDetails")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">{t("name")} *</Label>
              <Input
                id="name"
                {...register("name")}
                placeholder={t("namePlaceholder")}
              />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">{t("category")}</Label>
              <Select
                id="category"
                {...register("category")}
                options={[
                  { value: "dev", label: t("dev") },
                  { value: "build", label: t("build") },
                  { value: "test", label: t("test") },
                  { value: "deploy", label: t("deploy") },
                  { value: "git", label: t("git") },
                  { value: "custom", label: t("custom") },
                ]}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">{t("description")}</Label>
            <Textarea
              id="description"
              {...register("description")}
              placeholder={t("descriptionPlaceholder")}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="command">{t("command")} *</Label>
            <Input
              id="command"
              {...register("command")}
              placeholder={t("commandPlaceholder")}
            />
            {errors.command && (
              <p className="text-sm text-destructive">{errors.command.message}</p>
            )}
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="workingDirectory">{t("workingDirectory")}</Label>
              <Input
                id="workingDirectory"
                {...register("workingDirectory")}
                placeholder={t("workingDirectoryPlaceholder")}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="projectId">{t("project")}</Label>
              <Select
                id="projectId"
                {...register("projectId")}
                options={[
                  { value: "", label: t("noProject") },
                  ...projects.map((p) => ({ value: p.id, label: p.name })),
                ]}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-4">
        <Button type="button" variant="outline" onClick={() => router.back()}>
          {tc("cancel")}
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? tc("loading") : isEditing ? t("updateCommand") : t("createCommand")}
        </Button>
      </div>
    </form>
  );
}
