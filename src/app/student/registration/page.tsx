"use client";
import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge, statusVariant } from "@/components/ui/Badge";
import { Spinner } from "@/components/ui/Spinner";
import { useToast } from "@/components/ui/Toast";
import { CheckCircle, PlusCircle, BookOpen, CalendarBlank, LockOpen, DownloadSimple, Receipt, X } from "@phosphor-icons/react";
import { SEMESTERS } from "@/types";

type Offering = {
  _id: string;
  courseId: { _id: string; code: string; title: string; credits: number };
  section: string;
  semesterLabel: string;
  teacherId?: { name: string };
};

type GroupedOffering = {
  representativeId: string; // _id of the first offering — used as the checkbox key
  allIds: string[]; // all section IDs for this course (one per teacher)
  courseId: { _id: string; code: string; title: string; credits: number };
  teachers: string[]; // all teacher names for this course
};

type Registration = {
  _id: string;
  studentId?: { name?: string; userId?: string };
  semesterLabel: string;
  academicYear: string;
  status: string;
  billing?: {
    provider: "Stripe";
    currency: "BDT";
    takaPerCredit: number;
    totalCredits: number;
    tuitionAmount: number;
    totalAmount: number;
  };
  courseOfferingIds: Offering[];
  paymentCompletedAt?: string;
  paymentProvider?: "Stripe";
  paymentAmount?: number;
  paymentCurrency?: "BDT";
  paymentReference?: string;
  rejectionReason?: string;
  advisorId?: { name: string };
  headId?: { name: string };
  createdAt: string;
};

type OpenWindow = { _id: string; semesterLabel: string; academicYear: string; takaPerCredit: number };

const STATUS_STEPS = [
  { key: "pending_advisor", label: "Submitted" },
  { key: "pending_head", label: "Advisor ✓" },
  { key: "payment_pending", label: "Head ✓" },
  { key: "admitted", label: "Admitted" },
];

function getStepIndex(status: string) {
  const order = ["pending_advisor", "pending_head", "payment_pending", "admitted"];
  return order.indexOf(status);
}

function formatBdt(amount: number | undefined) {
  return `BDT ${Number(amount ?? 0).toLocaleString()}`;
}

function formatDate(value: string | undefined) {
  if (!value) return "N/A";
  return new Intl.DateTimeFormat("en-BD", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function getCourseRows(registration: Registration) {
  const rows = new Map<string, { code: string; title: string; credits: number; teachers: string[] }>();

  for (const offering of registration.courseOfferingIds ?? []) {
    const course = offering.courseId;
    if (!course?._id && !course?.code) continue;
    const key = course._id ?? course.code;

    if (!rows.has(key)) {
      rows.set(key, {
        code: course.code,
        title: course.title,
        credits: course.credits,
        teachers: [],
      });
    }

    const teacher = offering.teacherId?.name;
    if (teacher && !rows.get(key)!.teachers.includes(teacher)) {
      rows.get(key)!.teachers.push(teacher);
    }
  }

  return Array.from(rows.values());
}

function getPaymentSummary(registration: Registration) {
  const courses = getCourseRows(registration);
  const totalCredits =
    registration.billing?.totalCredits ??
    courses.reduce((sum, course) => sum + (course.credits ?? 0), 0);
  const takaPerCredit =
    registration.billing?.takaPerCredit ??
    (totalCredits > 0 && registration.paymentAmount
      ? Math.round(registration.paymentAmount / totalCredits)
      : 2200);
  const tuitionAmount =
    registration.billing?.tuitionAmount ??
    registration.paymentAmount ??
    Math.round(totalCredits * takaPerCredit);
  const totalAmount = registration.paymentAmount ?? registration.billing?.totalAmount ?? tuitionAmount;

  return {
    courses,
    totalCredits,
    takaPerCredit,
    tuitionAmount,
    totalAmount,
  };
}

async function downloadPayslip(registration: Registration) {
  const { PDFDocument, StandardFonts, rgb } = await import("pdf-lib");
  const summary = getPaymentSummary(registration);
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595, 842]);
  const regular = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const bold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const textColor = rgb(0.15, 0.19, 0.28);
  const mutedColor = rgb(0.42, 0.48, 0.58);
  const accentColor = rgb(0.31, 0.27, 0.9);

  function truncate(value: string, max = 72) {
    return value.length > max ? `${value.slice(0, max - 3)}...` : value;
  }

  function drawText(text: string, x: number, y: number, size = 10, font = regular, color = textColor) {
    page.drawText(text, { x, y, size, font, color });
  }

  page.drawRectangle({ x: 0, y: 770, width: 595, height: 72, color: rgb(0.94, 0.95, 1) });
  drawText("AcademiaOne", 40, 808, 22, bold, accentColor);
  drawText("Payment Payslip", 40, 785, 13, regular, mutedColor);
  drawText("PAID", 500, 806, 14, bold, rgb(0.05, 0.55, 0.32));

  const student = registration.studentId;
  const receiptNo = registration.paymentReference ?? registration._id;
  const paidAt = registration.paymentCompletedAt ?? new Date().toISOString();

  drawText("Student", 40, 730, 10, bold, mutedColor);
  drawText(`${student?.name ?? "Student"} (${student?.userId ?? "N/A"})`, 40, 712, 12, regular);
  drawText("Semester", 330, 730, 10, bold, mutedColor);
  drawText(`${registration.semesterLabel} / ${registration.academicYear}`, 330, 712, 12, regular);

  drawText("Receipt Reference", 40, 675, 10, bold, mutedColor);
  drawText(truncate(receiptNo, 58), 40, 657, 11, regular);
  drawText("Paid On", 330, 675, 10, bold, mutedColor);
  drawText(formatDate(paidAt), 330, 657, 11, regular);

  page.drawLine({ start: { x: 40, y: 625 }, end: { x: 555, y: 625 }, thickness: 1, color: rgb(0.85, 0.88, 0.92) });
  drawText("Course", 40, 604, 10, bold, mutedColor);
  drawText("Credits", 415, 604, 10, bold, mutedColor);
  drawText("Teacher", 470, 604, 10, bold, mutedColor);

  let y = 578;
  summary.courses.forEach((course) => {
    drawText(`${course.code} - ${truncate(course.title, 48)}`, 40, y, 10, regular);
    drawText(String(course.credits), 425, y, 10, regular);
    drawText(truncate(course.teachers.join(", ") || "TBA", 18), 470, y, 10, regular);
    y -= 22;
  });

  y = Math.min(y - 16, 410);
  page.drawRectangle({ x: 315, y: y - 100, width: 240, height: 118, color: rgb(0.97, 0.98, 1), borderColor: rgb(0.86, 0.88, 0.94), borderWidth: 1 });
  drawText("Rate per credit", 335, y - 10, 10, regular, mutedColor);
  drawText(formatBdt(summary.takaPerCredit), 465, y - 10, 10, regular);
  drawText(`Tuition (${summary.totalCredits} credits)`, 335, y - 35, 10, regular, mutedColor);
  drawText(formatBdt(summary.tuitionAmount), 465, y - 35, 10, regular);
  drawText("Total Paid", 335, y - 72, 13, bold);
  drawText(formatBdt(summary.totalAmount), 455, y - 72, 13, bold, accentColor);

  drawText("This payslip was generated after Stripe payment verification.", 40, 80, 9, regular, mutedColor);
  drawText("AcademiaOne Student Registration", 40, 62, 9, regular, mutedColor);

  const pdfBytes = await pdfDoc.save();
  const blob = new Blob([pdfBytes as BlobPart], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  const safeRef = String(registration.paymentReference ?? registration._id).replace(/[^a-z0-9-]+/gi, "-");
  link.href = url;
  link.download = `payslip-${registration.semesterLabel}-${registration.academicYear}-${safeRef}.pdf`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export default function RegistrationPage() {
  return (
    <DashboardLayout role="student" title="Course Registration" breadcrumb="Home / Registration">
      <RegistrationContent />
    </DashboardLayout>
  );
}

function RegistrationContent() {
  const { data: session } = useSession();
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [openWindows, setOpenWindows] = useState<OpenWindow[]>([]);
  const [completedSemesters, setCompletedSemesters] = useState<string[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [selectedWindowId, setSelectedWindowId] = useState("");
  const [availableOfferings, setAvailableOfferings] = useState<Offering[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [loadingOfferings, setLoadingOfferings] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [paymentCompleteRegistration, setPaymentCompleteRegistration] = useState<Registration | null>(null);
  const fetchAll = useCallback(async () => {
    const [regRes, winRes, resultRes] = await Promise.all([
      fetch("/api/registrations"),
      fetch("/api/registration-windows?isOpen=true"),
      fetch("/api/results"),
    ]);
    const [regData, winData, resultData] = await Promise.all([
      regRes.json(), winRes.json(), resultRes.json(),
    ]);
    const nextRegistrations = (regData.data ?? []) as Registration[];
    setRegistrations(nextRegistrations);
    setOpenWindows(winData.data ?? []);
    setCompletedSemesters((resultData.data ?? []).map((r: { semesterLabel: string }) => r.semesterLabel));
    setLoading(false);
    return nextRegistrations;
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  useEffect(() => {
    const payment = searchParams.get("payment");
    if (payment !== "success") return;

    let cancelled = false;

    async function showPaymentComplete() {
      const updatedRegistrations = await fetchAll();
      if (cancelled) return;

      const registrationId = searchParams.get("registrationId");
      const completedRegistration =
        updatedRegistrations.find((registration) => registration._id === registrationId) ??
        updatedRegistrations.find((registration) => registration.status === "admitted") ??
        null;

      if (completedRegistration) {
        setPaymentCompleteRegistration(completedRegistration);
      }

      const next = new URLSearchParams(searchParams.toString());
      next.delete("payment");
      next.delete("registrationId");
      const query = next.toString();
      router.replace(query ? `/student/registration?${query}` : "/student/registration");
    }

    showPaymentComplete();
    return () => {
      cancelled = true;
    };
  }, [fetchAll, router, searchParams]);

  const selectedWindow = openWindows.find((w) => w._id === selectedWindowId) ?? null;
  const semester = selectedWindow?.semesterLabel ?? "";
  const academicYear = selectedWindow?.academicYear ?? "";

  function isWindowEligible(w: OpenWindow) {
    const idx = SEMESTERS.indexOf(w.semesterLabel as typeof SEMESTERS[number]);
    return idx === 0 || completedSemesters.includes(SEMESTERS[idx - 1]);
  }

  function alreadyRegistered(w: OpenWindow) {
    return registrations.some(
      (r) => r.semesterLabel === w.semesterLabel && r.academicYear === w.academicYear && r.status !== "rejected"
    );
  }

  function openForm() {
    setSelectedWindowId("");
    setSelectedIds(new Set());
    setAvailableOfferings([]);
    setShowForm(true);
  }

  // Load offerings when window selection changes
  useEffect(() => {
    if (!semester) { setAvailableOfferings([]); return; }
    const dept = session?.user?.departmentId;
    if (!dept) return;
    setLoadingOfferings(true);
    setSelectedIds(new Set());
    setAvailableOfferings([]);
    fetch(`/api/sections?semester=${encodeURIComponent(semester)}&dept=${encodeURIComponent(dept)}`)
      .then((r) => r.json())
      .then((d) => { setAvailableOfferings(d.data ?? []); setLoadingOfferings(false); })
      .catch(() => { setAvailableOfferings([]); setLoadingOfferings(false); toast("Failed to load courses", "error"); });
  }, [semester, session?.user?.departmentId]);

  function toggleOffering(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  async function handleSubmit() {
    if (!semester) return toast("Select a registration window", "error");
    if (selectedIds.size === 0) return toast("Select at least one course", "error");
    setSubmitting(true);
    // Build repId → allIds map from availableOfferings
    const repToAllIds = new Map<string, string[]>();
    for (const o of availableOfferings) {
      const cid = o.courseId._id;
      // Find the rep for this course (first seen)
      const rep = availableOfferings.find((x) => x.courseId._id === cid)!._id;
      if (!repToAllIds.has(rep)) repToAllIds.set(rep, []);
      repToAllIds.get(rep)!.push(o._id);
    }
    // Expand each selected repId to all section IDs for that course
    const allSelectedIds: string[] = [];
    for (const repId of selectedIds) {
      const ids = repToAllIds.get(repId);
      if (ids) allSelectedIds.push(...ids);
      else allSelectedIds.push(repId);
    }
    const res = await fetch("/api/registrations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        semesterLabel: semester,
        academicYear,
        courseOfferingIds: allSelectedIds,
      }),
    });
    const d = await res.json();
    if (d.success) {
      toast("Registration submitted! Awaiting advisor approval.", "success");
      setShowForm(false);
      setSelectedWindowId("");
      setSelectedIds(new Set());
      fetchAll();
    } else {
      toast(d.error ?? "Failed to submit", "error");
    }
    setSubmitting(false);
  }

  function handlePay(regId: string) {
    router.push(`/student/registration/payment/${regId}`);
  }

  if (loading) return <div className="flex justify-center py-24"><Spinner /></div>;

  const activeRegistrations = registrations.filter((r) => r.status !== "rejected");
  const paymentCompleteSummary = paymentCompleteRegistration ? getPaymentSummary(paymentCompleteRegistration) : null;

  return (
    <div className="max-w-3xl mx-auto space-y-5">

      {/* Open windows banner */}
      {openWindows.length > 0 && !showForm && (
        <Card>
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <p className="font-semibold text-slate-700 text-sm">Open Registration Windows</p>
              <div className="flex flex-wrap gap-2 mt-2">
                {openWindows.map((w) => {
                  const eligible = isWindowEligible(w);
                  const done = alreadyRegistered(w);
                  return (
                    <span
                      key={w._id}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border ${
                        done
                          ? "bg-slate-50 border-slate-200 text-slate-400"
                          : eligible
                          ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                          : "bg-amber-50 border-amber-200 text-amber-600"
                      }`}
                    >
                      <LockOpen size={12} />
                      Sem {w.semesterLabel} · {w.academicYear} · BDT {Number(w.takaPerCredit ?? 2200).toLocaleString()} / credit
                      {done && <span className="ml-1">(registered)</span>}
                      {!done && !eligible && <span className="ml-1">(prev result pending)</span>}
                    </span>
                  );
                })}
              </div>
            </div>
            <Button size="sm" onClick={openForm}><PlusCircle size={15} className="mr-1" /> New Registration</Button>
          </div>
        </Card>
      )}

      {/* No windows and no registrations */}
      {openWindows.length === 0 && activeRegistrations.length === 0 && !showForm && (
        <Card>
          <div className="text-center py-10">
            <BookOpen size={40} className="mx-auto text-slate-200 mb-3" />
            <p className="text-slate-500 font-medium mb-1">No registration windows open</p>
            <p className="text-slate-400 text-sm">Check back later or contact the admin.</p>
          </div>
        </Card>
      )}

      {/* Active registrations list */}
      {activeRegistrations.map((registration) => {
        const stepIdx = getStepIndex(registration.status);
        const offerings: Offering[] = registration.courseOfferingIds ?? [];

        return (
          <Card key={registration._id}>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-bold text-slate-800">Semester {registration.semesterLabel}</h3>
                <p className="text-xs text-slate-400">{registration.academicYear}</p>
              </div>
              <Badge variant={statusVariant(registration.status)}>
                {registration.status.replace(/_/g, " ").toUpperCase()}
              </Badge>
            </div>

            {/* Stepper */}
            <div className="relative flex justify-between mb-8">
              <div className="absolute top-4 left-8 right-8 h-0.5 bg-slate-200 z-0" />
              {STATUS_STEPS.map((step, i) => {
                const done = stepIdx >= i;
                return (
                  <div key={step.key} className="relative z-10 flex flex-col items-center gap-1.5 min-w-[56px]">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-colors ${done ? "bg-indigo-600 border-indigo-600 text-white" : "bg-white border-slate-300 text-slate-400"}`}>
                      {done ? <CheckCircle size={16} weight="bold" /> : i + 1}
                    </div>
                    <span className={`text-xs text-center font-medium ${done ? "text-indigo-600" : "text-slate-400"}`}>{step.label}</span>
                  </div>
                );
              })}
            </div>

            {/* Course table — grouped by course so multiple teachers show on one row */}
            {offerings.length > 0 && (() => {
              const groupMap = new Map<string, { code: string; title: string; credits: number; teachers: string[] }>();
              for (const o of offerings) {
                const cid = o.courseId?._id;
                if (!cid) continue;
                if (!groupMap.has(cid)) {
                  groupMap.set(cid, { code: o.courseId.code, title: o.courseId.title, credits: o.courseId.credits, teachers: [] });
                }
                const t = o.teacherId?.name;
                if (t && !groupMap.get(cid)!.teachers.includes(t)) groupMap.get(cid)!.teachers.push(t);
              }
              const rows = Array.from(groupMap.values());
              const uniqueCredits = rows.reduce((s, r) => s + (r.credits ?? 0), 0);
              return (
                <div className="overflow-x-auto mb-5">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b border-slate-100">
                        <th className="text-left py-2 px-3 text-xs uppercase text-slate-400 font-semibold">Course</th>
                        <th className="text-left py-2 px-3 text-xs uppercase text-slate-400 font-semibold">Cr</th>
                        <th className="text-left py-2 px-3 text-xs uppercase text-slate-400 font-semibold">Teacher</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map((r) => (
                        <tr key={r.code} className="border-b border-slate-50">
                          <td className="py-2.5 px-3 text-sm font-semibold text-slate-700">{r.code} <span className="font-normal text-slate-500">— {r.title}</span></td>
                          <td className="py-2.5 px-3 text-sm text-slate-500">{r.credits}</td>
                          <td className="py-2.5 px-3 text-sm text-slate-500">{r.teachers.length > 0 ? r.teachers.join(", ") : "—"}</td>
                        </tr>
                      ))}
                      <tr className="bg-slate-50">
                        <td className="py-2 px-3 text-xs font-bold text-slate-600">Total</td>
                        <td className="py-2 px-3 text-xs font-bold text-indigo-600">{uniqueCredits}</td>
                        <td />
                      </tr>
                    </tbody>
                  </table>
                </div>
              );
            })()}

            {registration.status === "pending_advisor" && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-700">
                ⏳ Waiting for your department advisor{registration.advisorId ? ` (${registration.advisorId.name})` : ""} to approve.
              </div>
            )}
            {registration.status === "pending_head" && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-sm text-blue-700">
                ⏳ Advisor approved{registration.advisorId ? ` (${registration.advisorId.name})` : ""}. Waiting for department head.
              </div>
            )}
            {registration.status === "payment_pending" && (
              <div className="flex items-center justify-between p-3 bg-indigo-50 border border-indigo-200 rounded-xl">
                <span className="text-sm text-indigo-700 font-medium">
                  ✓ Both approvals received. Pay {registration.billing ? `BDT ${registration.billing.totalAmount.toLocaleString()}` : "now"} with Stripe to get admitted.
                </span>
                <Button onClick={() => handlePay(registration._id)} size="sm">Pay with Stripe</Button>
              </div>
            )}
            {registration.status === "admitted" && (
              <div className="flex items-center justify-between gap-3 p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
                <span className="text-sm text-emerald-700 font-medium">
                  Admitted. You are enrolled in Semester {registration.semesterLabel} ({registration.academicYear}).
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => { void downloadPayslip(registration); }}
                  className="shrink-0"
                >
                  <DownloadSimple size={14} />
                  Payslip
                </Button>
              </div>
            )}
          </Card>
        );
      })}

      {/* Rejected registrations */}
      {registrations.filter((r) => r.status === "rejected").map((registration) => (
        <Card key={registration._id}>
          <div className="flex items-center justify-between mb-2">
            <span className="font-semibold text-slate-600 text-sm">Semester {registration.semesterLabel} · {registration.academicYear}</span>
            <Badge variant="danger">REJECTED</Badge>
          </div>
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
            ✗ Registration rejected.{registration.rejectionReason && <span className="block mt-1 font-medium">Reason: {registration.rejectionReason}</span>}
          </div>
        </Card>
      ))}

      {/* Registration form */}
      {showForm && (
        <Card>
          <h3 className="text-lg font-bold text-slate-800 mb-5 flex items-center gap-2">
            <PlusCircle size={20} className="text-indigo-600" /> New Registration
          </h3>

          <div className="mb-5">
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Select Registration Window *</label>
            {openWindows.length === 0 ? (
              <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-700">
                <CalendarBlank size={15} /> No open registration windows.
              </div>
            ) : (
              <select
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                value={selectedWindowId}
                onChange={(e) => setSelectedWindowId(e.target.value)}
              >
                <option value="">— Select semester &amp; session —</option>
                {openWindows.map((w) => {
                  const eligible = isWindowEligible(w);
                  const done = alreadyRegistered(w);
                  return (
                    <option key={w._id} value={w._id} disabled={!eligible || done}>
                      Sem {w.semesterLabel} · {w.academicYear}
                      {done ? " (already registered)" : !eligible ? " (previous result pending)" : ""}
                    </option>
                  );
                })}
              </select>
            )}
          </div>

          {semester && (
            <div className="mb-5">
              <p className="text-sm font-semibold text-slate-700 mb-3">
                Available Courses{!loadingOfferings && <span className="text-slate-400 font-normal ml-1">({availableOfferings.length})</span>}
              </p>
              {loadingOfferings ? (
                <div className="flex justify-center py-8"><Spinner /></div>
              ) : availableOfferings.length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-sm border border-dashed border-slate-200 rounded-xl">
                  No courses found for semester {semester} in your department.
                </div>
              ) : (() => {
                // Group offerings by course — multiple teachers for same course = one card
                const grouped: GroupedOffering[] = [];
                const seen = new Map<string, number>();
                for (const o of availableOfferings) {
                  const cid = o.courseId._id;
                  if (seen.has(cid)) {
                    grouped[seen.get(cid)!].allIds.push(o._id);
                    if (o.teacherId?.name) grouped[seen.get(cid)!].teachers.push(o.teacherId.name);
                  } else {
                    seen.set(cid, grouped.length);
                    grouped.push({
                      representativeId: o._id,
                      allIds: [o._id],
                      courseId: o.courseId,
                      teachers: o.teacherId?.name ? [o.teacherId.name] : [],
                    });
                  }
                }
                const selectedCredits = grouped
                  .filter((g) => selectedIds.has(g.representativeId))
                  .reduce((s, g) => s + g.courseId.credits, 0);
                const selectedAmount = Math.round(
                  selectedCredits * Number(selectedWindow?.takaPerCredit ?? 2200)
                );
                return (
                  <>
                    <div className="space-y-2">
                      {grouped.map((g) => {
                        const checked = selectedIds.has(g.representativeId);
                        const teacherLabel = g.teachers.length > 0 ? g.teachers.join(", ") : "TBA";
                        return (
                          <button key={g.representativeId} type="button" onClick={() => toggleOffering(g.representativeId)}
                            className={`w-full flex items-center justify-between p-3 rounded-xl border-2 text-left transition-all ${checked ? "border-indigo-500 bg-indigo-50" : "border-slate-200 bg-white hover:border-indigo-200"}`}>
                            <div className="flex items-center gap-3">
                              <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors flex-shrink-0 ${checked ? "bg-indigo-600 border-indigo-600" : "border-slate-300"}`}>
                                {checked && <CheckCircle size={13} weight="bold" className="text-white" />}
                              </div>
                              <div>
                                <p className="text-sm font-semibold text-slate-700">{g.courseId.code} — {g.courseId.title}</p>
                                <p className="text-xs text-slate-400">Teacher{g.teachers.length > 1 ? "s" : ""}: {teacherLabel}</p>
                              </div>
                            </div>
                            <span className="text-xs font-bold text-indigo-600 shrink-0 ml-3">{g.courseId.credits} cr</span>
                          </button>
                        );
                      })}
                    </div>
                    {selectedIds.size > 0 && (
                      <div className="mt-3 p-3 bg-indigo-50 rounded-xl text-sm text-indigo-700 font-medium">
                        Selected: {selectedIds.size} course{selectedIds.size > 1 ? "s" : ""} · {selectedCredits} credits · BDT {selectedAmount.toLocaleString()}
                      </div>
                    )}
                  </>
                );
              })()}
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Button variant="outline" onClick={() => { setShowForm(false); setSelectedWindowId(""); setSelectedIds(new Set()); setAvailableOfferings([]); }}>Cancel</Button>
            <Button onClick={handleSubmit} isLoading={submitting} disabled={!semester || selectedIds.size === 0}>Submit Registration</Button>
          </div>
        </Card>
      )}

      {paymentCompleteRegistration && paymentCompleteSummary && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4">
          <div className="w-full max-w-xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-6 py-5">
              <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                  <Receipt size={24} weight="duotone" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-800">Payment Complete</h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Semester {paymentCompleteRegistration.semesterLabel} ({paymentCompleteRegistration.academicYear})
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setPaymentCompleteRegistration(null)}
                className="rounded-full p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                aria-label="Close payment complete window"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-5 px-6 py-5">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs uppercase tracking-wide text-slate-400">Total Paid</p>
                  <p className="mt-2 text-2xl font-bold text-emerald-600">{formatBdt(paymentCompleteSummary.totalAmount)}</p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs uppercase tracking-wide text-slate-400">Reference</p>
                  <p className="mt-2 break-all font-mono text-xs font-semibold text-slate-700">
                    {paymentCompleteRegistration.paymentReference ?? paymentCompleteRegistration._id}
                  </p>
                </div>
              </div>

              <div className="rounded-xl border border-slate-200">
                <div className="grid grid-cols-[1fr_80px] border-b border-slate-100 px-4 py-2 text-xs font-semibold uppercase text-slate-400">
                  <span>Course</span>
                  <span className="text-right">Credits</span>
                </div>
                <div className="max-h-52 overflow-auto">
                  {paymentCompleteSummary.courses.map((course) => (
                    <div key={course.code} className="grid grid-cols-[1fr_80px] gap-3 border-b border-slate-50 px-4 py-3 last:border-b-0">
                      <div>
                        <p className="text-sm font-semibold text-slate-700">{course.code}</p>
                        <p className="text-xs text-slate-500">{course.title}</p>
                      </div>
                      <p className="text-right text-sm font-medium text-slate-600">{course.credits}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-xl bg-indigo-50 px-4 py-3 text-sm text-indigo-700">
                Admission is complete and your enrollment has been confirmed.
              </div>

              <div className="flex flex-wrap justify-end gap-3 border-t border-slate-100 pt-4">
                <Button variant="outline" onClick={() => setPaymentCompleteRegistration(null)}>
                  Done
                </Button>
                <Button onClick={() => { void downloadPayslip(paymentCompleteRegistration); }}>
                  <DownloadSimple size={16} />
                  Download Payslip
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
