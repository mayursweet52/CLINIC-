const fs = require("fs");

function fixFile(path, replacer) {
  let content = fs.readFileSync(path, "utf-8");
  const newContent = replacer(content);
  if (content !== newContent) {
    fs.writeFileSync(path, newContent, "utf-8");
    console.log(`Fixed ${path}`);
  }
}

// 1. StatusBadge color prop removal
const pathsWithStatusBadge = [
  "src/app/(dashboard)/admin/notifications/page.tsx",
  "src/app/(dashboard)/admin/staff/page.tsx",
  "src/features/billing/components/BillDetail.tsx",
  "src/features/billing/components/BillsTable.tsx",
  "src/features/pharmacy/components/PendingTable.tsx",
  "src/features/schedule/components/TimeOffList.tsx"
];

pathsWithStatusBadge.forEach(p => {
  fixFile(p, (c) => c
    .replace(/<StatusBadge\s+status=\{([^}]+)\}\s+color=\{[^}]+\}\s*\/>/g, "<StatusBadge status={$1} />")
    .replace(/<StatusBadge\s+status=\{([^}]+)\}\s+color="[^"]+"\s*\/>/g, "<StatusBadge status={$1} />")
  );
});

// 2. StatCard icon prop
fixFile("src/app/(dashboard)/admin/page.tsx", (c) => {
  return c
    .replace(/icon=\{<Users className="[^"]*" \/>\}/g, "icon={Users}")
    .replace(/icon=\{<UserPlus className="[^"]*" \/>\}/g, "icon={UserPlus}")
    .replace(/icon=\{<IndianRupee className="[^"]*" \/>\}/g, "icon={IndianRupee}")
    .replace(/icon=\{<Stethoscope className="[^"]*" \/>\}/g, "icon={Stethoscope}")
    .replace(/title=/g, "label=");
});

fixFile("src/app/(dashboard)/billing/page.tsx", (c) => {
  return c
    .replace(/icon=\{<IndianRupee className="[^"]*" \/>\}/g, "icon={IndianRupee}")
    .replace(/icon=\{<Clock className="[^"]*" \/>\}/g, "icon={Clock}")
    .replace(/icon=\{<CheckCircle className="[^"]*" \/>\}/g, "icon={CheckCircle}")
    .replace(/icon=\{<RotateCcw className="[^"]*" \/>\}/g, "icon={RotateCcw}")
    .replace(/title=/g, "label=");
});

fixFile("src/app/(dashboard)/admin/reports/page.tsx", (c) => {
  return c
    .replace(/icon=\{<IndianRupee className="[^"]*" \/>\}/g, "icon={IndianRupee}")
    .replace(/icon=\{<Activity className="[^"]*" \/>\}/g, "icon={Activity}")
    .replace(/icon=\{<Users className="[^"]*" \/>\}/g, "icon={Users}")
    .replace(/icon=\{<AlertTriangle className="[^"]*" \/>\}/g, "icon={AlertTriangle}")
    .replace(/title=/g, "label=");
});

// 3. DataTable loading
const pathsWithDataTable = [
  "src/features/billing/components/BillsTable.tsx",
  "src/features/pharmacy/components/InventoryTable.tsx",
  "src/features/pharmacy/components/PendingTable.tsx",
  "src/features/reports/components/DoctorPerformance.tsx",
  "src/features/schedule/components/TimeOffList.tsx"
];

pathsWithDataTable.forEach(p => {
  fixFile(p, (c) => c.replace(/isLoading=\{isLoading\}/g, "loading={isLoading}"));
});

// 4. lucide-react
fixFile("src/app/(dashboard)/admin/staff/page.tsx", (c) => {
  return c.replace(/KeyReset/g, "Key");
});

// 5. Tooltip
fixFile("src/features/reports/components/Charts.tsx", (c) => {
  return c.replace(/\(value: number\)/g, "(value: any)");
});
