import type { Metadata } from "next";
import AdminSendClient from "./client";

export const metadata: Metadata = {
  title: "Admin — Send Email",
  robots: { index: false, follow: false, nocache: true },
};

export default function AdminSendPage() {
  return <AdminSendClient />;
}
