"use client";
import React, { useEffect, useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { useRouter } from "next/navigation";

interface PortalNavButtonProps {
  locale: string;
}

const roleToPortal: Record<string, string> = {
  parent: "parent-portal",
  teacher: "teacher-portal",
  admin: "admin",
  superadmin: "admin",
  "content-manager": "admin",
};

export default function PortalNavButton({ locale }: PortalNavButtonProps) {
  const { user, getUserCustomClaims, loading } = useAuth();
  const [portal, setPortal] = useState<string | null>(null);
  const [label, setLabel] = useState<string>("");
  const router = useRouter();

  useEffect(() => {
    if (!user) return;
    getUserCustomClaims().then((claims) => {
      if (!claims) return;
  const hasuraClaims = claims['https://hasura.io/jwt/claims'] as { 'x-hasura-default-role': string } | undefined;
  const role: string | undefined = (claims.role as string) || (claims.customRole as string) || (hasuraClaims && hasuraClaims['x-hasura-default-role']);
      if (role && roleToPortal[role]) {
        setPortal(roleToPortal[role]);
        switch (role) {
          case "parent":
            setLabel(locale === "ar-SA" ? "بوابة ولي الأمر" : "Parent Portal");
            break;
          case "teacher":
            setLabel(locale === "ar-SA" ? "بوابة المعلم" : "Teacher Portal");
            break;
          case "admin":
          case "superadmin":
          case "content-manager":
            setLabel(locale === "ar-SA" ? "لوحة الإدارة" : "Admin Panel");
            break;
          default:
            setLabel(locale === "ar-SA" ? "البوابة" : "Portal");
        }
      }
    });
  }, [user, getUserCustomClaims, locale]);

  if (!user || !portal) return null;

  const handleClick = () => {
    router.push(`/${locale}/${portal}`);
  };

  return (
    <button
      onClick={handleClick}
      className="nav-link bounce-on-hover"
      style={{
        padding: "0.5rem 1.2rem",
        fontWeight: "bold",
        borderRadius: 20,
        background: "linear-gradient(90deg, #22c55e, #16a34a)",
        color: "#fff",
        fontSize: 16,
        marginLeft: locale === "ar-SA" ? 0 : 8,
        marginRight: locale === "ar-SA" ? 8 : 0,
        letterSpacing: 0.5,
        boxShadow: "0 2px 8px rgba(34,197,94,0.08)",
        direction: locale === "ar-SA" ? "rtl" : "ltr",
      }}
    >
      {label || (locale === "ar-SA" ? "البوابة" : "Portal")}
    </button>
  );
}
