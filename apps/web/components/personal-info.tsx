'use client';

import { Github, Linkedin, Mail, Code, Sparkles } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@workspace/ui/components/card';
import { Badge } from '@workspace/ui/components/badge';

export function PersonalInfo() {
  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="text-center">
        <div className="flex justify-center mb-4">
          <div className="relative">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary via-purple-500 to-pink-500 flex items-center justify-center text-white text-2xl font-bold pulse-glow">
              MB
            </div>
            <div className="absolute -top-2 -right-2">
              <Sparkles className="w-6 h-6 text-yellow-500 floating-animation" />
            </div>
          </div>
        </div>
        <CardTitle className="gradient-text text-2xl">Mayank Bharati</CardTitle>
        <CardDescription className="text-lg">
          Frontend Engineer & AI Enthusiast
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">
            Passionate about creating beautiful, functional web applications with modern technologies. 
            This AI Nexus platform showcases my skills in React, Next.js, TypeScript, and AI integration.
          </p>
          
          <div className="flex flex-wrap justify-center gap-2 mb-6">
            <Badge variant="secondary" className="bg-primary/10 text-primary">
              React
            </Badge>
            <Badge variant="secondary" className="bg-primary/10 text-primary">
              Next.js
            </Badge>
            <Badge variant="secondary" className="bg-primary/10 text-primary">
              TypeScript
            </Badge>
            <Badge variant="secondary" className="bg-primary/10 text-primary">
              AI/ML
            </Badge>
            <Badge variant="secondary" className="bg-primary/10 text-primary">
              Tailwind CSS
            </Badge>
          </div>
        </div>

        <div className="border-t pt-4">
          <h4 className="font-semibold mb-3 text-center">About This Project</h4>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>
              <strong>AI Nexus</strong> is my submission for the Servimatt Frontend Engineer Technical Assessment. 
              It demonstrates not only the required features but also advanced capabilities like:
            </p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Multi-agent AI system with specialized personalities</li>
              <li>RAG (Retrieval-Augmented Generation) for document analysis</li>
              <li>Real-time data synchronization with InstantDB</li>
              <li>Modern UI/UX with custom animations and gradients</li>
              <li>Production-ready architecture with error handling</li>
            </ul>
          </div>
        </div>

        <div className="flex justify-center space-x-4 pt-4">
          <a 
            href="https://github.com/mayankbharati" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center space-x-2 text-muted-foreground hover:text-primary transition-colors"
          >
            <Github className="w-4 h-4" />
            <span>GitHub</span>
          </a>
          <a 
            href="https://www.linkedin.com/in/mayank-bharati-800b231b7/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center space-x-2 text-muted-foreground hover:text-primary transition-colors"
          >
            <Linkedin className="w-4 h-4" />
            <span>LinkedIn</span>
          </a>
          <a 
            href="mailto:mayank.bharati000@gmail.com" 
            className="flex items-center space-x-2 text-muted-foreground hover:text-primary transition-colors"
          >
            <Mail className="w-4 h-4" />
            <span>Email</span>
          </a>
        </div>
      </CardContent>
    </Card>
  );
}
