"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { motion } from "framer-motion";

const FAQ = () => {
  const faqs = [
    {
      question: "How accurate is your ATS scoring?",
      answer: "Our AI doesn't just mimic ATS systems — it understands industry context, job relevance, and recruiter intent. The score reflects how well your resume aligns with real hiring standards, not just keywords."
    },
    {
      question: "What file formats do you support?",
      answer: "We support PDF, DOC, and DOCX formats — the most common resume types used in hiring platforms."
    },
    {
      question: "How is this different from other resume checkers?",
      answer: "IntelliResume goes beyond surface-level checks. It delivers real-time ATS scoring, highlights missing keywords, analyzes job match fit, and even includes skill assessments to validate your strengths—all tailored to the role you're targeting."
    },
    {
      question: "Can I analyze resumes for different industries?",
      answer: "Yes! IntelliResume works across tech, marketing, finance, healthcare, education, and more — all fully customizable by job type."
    },
    {
      question: "How long does the analysis take?",
      answer: "It takes less than 2 minutes to get your full report, including personalized improvement tips and ATS readiness."
    },
    {
      question: "Can I get help with LinkedIn optimization too?",
      answer: "Yes! Our Career Accelerator plan includes LinkedIn profile optimization. We'll analyze your profile and provide specific recommendations to improve your professional online presence and attract recruiters."
    }
  ];

  return (
    <section className="py-16 bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: -30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-lg md:text-xl text-gray-600">
            Everything you need to know about IntelliResume
          </p>
        </motion.div>
        
        <Accordion type="single" collapsible className="w-full">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              whileHover={{ scale: 1.02 }}
            >
              <AccordionItem 
                value={`item-${index}`} 
                className="bg-white rounded-lg mb-4 border border-gray-200 px-6 hover:shadow-md transition-shadow"
              >
                <AccordionTrigger className="text-left font-semibold text-lg text-gray-900 hover:text-blue-600">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-gray-600 text-lg pt-2 pb-4">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            </motion.div>
          ))}
        </Accordion>
      </div>
    </section>
  );
};

export default FAQ;