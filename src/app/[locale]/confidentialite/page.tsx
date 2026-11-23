import { LegalPage, legalMetadata } from "@/components/brand/LegalPage";

export const generateMetadata = () => legalMetadata("confidentialite");

export default function Page() {
  return <LegalPage doc="confidentialite" />;
}
