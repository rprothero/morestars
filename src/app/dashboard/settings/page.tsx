"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  ArrowLeft,
  Plus,
  Trash2,
  X,
} from "lucide-react";

import { createClient } from "@/lib/supabase/client";

import {
  getIndustryTemplateByKey,
  INDUSTRY_TEMPLATES,
  IndustryTemplateKey,
} from "@/lib/review-templates";

type Business = {
  id: string;
  business_name: string;
  business_slug: string;
  business_type: string | null;
};

type ServiceCategory = {
  id: string;
  category_name: string;
  is_active: boolean;
};

type Helper = {
  id: string;
  display_name: string;
  is_active: boolean;
};

type DeleteState =
  | {
      type: "service";
      id: string;
      name: string;
    }
  | {
      type: "helper";
      id: string;
      name: string;
    }
  | null;

export default function DashboardSettingsPage() {
  const router = useRouter();
  const supabase = createClient();

  const [loading, setLoading] = useState(true);

  const [savingService, setSavingService] = useState(false);
  const [savingHelper, setSavingHelper] = useState(false);
  const [savingBusinessType, setSavingBusinessType] = useState(false);

  const [business, setBusiness] = useState<Business | null>(null);

  const [services, setServices] = useState<ServiceCategory[]>([]);
  const [helpers, setHelpers] = useState<Helper[]>([]);

  const [newService, setNewService] = useState("");
  const [newHelper, setNewHelper] = useState("");

  const [selectedBusinessType, setSelectedBusinessType] =
    useState<IndustryTemplateKey>("general");

  const [errorMessage, setErrorMessage] = useState("");

  const [deleteState, setDeleteState] = useState<DeleteState>(null);

  async function loadSettings() {
    setErrorMessage("");

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.user) {
      router.replace("/login");
      return;
    }

    const { data: businessData } = await supabase
      .from("businesses")
      .select("id, business_name, business_slug, business_type")
      .eq("user_id", session.user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!businessData) {
      router.replace("/onboarding");
      return;
    }

    setBusiness(businessData);

    setSelectedBusinessType(
      (businessData.business_type as IndustryTemplateKey) || "general"
    );

    const { data: serviceData } = await supabase
      .from("business_service_categories")
      .select("id, category_name, is_active")
      .eq("business_id", businessData.id)
      .order("category_name", { ascending: true });

    const { data: helperData } = await supabase
      .from("business_helpers")
      .select("id, display_name, is_active")
      .eq("business_id", businessData.id)
      .order("display_name", { ascending: true });

    setServices(serviceData ?? []);
    setHelpers(helperData ?? []);

    setLoading(false);
  }

  useEffect(() => {
    loadSettings();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function saveBusinessType() {
    if (!business) {
      return;
    }

    setSavingBusinessType(true);
    setErrorMessage("");

    const { error: businessError } = await supabase
      .from("businesses")
      .update({
        business_type: selectedBusinessType,
      })
      .eq("id", business.id);

    if (businessError) {
      setErrorMessage(businessError.message);
      setSavingBusinessType(false);
      return;
    }

    const template = getIndustryTemplateByKey(selectedBusinessType);

    const existingNames = services.map((service) =>
      service.category_name.trim().toLowerCase()
    );

    const missingCategories = template.serviceCategories.filter(
      (category) =>
        !existingNames.includes(category.trim().toLowerCase())
    );

    if (missingCategories.length > 0) {
      const inserts = missingCategories.map((category) => ({
        business_id: business.id,
        category_name: category,
      }));

      const { error: insertError } = await supabase
        .from("business_service_categories")
        .insert(inserts);

      if (insertError) {
        setErrorMessage(insertError.message);
        setSavingBusinessType(false);
        return;
      }
    }

    await loadSettings();

    setSavingBusinessType(false);
  }

  async function addService() {
    if (!business || newService.trim().length === 0) {
      return;
    }

    setSavingService(true);
    setErrorMessage("");

    const { error } = await supabase.from("business_service_categories").insert({
      business_id: business.id,
      category_name: newService.trim(),
    });

    if (error) {
      setErrorMessage(error.message);
      setSavingService(false);
      return;
    }

    setNewService("");

    await loadSettings();

    setSavingService(false);
  }

  async function addHelper() {
    if (!business || newHelper.trim().length === 0) {
      return;
    }

    setSavingHelper(true);
    setErrorMessage("");

    const { error } = await supabase.from("business_helpers").insert({
      business_id: business.id,
      display_name: newHelper.trim(),
    });

    if (error) {
      setErrorMessage(error.message);
      setSavingHelper(false);
      return;
    }

    setNewHelper("");

    await loadSettings();

    setSavingHelper(false);
  }

  async function toggleService(service: ServiceCategory) {
    setErrorMessage("");

    const { error } = await supabase
      .from("business_service_categories")
      .update({
        is_active: !service.is_active,
      })
      .eq("id", service.id);

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    await loadSettings();
  }

  async function toggleHelper(helper: Helper) {
    setErrorMessage("");

    const { error } = await supabase
      .from("business_helpers")
      .update({
        is_active: !helper.is_active,
      })
      .eq("id", helper.id);

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    await loadSettings();
  }

  async function confirmDelete() {
    if (!deleteState) {
      return;
    }

    setErrorMessage("");

    if (deleteState.type === "service") {
      const { error } = await supabase
        .from("business_service_categories")
        .delete()
        .eq("id", deleteState.id);

      if (error) {
        setErrorMessage(error.message);
        return;
      }
    }

    if (deleteState.type === "helper") {
      const { error } = await supabase
        .from("business_helpers")
        .delete()
        .eq("id", deleteState.id);

      if (error) {
        setErrorMessage(error.message);
        return;
      }
    }

    setDeleteState(null);

    await loadSettings();
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-background px-6 py-10 text-foreground">
        <div className="mx-auto max-w-5xl rounded-[2rem] border border-border bg-card p-8 shadow-sm">
          <p className="text-muted-foreground">Loading settings...</p>
        </div>
      </main>
    );
  }

  if (!business) {
    return null;
  }

  return (
    <main className="min-h-screen bg-background px-6 py-10 text-foreground">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 text-sm font-bold text-primary"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to dashboard
            </Link>

            <p className="mt-6 text-sm font-black uppercase tracking-[0.22em] text-primary">
              MoreStars Settings
            </p>

            <h1 className="mt-3 text-4xl font-black tracking-tight text-secondary">
              Services & Team
            </h1>

            <p className="mt-3 max-w-2xl leading-7 text-muted-foreground">
              Manage the customer experience structure for{" "}
              {business.business_name}.
            </p>
          </div>
        </div>

        {errorMessage && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
            {errorMessage}
          </div>
        )}

        <section className="mb-6 rounded-[2rem] border border-border bg-card p-8 shadow-sm">
          <h2 className="text-2xl font-black text-secondary">
            Business Industry
          </h2>

          <p className="mt-2 max-w-2xl leading-7 text-muted-foreground">
            Choose the industry that best fits your business. MoreStars will
            automatically suggest and organize service categories based on this
            selection.
          </p>

          <div className="mt-6 flex flex-col gap-3 md:flex-row">
            <select
              value={selectedBusinessType}
              onChange={(event) =>
                setSelectedBusinessType(
                  event.target.value as IndustryTemplateKey
                )
              }
              className="w-full rounded-2xl border border-border bg-background px-5 py-4 text-sm font-bold outline-none transition focus:border-primary focus:ring-4 focus:ring-blue-100"
            >
              {INDUSTRY_TEMPLATES.map((template) => (
                <option key={template.key} value={template.key}>
                  {template.label}
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={saveBusinessType}
              disabled={savingBusinessType}
              className="rounded-2xl bg-primary px-6 py-4 text-sm font-black text-white transition hover:bg-blue-700 disabled:opacity-50"
            >
              {savingBusinessType ? "Saving..." : "Save Industry"}
            </button>
          </div>

          <div className="mt-4 rounded-2xl border border-blue-100 bg-blue-50 p-4 text-sm font-medium text-blue-900">
            Saving an industry will automatically add recommended service
            categories that are missing. Existing custom categories will never
            be deleted.
          </div>
        </section>

        <div className="grid gap-6 lg:grid-cols-2">
          <section className="rounded-[2rem] border border-border bg-card p-8 shadow-sm">
            <h2 className="text-2xl font-black text-secondary">
              Service Categories
            </h2>

            <p className="mt-2 leading-7 text-muted-foreground">
              These appear as quick-select buttons when customers answer:
              “What did we help you with?”
            </p>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <input
                type="text"
                value={newService}
                onChange={(event) => setNewService(event.target.value)}
                placeholder="Example: Water Heater Repair"
                className="w-full rounded-2xl border border-border bg-background px-5 py-4 text-sm font-medium outline-none transition focus:border-primary focus:ring-4 focus:ring-blue-100"
              />

              <button
                type="button"
                onClick={addService}
                disabled={savingService || newService.trim().length === 0}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-5 py-4 text-sm font-black text-white transition hover:bg-blue-700 disabled:opacity-50"
              >
                <Plus className="h-4 w-4" />
                Add
              </button>
            </div>

            <div className="mt-6 space-y-3">
              {services.length > 0 ? (
                services.map((service) => (
                  <div
                    key={service.id}
                    className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-background p-4"
                  >
                    <div>
                      <div className="font-black text-secondary">
                        {service.category_name}
                      </div>

                      <div className="mt-1 text-xs font-bold text-muted-foreground">
                        {service.is_active ? "Active" : "Hidden from review flow"}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => toggleService(service)}
                        className="rounded-xl border border-border bg-white px-3 py-2 text-xs font-black text-secondary transition hover:border-primary hover:text-primary"
                      >
                        {service.is_active ? "Hide" : "Show"}
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          setDeleteState({
                            type: "service",
                            id: service.id,
                            name: service.category_name,
                          })
                        }
                        className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-black text-red-700 transition hover:bg-red-100"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-2xl border border-dashed border-border p-8 text-center">
                  <div className="font-black text-secondary">
                    No service categories yet
                  </div>

                  <p className="mt-2 text-sm text-muted-foreground">
                    Add the services this business wants to track.
                  </p>
                </div>
              )}
            </div>
          </section>

          <section className="rounded-[2rem] border border-border bg-card p-8 shadow-sm">
            <h2 className="text-2xl font-black text-secondary">
              Team Members / Helpers
            </h2>

            <p className="mt-2 leading-7 text-muted-foreground">
              These appear as optional quick-select buttons when customers answer:
              “Who helped you?”
            </p>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <input
                type="text"
                value={newHelper}
                onChange={(event) => setNewHelper(event.target.value)}
                placeholder="Example: Sarah Johnson"
                className="w-full rounded-2xl border border-border bg-background px-5 py-4 text-sm font-medium outline-none transition focus:border-primary focus:ring-4 focus:ring-blue-100"
              />

              <button
                type="button"
                onClick={addHelper}
                disabled={savingHelper || newHelper.trim().length === 0}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-5 py-4 text-sm font-black text-white transition hover:bg-blue-700 disabled:opacity-50"
              >
                <Plus className="h-4 w-4" />
                Add
              </button>
            </div>

            <div className="mt-6 space-y-3">
              {helpers.length > 0 ? (
                helpers.map((helper) => (
                  <div
                    key={helper.id}
                    className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-background p-4"
                  >
                    <div>
                      <div className="font-black text-secondary">
                        {helper.display_name}
                      </div>

                      <div className="mt-1 text-xs font-bold text-muted-foreground">
                        {helper.is_active ? "Active" : "Hidden from review flow"}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => toggleHelper(helper)}
                        className="rounded-xl border border-border bg-white px-3 py-2 text-xs font-black text-secondary transition hover:border-primary hover:text-primary"
                      >
                        {helper.is_active ? "Hide" : "Show"}
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          setDeleteState({
                            type: "helper",
                            id: helper.id,
                            name: helper.display_name,
                          })
                        }
                        className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-black text-red-700 transition hover:bg-red-100"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-2xl border border-dashed border-border p-8 text-center">
                  <div className="font-black text-secondary">
                    No team members yet
                  </div>

                  <p className="mt-2 text-sm text-muted-foreground">
                    Add team members, technicians, servers, agents, or staff.
                  </p>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>

      {deleteState && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-6">
          <div className="w-full max-w-md rounded-[2rem] border border-border bg-card p-8 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-red-50 p-3 text-red-600">
                  <AlertTriangle className="h-6 w-6" />
                </div>

                <div>
                  <h2 className="text-2xl font-black text-secondary">
                    Confirm Delete
                  </h2>

                  <p className="mt-1 text-sm text-muted-foreground">
                    This action cannot be undone.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setDeleteState(null)}
                className="rounded-xl border border-border bg-white p-2 text-secondary transition hover:border-primary hover:text-primary"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4">
              <div className="text-sm font-semibold text-red-700">
                You are about to permanently delete:
              </div>

              <div className="mt-2 text-lg font-black text-secondary">
                {deleteState.name}
              </div>
            </div>

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setDeleteState(null)}
                className="rounded-2xl border border-border bg-white px-5 py-3 text-sm font-black text-secondary transition hover:border-primary hover:text-primary"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={confirmDelete}
                className="rounded-2xl bg-red-600 px-5 py-3 text-sm font-black text-white transition hover:bg-red-700"
              >
                Permanently Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}