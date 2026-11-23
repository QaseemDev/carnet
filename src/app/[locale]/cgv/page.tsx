import { LegalPage, legalMetadata } from "@/components/brand/LegalPage";

export const generateMetadata = () => legalMetadata("cgv");

export default function Page() {
  return <LegalPage doc="cgv" />;
}
