import { Cta } from "@/components/blocks/landing/cta";
import { FAQs } from "@/components/blocks/landing/faq";
import { Wcu } from "@/components/blocks/landing/wcu";
import SearchBooking  from "@/components/blocks/landing/search";
import HeroSplit from "@/components/blocks/landing/hero";

export default function Home() {
  return (
    <>
      <SearchBooking/> 
      <HeroSplit/>
      <Wcu/>
      <FAQs/>
      <Cta/>
    </>
  );
}
