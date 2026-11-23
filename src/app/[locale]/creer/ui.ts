// Shared looks of the /creer flow (prototype `.creation-*`).

const pill =
  "inline-flex items-center justify-center gap-2 rounded-full text-center text-[13px] leading-normal font-semibold max-sm:w-full";

export const primary = `${pill} mt-4 min-h-[51px] border border-terracotta bg-terracotta px-7 py-[15px] text-white shadow-[0_5px_12px_#b84a3915] hover:bg-terracotta-hover disabled:cursor-not-allowed disabled:opacity-45 disabled:shadow-none disabled:hover:bg-terracotta`;

export const secondary = `${pill} min-h-12 border border-[#d5c4b0] bg-white px-[22px] py-3.5 text-teal hover:bg-paper`;

// "Ajouter", "+ Ajouter une personne".
export const textLink = "min-h-11 py-2 text-sm text-terracotta underline underline-offset-4";
// "← Retour": an outlined pill with a large arrow (prototype final `.creation-back`).
export const back =
  "mb-5 inline-flex min-h-[46px] items-center gap-2.5 rounded-[25px] border border-terracotta bg-white px-5 py-3 text-[13px] font-bold text-terracotta shadow-[0_3px_10px_#b84a3910] hover:bg-[#fbefe7] [&>span]:text-2xl [&>span]:leading-none";

// Its direct paragraphs read at 15 px (prototype `.creation-panel > p`).
export const panel =
  "rounded-xl border border-line bg-white px-[21px] py-[26px] shadow-[0_4px_15px_rgb(0_0_0/0.02)] min-[601px]:p-10 [&>p]:text-[15px] [&>p]:leading-[1.9] [&>p]:text-[#586864]";

export const notice = "rounded-lg border border-[#e9d8c6] bg-[#faf4ec] px-[17px] py-[13px] text-[13px] leading-[1.6]";

// Step title (`h2`) and in-panel titles (`h3`).
// The prototype's `h1–h6 { font-weight: inherit }` leaves them regular.
export const h2 = "mb-[18px] scroll-mt-32 text-[28px] leading-tight tracking-[-0.5px] sm:text-[34px]";
export const h3 = "my-[18px] text-[23px] leading-snug";

export const lead = "mb-7 leading-[1.8] text-[#667471]";
export const small = "text-xs leading-[1.7] text-[#666]";
export const price = "font-serif text-[26px]! text-terracotta!";
