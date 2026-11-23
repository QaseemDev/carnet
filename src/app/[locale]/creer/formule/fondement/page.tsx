import { OfferPage, offerMetadata } from "../OfferPage";

export const generateMetadata = () => offerMetadata("fondement");

export default function Page() {
  return <OfferPage slug="fondement" />;
}
