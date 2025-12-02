"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Upload, CheckCircle, Sparkles } from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";

const Hero = () => {
  const [isDragOver, setIsDragOver] = useState(false);

  return (
    <section className="pt-32 pb-20 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-background"></div>
      <div
        className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full filter blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/5 rounded-full filter blur-3xl" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Column */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, staggerChildren: 0.2 }}
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center px-4 py-2 bg-primary/10 rounded-full border border-primary/20 mb-6"
            >
              <Sparkles className="h-4 w-4 text-primary mr-2" />
              <span className="text-sm font-medium text-primary">AI-Powered Career Intelligence</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-5xl md:text-6xl lg:text-7xl font-heading font-bold leading-tighter mb-8 text-foreground"
            >
              Turn Your Resume Into Your Career&apos;s{" "}
              <span className="text-primary">Best Asset</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="text-base md:text-xl text-muted-foreground mb-10 leading-relaxed"
            >
              Get AI-powered insights, ATS optimization, and personalized career roadmaps in just 2 minutes.
              Stop guessing what recruiters want—know exactly how to stand out.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="flex flex-col sm:flex-row gap-4 mb-10"
            >
              <Button
                size="lg"
                className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-4 text-lg font-semibold transform transition-all duration-300 hover:scale-105"
              >
                Try It Free — No Sign-Up Needed
              </Button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 }}
              className="flex items-center text-sm text-muted-foreground"
            >
              <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
              Join 10,000+ professionals who&apos;ve improved their resume match score by 85% and landed interviews 3x faster
            </motion.div>
          </motion.div>

          {/* Right Column */}
          <motion.div
            className="relative"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <Card
              className={`p-10 border-2 border-dashed transition-all duration-500 hover:shadow-lg transform hover:scale-105 ${isDragOver ? 'border-primary bg-primary/5 scale-105' : 'border-border'
                }`}
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragOver(true);
              }}
              onDragLeave={() => setIsDragOver(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsDragOver(false);
              }}
            >
              <div className="text-center">
                <div className="mx-auto mb-6 p-4 bg-primary/10 rounded-full w-fit transition-all duration-300 hover:scale-110">
                  <Upload className="h-10 w-10 text-primary" />
                </div>
                <h3 className="text-2xl font-heading font-semibold text-foreground mb-3">
                  Upload Your Resume
                </h3>
                <p className="text-muted-foreground mb-8 text-lg">
                  Drag and drop your resume here, or click to browse
                </p>
                <Button
                  variant="outline"
                  className="border-border text-foreground hover:bg-accent-foreground transition-all duration-300 hover:scale-105 px-8 py-3"
                >
                  Choose File
                </Button>
                <p className="text-sm text-muted-foreground/70 mt-6">
                  Supports PDF, DOC, DOCX • Max 5MB
                </p>
              </div>
            </Card>

            {/* Floating Elements */}
            <motion.div
              className="absolute -top-6 -right-6"
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              <div className="bg-green-500 text-white px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 hover:scale-110 cursor-pointer">
                ATS Score: 92%
              </div>
            </motion.div>
            {/* <motion.div
              className="absolute -bottom-6 -left-6"
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 3, repeat: Infinity, delay: 1 }}
            >
              <div className="bg-primary text-primary-foreground px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 hover:scale-110 cursor-pointer">
                3 Matches Found
              </div>
            </motion.div> */}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Hero;