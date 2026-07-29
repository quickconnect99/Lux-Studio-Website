import type { Metadata } from "next";
import { NotFoundContent } from "@/components/sections/not-found-content";

export const metadata: Metadata = {
  title: "Page Not Found",
  description: "The requested Lux Studio page could not be found."
};

export default function PublicNotFound() {
  return <NotFoundContent />;
}
