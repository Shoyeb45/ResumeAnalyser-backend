"use client";

import { Card } from "@/components/ui/card";
import { Star, Quote } from "lucide-react";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";

const TestimonialSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.1 });

  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Senior Software Engineer",
      company: "Google",
      avatar: "SC",
      rating: 5,
      text: "IntelliResume transformed my career trajectory. The AI insights helped me land my dream role at Google with a 40% salary increase. The ATS optimization was game-changing."
    },
    {
      name: "Marcus Rodriguez",
      role: "Product Manager",
      company: "Microsoft",
      avatar: "MR",
      rating: 5,
      text: "I went from 2% to 15% interview callback rate after using IntelliResume. The personalized feedback and industry-specific suggestions made all the difference."
    },
    {
      name: "Emily Johnson",
      role: "Data Scientist",
      company: "Meta",
      avatar: "EJ",
      rating: 5,
      text: "The career roadmap feature is incredible. It showed me exactly which skills to develop and how to position my experience. Got 3 offers in 2 months!"
    },
    {
      name: "David Kim",
      role: "Frontend Developer",
      company: "Apple",
      avatar: "DK",
      rating: 5,
      text: "As a career changer, I struggled to present my transferable skills. IntelliResume's AI helped me craft a compelling narrative that landed me at Apple."
    },
    {
      name: "Lisa Wang",
      role: "Engineering Manager",
      company: "Amazon",
      avatar: "LW",
      rating: 5,
      text: "The real-time optimization suggestions saved me hours of revision. My resume score improved from 65% to 94%, and I got my first FAANG offer."
    },
    {
      name: "James Thompson",
      role: "Solutions Architect",
      company: "Tesla",
      avatar: "JT",
      rating: 5,
      text: "IntelliResume didn't just optimize my resume—it gave me confidence. The detailed analysis helped me understand my worth and negotiate better."
    }
  ];

  return (
    <section id="testimonials" className="py-20 bg-white relative overflow-hidden" ref={ref}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-3xl md:text-5xl text-intelliresume-navy font-heading font-bold mb-6">
          Trusted  by thousands of top professionals and students 
          </h2>
          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
            Join thousands of professionals who&apos;ve transformed their careers with AI-powered resume optimization
          </p>
        </motion.div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
              transition={{ duration: 0.6, delay: index * 0.15 }}
            >
              <motion.div
                whileHover={{ y: -8, scale: 1.02 }}
                transition={{ type: "tween", ease: "easeOut", duration: 0.2 }}
              >
                <Card className="bg-white/80 backdrop-blur-sm border border-gray-200/50 p-8 group">
                  <div className="relative">
                    <Quote className="h-8 w-8 text-blue-200 absolute -top-2 -left-2" />
                    
                    <div className="flex items-center mb-6">
                      <motion.div
                        className="w-12 h-12 z-1 bg-primary rounded-full flex items-center justify-center text-white font-bold text-lg mr-4 shadow-lg"
                        whileHover={{ scale: 1.1 }}
                        transition={{ type: "tween", ease: "easeOut", duration: 0.15 }}
                      >
                        {testimonial.avatar}
                      </motion.div>
                      <div>
                        <motion.h4
                          className="font-semibold text-gray-900"
                          whileHover={{ color: "#3b82f6" }}
                          transition={{ duration: 0.2 }}
                        >
                          {testimonial.name}
                        </motion.h4>
                        <p className="text-sm text-gray-500">
                          {testimonial.role}
                        </p>
                        <p className="text-sm font-medium text-blue-600">
                          {testimonial.company}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex mb-4">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <motion.div
                          key={i}
                          whileHover={{ scale: 1.1 }}
                          transition={{ duration: 0.15, delay: i * 0.05 }}
                        >
                          <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                        </motion.div>
                      ))}
                    </div>
                    
                    <p className="text-gray-600 italic leading-relaxed">
                    &apos;{testimonial.text}&apos;
                    </p>
                  </div>
                </Card>
              </motion.div>
            </motion.div>
          ))}
        </div>
        
        <motion.div
          className="text-center mt-12"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6, delay: 1 }}
        >
          <motion.div
            className="inline-flex items-center px-6 py-3 bg-white/70 backdrop-blur-sm rounded-full border border-blue-200/50 shadow-lg"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "tween", ease: "easeOut", duration: 0.15 }}
          >
            <Star className="h-5 w-5 fill-amber-400 text-amber-400 mr-2" />
            <span className="text-sm font-medium text-gray-700">
              4.9/5 rating from 10,000+ professionals
            </span>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default TestimonialSection;