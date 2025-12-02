"use client";

import { Card } from "@/components/ui/card";
import { AlertTriangle, Clock, Target } from "lucide-react";
import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";

const ProblemSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  const problems = [
    {
      icon: AlertTriangle,
      stat: "68%",
      title: "of resumes never reach human eyes",
      description: "Beat ATS systems with our optimization engine"
    },
    {
      icon: Clock,
      stat: "6 seconds",
      title: "average recruiter spends scanning",
      description: "Make every second count with strategic formatting"
    },
    {
      icon: Target,
      stat: "Generic",
      title: "resumes get generic results",
      description: "Tailor your story for each opportunity with our AI insights"
    }
  ];

  return (
    <section ref={ref} className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-3xl md:text-5xl font-heading font-bold text-intelliresume-navy mb-4">
            Why Your Resume Might Not Be Getting You Interviews
          </h2>
          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
            You&apos;ve got the skills. So why no callbacks?
            Here&apos;s what&apos;s really stopping your resume from getting noticed — and how to fix it.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {problems.map((problem, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
              transition={{ delay: index * 0.2, duration: 0.6 }}
            >
              <Card className="p-6 flex flex-col items-center gap-3 hover-lift bg-white border-0 shadow-xl transition-all duration-300 hover:scale-105 hover:shadow-2xl">
                <motion.div
                  className="inline-flex items-center justify-center w-16 h-16 mb-1 bg-red-100 rounded-full transition-all duration-300 hover:bg-red-200"
                  whileHover={{ rotate: 12 }}
                >
                  <problem.icon className="h-8 w-8 text-red-600" />
                </motion.div>
                <motion.div
                  className="text-3xl font-mono font-bold text-red-600"
                  whileHover={{ scale: 1.1 }}
                >
                  {problem.stat}
                </motion.div>
                <h3 className="text-lg text-center font-semibold text-intelliresume-navy transition-colors duration-300 hover:text-primary">
                  {problem.title}
                </h3>
                <p className="text-gray-600 text-center">
                  {problem.description}
                </p>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProblemSection;