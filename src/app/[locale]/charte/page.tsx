import { LegalPage, legalMetadata } from "@/components/brand/LegalPage";

export const generateMetadata = () => legalMetadata("charte");

export default function Page() {
  return <LegalPage doc="charte" />;
}
