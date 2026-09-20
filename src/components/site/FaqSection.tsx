import { Link } from "@tanstack/react-router";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { faqs } from "@/lib/structured-data";

export function FaqSection() {
  return (
    <section className="border-y border-border/70 bg-sand/40">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-16 md:grid-cols-[0.7fr_1.3fr] md:px-8 md:py-24">
        <div>
          <p className="eyebrow">Showroom questions</p>
          <h2 className="mt-3 font-display text-4xl leading-tight md:text-5xl">
            Furniture in Hyderabad, answered simply
          </h2>
          <p className="mt-5 max-w-md text-sm leading-relaxed text-muted-foreground">
            Browse the{" "}
            <Link to="/explore" className="underline underline-offset-4 hover:text-foreground">
              furniture collection
            </Link>
            , then contact us for current pricing or visit the showroom to see a piece in person.
          </p>
        </div>
        <Accordion type="single" collapsible className="border-t border-border/70">
          {faqs.map((faq, index) => (
            <AccordionItem key={faq.question} value={`faq-${index}`} className="border-border/70">
              <AccordionTrigger className="py-5 font-medium text-foreground hover:no-underline">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="max-w-2xl leading-relaxed text-muted-foreground">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
