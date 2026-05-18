import ProfilePageContent from "@/components/ProfilePageContent";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Profile | Jersea",
  description: "Manage your account, view orders, and update your details.",
};

export default function ProfilePage() {
  return <ProfilePageContent />;
}
