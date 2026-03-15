"use client";

import { HelpCircle } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { FAQ_DATA } from "../_lib/constants";

export default function FaqSection() {
  return (
    <div className="border border-white/10 bg-white/5 p-4 md:p-8">
      <h3 className="mb-4 flex items-center gap-2 text-xl font-bold text-white md:mb-6 md:text-2xl">
        <HelpCircle size={24} className="text-white md:size-7" />
        자주 묻는 질문
      </h3>
      <Accordion type="single" collapsible className="space-y-2 md:space-y-3">
        {FAQ_DATA.map((faq, index) => (
          <AccordionItem
            key={index}
            value={`faq-${index}`}
            className="border border-white/10"
          >
            <AccordionTrigger className="px-4 py-4 text-left text-sm font-bold text-white hover:bg-white/5 hover:no-underline md:px-5 md:text-base [&[data-state=open]>svg]:rotate-180">
              {faq.question}
            </AccordionTrigger>
            <AccordionContent className="border-t border-white/10 px-4 pt-3 pb-4 text-xs text-gray-400 md:px-5 md:text-sm">
              {faq.answer}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
