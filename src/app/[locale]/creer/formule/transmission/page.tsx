import { OfferPage, offerMetadata } from "../OfferPage";

export const generateMetadata = () => offerMetadata("transmission");

export default function Page() {
  return <OfferPage slug="transmission" />;
}
