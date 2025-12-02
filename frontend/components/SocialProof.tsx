"use client";

import { PhoneCall, Users, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";

const SocialProof = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  const stats = [
    {
      icon: Users,
      number: "10,000+",
      label: "Resumes Analyzed"
    },
    {
      icon: TrendingUp,
      number: "85%",
      label: "Average Score Improvement"
    },
    {
      icon: PhoneCall,
      number: "3x",
      label: "More Interview Callbacks"
    }
  ];

  return (
    <section ref={ref} className="py-12 bg-white border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          className="grid md:grid-cols-3 gap-8 mt-12"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : { opacity: 0 }}
          transition={{ staggerChildren: 0.2 }}
        >
          {stats.map((stat, index) => (
            <motion.div 
              key={index} 
              className="text-center"
              initial={{ opacity: 0, y: 50 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
              transition={{ delay: index * 0.2, duration: 0.6 }}
              whileHover={{ scale: 1.05 }}
            >
              <motion.div 
                className="inline-flex items-center justify-center w-12 h-12 bg-primary/10 rounded-lg mb-4"
                whileHover={{ backgroundColor: "hsl(var(--primary) / 0.2)", rotate: 12 }}
                transition={{ duration: 0.3 }}
              >
                <stat.icon className="h-6 w-6 text-primary" />
              </motion.div>
              <motion.div 
                className="text-3xl font-heading font-bold text-intelliresume-navy mb-2"
                whileHover={{ color: "hsl(var(--primary))" }}
              >
                {stat.number}
              </motion.div>
              <div className="text-gray-600">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default SocialProof;