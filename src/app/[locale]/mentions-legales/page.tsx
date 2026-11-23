import { LegalPage, legalMetadata } from "@/components/brand/LegalPage";

export const generateMetadata = () => legalMetadata("mentionsLegales");

export default function Page() {
  return <LegalPage doc="mentionsLegales" />;
}
