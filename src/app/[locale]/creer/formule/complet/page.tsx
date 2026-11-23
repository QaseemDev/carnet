import { OfferPage, offerMetadata } from "../OfferPage";

export const generateMetadata = () => offerMetadata("complet");

export default function Page() {
  return <OfferPage slug="complet" />;
}
