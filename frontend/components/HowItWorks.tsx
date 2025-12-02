"use client";

import { Card } from "@/components/ui/card";
import { Upload, CheckCircle, Star } from "lucide-react";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";

const HowItWorks = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.1 });

  const steps = [
    {
      icon: Upload,
      step: "01",
      title: "Upload Your Resume",
      description: "Simply drag and drop your current resume. We support all major formats (PDF, DOC, DOCX).",
      time: "30 seconds"
    },
    {
      icon: CheckCircle,
      step: "02",
      title: "AI Analysis",
      description: "Our advanced AI analyzes your resume against ATS systems, industry standards, and role requirements.",
      time: "45 seconds"
    },
    {
      icon: Star,
      step: "03",
      title: "Get Personalized Results",
      description: "Receive detailed insight ,   ATS optimization tip ,  Keyword and skill fixes, Personalized Skill assessment ready for you.",
      time: "Instant feedback"
    }
  ];

  return (
    <section id="how-it-works" className="py-16 bg-gray-50" ref={ref}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-3xl md:text-5xl font-heading font-bold text-intelliresume-navy mb-4">
            How It Works
          </h2>
          <p className="text-lg md:text-xl text-gray-600">
            Get professional insights in just 3 simple steps
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 relative">
          {/* Connection Lines */}
          <motion.div
            className="hidden md:block absolute top-24 left-1/3 right-1/3 h-0.5 bg-gradient-to-r from-blue-500 to-emerald-500"
            initial={{ opacity: 0, scaleX: 0 }}
            animate={isInView ? { opacity: 1, scaleX: 1 } : { opacity: 0, scaleX: 0 }}
            transition={{ duration: 1, delay: 0.5 }}
          />

          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
            >
              <motion.div
                whileHover={{ scale: 1.05, y: -5 }}
                transition={{ type: "tween", ease: "easeOut", duration: 0.2 }}
              >
                <Card className="relative p-8 text-center bg-white border-0 shadow-lg">
                  <motion.div
                    className="absolute -top-4 left-1/2 transform -translate-x-1/2 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-sm font-bold"
                    whileHover={{ scale: 1.1, backgroundColor: "#2563eb" }}
                    transition={{ type: "tween", ease: "easeOut", duration: 0.15 }}
                  >
                    {step.step}
                  </motion.div>

                  <div className="mt-4 mb-6">
                    <motion.div
                      className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4"
                      whileHover={{ scale: 1.1, rotate: 12, backgroundColor: "rgba(59, 130, 246, 0.2)" }}
                      transition={{ type: "tween", ease: "easeOut", duration: 0.2 }}
                    >
                      <step.icon className="h-8 w-8 text-primary" />
                    </motion.div>

                    <motion.h3
                      className="text-lg md:text-xl font-heading font-semibold text-intelliresume-navy mb-3"
                      whileHover={{ color: "#3b82f6" }}
                      transition={{ duration: 0.2 }}
                    >
                      {step.title}
                    </motion.h3>

                    <p className="text-gray-600 mb-4">
                      {step.description}
                    </p>

                    <motion.div
                      className="inline-block px-3 py-1 bg-emerald-500/10 text-emerald-500 text-sm font-medium rounded-full"
                      whileHover={{ scale: 1.05, backgroundColor: "rgba(34, 197, 94, 0.2)" }}
                      transition={{ type: "tween", ease: "easeOut", duration: 0.15 }}
                    >
                      {step.time}
                    </motion.div>
                  </div>
                </Card>
              </motion.div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;