import { OfferPage, offerMetadata } from "../OfferPage";

export const generateMetadata = () => offerMetadata("construction");

export default function Page() {
  return <OfferPage slug="construction" />;
}
