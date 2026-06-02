"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { projectSchema, type ProjectInput } from "@/lib/validations";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { slugify } from "@/lib/utils";
import { useTranslations } from "next-intl";

interface ProjectFormProps {
  initialData?: Partial<ProjectInput>;
  projectId?: string;
}

export function ProjectForm({ initialData, projectId }: ProjectFormProps) {
  const router = useRouter();
  const isEditing = !!projectId;
  const t = useTranslations("projects");
  const tc = useTranslations("common");
  const tt = useTranslations("toasts");
  const tg = useTranslations("github");

  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<ProjectInput>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      name: initialData?.name || "",
      slug: initialData?.slug || "",
      description: initialData?.description || "",
      localPath: initialData?.localPath || "",
      repositoryUrl: initialData?.repositoryUrl || "",
      techStack: initialData?.techStack || "",
      packageManager: initialData?.packageManager || "npm",
      startCommand: initialData?.startCommand || "",
      testCommand: initialData?.testCommand || "",
      buildCommand: initialData?.buildCommand || "",
      deployCommand: initialData?.deployCommand || "",
      notes: initialData?.notes || "",
      status: initialData?.status || "active",
      githubOwner: initialData?.githubOwner || "",
      githubRepo: initialData?.githubRepo || "",
      githubUrl: initialData?.githubUrl || "",
      githubDefaultBranch: initialData?.githubDefaultBranch || "",
    },
  });

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setValue("name", value);
    if (!isEditing) {
      setValue("slug", slugify(value));
    }
  };

  const handleParseFromUrl = () => {
    const url = (getValues("repositoryUrl") || "").trim();
    if (!url) return;

    // Parse GitHub URLs
    // https://github.com/owner/repo
    // https://github.com/owner/repo.git
    // git@github.com:owner/repo.git
    const httpsMatch = url.match(/github\.com[:/]([^/]+)\/([^/.]+)(?:\.git)?$/);
    if (httpsMatch) {
      setValue("githubOwner", httpsMatch[1]);
      setValue("githubRepo", httpsMatch[2]);
      toast.success(tg("parsedFromUrl"));
      return;
    }

    toast.error(tg("invalidGithubUrl"));
  };

  const onSubmit = async (data: ProjectInput) => {
    try {
      const url = isEditing ? `/api/projects/${projectId}` : "/api/projects";
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

      toast.success(isEditing ? tt("projectUpdated") : tt("projectCreated"));
      router.push(isEditing ? `/projects/${projectId}` : "/projects");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : tt("failedToCreate"));
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{tc("overview")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">{t("name")} *</Label>
              <Input
                id="name"
                {...register("name")}
                onChange={handleNameChange}
                placeholder={t("namePlaceholder")}
              />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="slug">{t("slug")} *</Label>
              <Input
                id="slug"
                {...register("slug")}
                placeholder={t("slugPlaceholder")}
              />
              {errors.slug && (
                <p className="text-sm text-destructive">{errors.slug.message}</p>
              )}
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
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="localPath">{t("localPath")}</Label>
              <Input
                id="localPath"
                {...register("localPath")}
                placeholder={t("localPathPlaceholder")}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="repositoryUrl">{t("repositoryUrl")}</Label>
              <Input
                id="repositoryUrl"
                {...register("repositoryUrl")}
                placeholder={t("repositoryUrlPlaceholder")}
              />
              {errors.repositoryUrl && (
                <p className="text-sm text-destructive">{errors.repositoryUrl.message}</p>
              )}
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="techStack">{t("techStack")}</Label>
              <Input
                id="techStack"
                {...register("techStack")}
                placeholder={t("techStackPlaceholder")}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="packageManager">{t("packageManager")}</Label>
              <Select
                id="packageManager"
                {...register("packageManager")}
                options={[
                  { value: "npm", label: "npm" },
                  { value: "yarn", label: "yarn" },
                  { value: "pnpm", label: "pnpm" },
                  { value: "bun", label: "bun" },
                  { value: "pip", label: "pip" },
                  { value: "cargo", label: "cargo" },
                  { value: "go", label: "go" },
                  { value: "swift", label: "swift" },
                  { value: "maven", label: "maven" },
                  { value: "gradle", label: "gradle" },
                ]}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("commands")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="startCommand">{t("startCommand")}</Label>
              <Input
                id="startCommand"
                {...register("startCommand")}
                placeholder={t("startCommandPlaceholder")}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="testCommand">{t("testCommand")}</Label>
              <Input
                id="testCommand"
                {...register("testCommand")}
                placeholder={t("testCommandPlaceholder")}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="buildCommand">{t("buildCommand")}</Label>
              <Input
                id="buildCommand"
                {...register("buildCommand")}
                placeholder={t("buildCommandPlaceholder")}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="deployCommand">{t("deployCommand")}</Label>
              <Input
                id="deployCommand"
                {...register("deployCommand")}
                placeholder={t("deployCommandPlaceholder")}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{tc("notes")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="notes">{t("notes")}</Label>
            <Textarea
              id="notes"
              {...register("notes")}
              placeholder={t("notesPlaceholder")}
              rows={4}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{tg("repository")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            {tg("repositoryDesc")}
          </p>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="githubOwner">{tg("owner")}</Label>
              <Input
                id="githubOwner"
                {...register("githubOwner")}
                placeholder={tg("ownerPlaceholder")}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="githubRepo">{tg("repo")}</Label>
              <Input
                id="githubRepo"
                {...register("githubRepo")}
                placeholder={tg("repoPlaceholder")}
              />
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="githubUrl">{tg("repoUrl")}</Label>
              <Input
                id="githubUrl"
                {...register("githubUrl")}
                placeholder={tg("repoUrlPlaceholder")}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="githubDefaultBranch">{tg("defaultBranch")}</Label>
              <Input
                id="githubDefaultBranch"
                {...register("githubDefaultBranch")}
                placeholder={tg("defaultBranchPlaceholder")}
              />
            </div>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleParseFromUrl}
          >
            {tg("parseFromUrl")}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{tc("status")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="status">{t("status")}</Label>
            <Select
              id="status"
              {...register("status")}
              options={[
                { value: "active", label: tc("active") },
                { value: "archived", label: tc("archived") },
              ]}
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
        >
          {tc("cancel")}
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? tc("loading") : isEditing ? t("updateProject") : t("createProject")}
        </Button>
      </div>
    </form>
  );
}
