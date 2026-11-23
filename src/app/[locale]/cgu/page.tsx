import { LegalPage, legalMetadata } from "@/components/brand/LegalPage";

export const generateMetadata = () => legalMetadata("cgu");

export default function Page() {
  return <LegalPage doc="cgu" />;
}
