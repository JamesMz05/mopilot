"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { Role, CATEGORY_LABELS } from "@/lib/types";

const CATEGORY_ORDER = ["kundennah", "betrieb", "strategie"];
const CATEGORY_STYLES: Record<string, { border: string; dot: string; heading: string; badge: string }> = {
  kundennah: { border: "border-l-emerald-400", dot: "bg-emerald-500", heading: "text-emerald-700", badge: "bg-emerald-100 text-emerald-700" },
  betrieb: { border: "border-l-blue-400", dot: "bg-blue-500", heading: "text-blue-700", badge: "bg-blue-100 text-blue-700" },
  strategie: { border: "border-l-amber-400", dot: "bg-amber-500", heading: "text-amber-700", badge: "bg-amber-100 text-amber-700" },
};
const CATEGORY_HIERARCHY: Record<string, string[]> = {
  kundennah: ["kundennah"],
  betrieb: ["kundennah", "betrieb"],
  strategie: ["kundennah", "betrieb", "strategie"],
};

export default function Home() {
  const { user } = useAuth();
  const [roles, setRoles] = useState<Record<string, Role[]>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch<Record<string, Role[]>>("/roles")
      .then(setRoles)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Flat list of all roles for hierarchy lookup
  const allRoles = Object.values(roles).flat();

  const canAccess = (role: Role) => {
    if (!user) return false;
    if (user.user_type === "admin" || user.user_type === "team") return true;
    const userRole = allRoles.find((r) => r.id === user.role_id);
    if (!userRole) return false;
    const accessible = CATEGORY_HIERARCHY[userRole.category] || [];
    return accessible.includes(role.category);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <div className="text-center mb-10">
        <h2 className="text-3xl font-display font-bold text-primary-800 mb-3">
          MoPilot Ideenplattform
        </h2>
        <p className="text-surface-600 font-body max-w-2xl mx-auto">
          Sammeln, bewerten und diskutieren Sie Ideen für den KI-gestützten
          Mobilitätsassistenten im ländlichen Raum.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {CATEGORY_ORDER.map((cat) => {
          const style = CATEGORY_STYLES[cat];
          return (
            <div key={cat}>
              <h3 className={`text-sm font-semibold font-body uppercase tracking-wider mb-4 flex items-center gap-2.5 ${style.heading}`}>
                <span className={`w-2.5 h-2.5 rounded-full ${style.dot}`} />
                {CATEGORY_LABELS[cat]}
              </h3>
              <div className="space-y-3">
                {(roles[cat] || []).map((role) => {
                  const accessible = canAccess(role);
                  const CardContent = (
                    <div
                      className={`bg-white rounded-xl border border-surface-200 border-l-4 ${style.border} p-4 shadow-warm-sm transition-all duration-200 ${
                        accessible
                          ? "hover:shadow-warm-md hover:scale-[1.01] cursor-pointer"
                          : "opacity-50 cursor-not-allowed"
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <h4 className="font-medium font-body text-surface-900">{role.name}</h4>
                        <span className={`text-xs font-body px-2 py-0.5 rounded-full ${style.badge}`}>
                          {role.idea_count}{" "}
                          {role.idea_count === 1 ? "Idee" : "Ideen"}
                        </span>
                      </div>
                      {role.tagline && (
                        <p className="text-sm italic font-body text-surface-500 mt-1">
                          {role.tagline}
                        </p>
                      )}
                      <p className="text-sm font-body text-surface-500 mt-1">
                        {role.description}
                      </p>
                    </div>
                  );

                  if (!accessible || !user) {
                    return <div key={role.id}>{CardContent}</div>;
                  }

                  return (
                    <Link key={role.id} href={`/rolle/${role.slug}`}>
                      {CardContent}
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {!user && (
        <div className="mt-10 text-center">
          <p className="text-surface-500 font-body mb-4">
            Melden Sie sich an, um Ideen einzusehen und beizutragen.
          </p>
          <Link
            href="/login"
            className="inline-block bg-gradient-to-r from-primary-600 to-primary-700 text-white px-6 py-2.5 rounded-xl font-semibold font-body hover:from-primary-700 hover:to-primary-800 hover:shadow-warm-md transition-all duration-200"
          >
            Jetzt anmelden
          </Link>
        </div>
      )}
    </div>
  );
}
