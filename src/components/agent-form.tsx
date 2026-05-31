"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { agentProfileSchema, type AgentProfileInput } from "@/lib/validations";
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

interface AgentFormProps {
  initialData?: Partial<AgentProfileInput>;
  agentId?: string;
}

export function AgentForm({ initialData, agentId }: AgentFormProps) {
  const router = useRouter();
  const isEditing = !!agentId;
  const t = useTranslations("agents");
  const tc = useTranslations("common");
  const tt = useTranslations("toasts");

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<AgentProfileInput>({
    resolver: zodResolver(agentProfileSchema),
    defaultValues: {
      name: initialData?.name || "",
      slug: initialData?.slug || "",
      description: initialData?.description || "",
      category: initialData?.category || "Custom",
      recommendedTool: initialData?.recommendedTool || "Generic",
      systemPrompt: initialData?.systemPrompt || "",
      inputTemplate: initialData?.inputTemplate || "",
      outputFormat: initialData?.outputFormat || "",
    },
  });

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setValue("name", value);
    if (!isEditing) {
      setValue("slug", slugify(value));
    }
  };

  const onSubmit = async (data: AgentProfileInput) => {
    try {
      const url = isEditing ? `/api/agents/${agentId}` : "/api/agents";
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

      toast.success(isEditing ? tt("agentUpdated") : tt("agentCreated"));
      router.push("/agents");
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
              <Label htmlFor="category">{t("category")}</Label>
              <Select
                id="category"
                {...register("category")}
                options={[
                  { value: "Bug Fixer", label: t("categories.bugFixer") },
                  { value: "Code Reviewer", label: t("categories.codeReviewer") },
                  { value: "UI Reviewer", label: t("categories.uiReviewer") },
                  { value: "Security Checker", label: t("categories.securityChecker") },
                  { value: "Docs Writer", label: t("categories.docsWriter") },
                  { value: "Release Assistant", label: t("categories.releaseAssistant") },
                  { value: "Test Writer", label: t("categories.testWriter") },
                  { value: "Refactor Planner", label: t("categories.refactorPlanner") },
                  { value: "Product Manager", label: t("categories.productManager") },
                  { value: "Custom", label: t("categories.custom") },
                ]}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="recommendedTool">{t("recommendedTool")}</Label>
              <Select
                id="recommendedTool"
                {...register("recommendedTool")}
                options={[
                  { value: "Codex", label: t("tools.codex") },
                  { value: "Claude", label: t("tools.claude") },
                  { value: "Antigravity", label: t("tools.antigravity") },
                  { value: "Cursor", label: t("tools.cursor") },
                  { value: "Generic", label: t("tools.generic") },
                ]}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("systemPrompt")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="systemPrompt">{t("systemPrompt")} *</Label>
            <Textarea
              id="systemPrompt"
              {...register("systemPrompt")}
              placeholder={t("systemPromptPlaceholder")}
              rows={10}
            />
            {errors.systemPrompt && (
              <p className="text-sm text-destructive">{errors.systemPrompt.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="inputTemplate">{t("inputTemplate")}</Label>
            <Textarea
              id="inputTemplate"
              {...register("inputTemplate")}
              placeholder={t("inputTemplatePlaceholder")}
              rows={5}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="outputFormat">{t("outputFormat")}</Label>
            <Input
              id="outputFormat"
              {...register("outputFormat")}
              placeholder={t("outputFormatPlaceholder")}
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-4">
        <Button type="button" variant="outline" onClick={() => router.back()}>
          {tc("cancel")}
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? tc("loading") : isEditing ? t("updateAgent") : t("createAgent")}
        </Button>
      </div>
    </form>
  );
}
