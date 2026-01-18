import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Landing() {
  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  return (
    <div className="min-h-screen bg-background text-foreground overflow-hidden dot-grid">
      <header className="relative z-10 flex items-center justify-between px-6 md:px-12 lg:px-20 py-6 border-b border-border bg-background">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 bg-foreground" />
          <span className="font-medium">One Breath Lab</span>
        </div>

        <Button 
          onClick={handleLogin}
          variant="ghost"
          className="text-sm"
          data-testid="button-login-header"
        >
          Sign in
        </Button>
      </header>

      <main className="relative z-10 px-6 md:px-12 lg:px-20">
        <div className="max-w-6xl mx-auto">
          <div className="pt-24 md:pt-36 lg:pt-44 pb-20 md:pb-32">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="max-w-2xl"
            >
              <h1 className="text-4xl md:text-5xl lg:text-[3.5rem] font-medium leading-[1.1] tracking-tight mb-8">
                Learn anything.<br />
                One breath at a time.
              </h1>

              <p className="text-lg md:text-xl text-muted-foreground mb-10 leading-relaxed">
                Not another chat-with-PDF tool. This is a lab for building real understanding—where your sources become structured knowledge, and AI helps you think, not just search.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  onClick={handleLogin}
                  className="btn-primary h-11 px-6 text-base"
                  data-testid="button-get-started"
                >
                  Start learning
                  <ArrowRight className="w-4 h-4 ml-2" strokeWidth={1.5} />
                </Button>
              </div>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="pb-24 md:pb-32"
          >
            <div className="grid md:grid-cols-2 gap-px bg-border border border-border">
              <div className="bg-card p-8 md:p-10">
                <div className="text-xs text-muted-foreground uppercase tracking-wider mb-6">The problem</div>
                <p className="text-lg leading-relaxed">
                  You bookmark articles. Download papers. Take notes you never revisit. Information piles up, but understanding doesn't.
                </p>
              </div>
              <div className="bg-card p-8 md:p-10">
                <div className="text-xs text-muted-foreground uppercase tracking-wider mb-6">The shift</div>
                <p className="text-lg leading-relaxed">
                  What if every source you added became part of a living curriculum? What if AI didn't just answer questions—but helped you build mental models?
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="pb-24 md:pb-32"
          >
            <div className="max-w-3xl">
              <h2 className="text-2xl md:text-3xl font-medium mb-12">
                How it works
              </h2>
              
              <div className="space-y-12">
                {[
                  {
                    title: "Collect sources around a topic",
                    description: "Papers, articles, videos, notes—anything you're learning from. They become your personal knowledge base, not just files in a folder."
                  },
                  {
                    title: "AI generates a learning path",
                    description: "Based on what you're trying to understand, we create structured modules with concepts that build on each other. Not random Q&A—a curriculum."
                  },
                  {
                    title: "Ask questions, get cited answers",
                    description: "Every response points back to your sources. You're not trusting a black box—you're having a conversation grounded in material you chose."
                  },
                  {
                    title: "Track what you actually know",
                    description: "Quizzes, progress tracking, daily streaks. Spaced repetition that moves understanding from short-term memory into lasting knowledge."
                  }
                ].map((step, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.3, delay: idx * 0.1 }}
                    className="flex gap-6"
                  >
                    <div className="text-sm text-muted-foreground w-8 shrink-0 pt-1">
                      {String(idx + 1).padStart(2, '0')}
                    </div>
                    <div>
                      <h3 className="font-medium mb-2">{step.title}</h3>
                      <p className="text-muted-foreground leading-relaxed">{step.description}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="py-20 border-t border-border"
          >
            <div className="max-w-xl">
              <h2 className="text-2xl md:text-3xl font-medium mb-4">
                For the deeply curious
              </h2>
              <p className="text-muted-foreground mb-8 leading-relaxed">
                Students tired of passive reading. Researchers drowning in papers. Autodidacts who want structure without hand-holding. Anyone who believes understanding beats skimming.
              </p>
              <Button 
                onClick={handleLogin}
                className="btn-primary"
                data-testid="button-signup-cta"
              >
                Start your first course
                <ArrowRight className="w-4 h-4 ml-2" strokeWidth={1.5} />
              </Button>
            </div>
          </motion.div>
        </div>
      </main>

      <footer className="relative z-10 border-t border-border py-6 bg-background">
        <div className="max-w-6xl mx-auto px-6 md:px-12 lg:px-20 text-xs text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} One Breath Lab</p>
        </div>
      </footer>
    </div>
  );
}
