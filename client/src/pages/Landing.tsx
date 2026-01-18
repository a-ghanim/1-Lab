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
          <div className="pt-20 md:pt-32 lg:pt-40 pb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="max-w-3xl"
            >
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-medium leading-[1.15] tracking-tight mb-6">
                Stop skimming papers.<br />
                Actually understand them.
              </h1>

              <p className="text-base md:text-lg text-muted-foreground max-w-xl mb-8 leading-relaxed">
                Drop in your PDFs, notes, or links. Ask questions. Get answers that cite your sources. No more ctrl+F through 40 pages.
              </p>

              <Button 
                onClick={handleLogin}
                className="btn-primary h-10 px-5"
                data-testid="button-get-started"
              >
                Try it free
                <ArrowRight className="w-4 h-4 ml-2" strokeWidth={1.5} />
              </Button>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="pb-20"
          >
            <div className="bg-card border border-border overflow-hidden">
              <div className="border-b border-border px-4 py-2 flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-border" />
                <div className="w-2.5 h-2.5 rounded-full bg-border" />
                <div className="w-2.5 h-2.5 rounded-full bg-border" />
              </div>
              
              <div className="grid md:grid-cols-[280px_1fr_320px] divide-x divide-border min-h-[400px]">
                <div className="p-4 hidden md:block">
                  <div className="text-xs text-muted-foreground mb-3">Sources</div>
                  <div className="space-y-1">
                    {["attention-is-all-you-need.pdf", "scaling-laws-openai.pdf", "gpt4-technical-report.pdf", "llama2-paper.pdf"].map((name, i) => (
                      <motion.div
                        key={name}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 + i * 0.08 }}
                        className="flex items-center gap-2 px-2 py-1.5 text-sm hover:bg-muted transition-colors cursor-default"
                      >
                        <div className="w-3 h-3 border border-border flex-shrink-0" />
                        <span className="truncate">{name}</span>
                      </motion.div>
                    ))}
                  </div>
                </div>

                <div className="p-6 bg-background">
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="prose prose-sm max-w-none"
                  >
                    <div className="text-xs text-muted-foreground mb-4">Module 1: Transformer Architecture</div>
                    <h2 className="text-lg font-medium mb-3 text-foreground">The Attention Mechanism</h2>
                    <p className="text-muted-foreground text-sm leading-relaxed mb-4">
                      The key innovation in transformer models is self-attention, which allows the model to weigh the importance of different parts of the input sequence when producing each output element.
                    </p>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      Unlike recurrent models that process sequences step-by-step, attention computes relationships between all positions in parallel, enabling much faster training on modern hardware.
                    </p>
                  </motion.div>
                </div>

                <div className="p-4 hidden md:block">
                  <div className="text-xs text-muted-foreground mb-3">Chat</div>
                  <div className="space-y-3">
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.6 }}
                      className="bg-muted px-3 py-2 text-sm"
                    >
                      What's the difference between self-attention and cross-attention?
                    </motion.div>
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.75 }}
                      className="px-3 py-2 text-sm text-muted-foreground border-l-2 border-border"
                    >
                      Self-attention relates positions within the same sequence, while cross-attention relates positions between two different sequences (like encoder-decoder attention).
                      <span className="text-xs text-muted-foreground/60 block mt-2">
                        Source: attention-is-all-you-need.pdf, p.5
                      </span>
                    </motion.div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="py-16 border-t border-border"
          >
            <div className="grid md:grid-cols-3 gap-12 md:gap-8">
              {[
                {
                  num: "01",
                  title: "Drop your sources",
                  description: "PDFs, articles, notes, URLs. Anything you're trying to learn from."
                },
                {
                  num: "02",
                  title: "Ask anything",
                  description: "Get answers with citations. No hallucinations because it's grounded in your docs."
                },
                {
                  num: "03",
                  title: "Build understanding",
                  description: "Generate study guides, track what you've learned, fill knowledge gaps."
                }
              ].map((step, idx) => (
                <motion.div
                  key={step.num}
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: idx * 0.1 }}
                >
                  <div className="text-xs text-muted-foreground mb-2">{step.num}</div>
                  <h3 className="font-medium mb-2">{step.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="py-20 border-t border-border"
          >
            <div className="max-w-md">
              <h2 className="text-xl md:text-2xl font-medium mb-3">
                Built for people who actually read
              </h2>
              <p className="text-muted-foreground text-sm mb-6">
                Researchers, students, curious people tired of skimming and forgetting.
              </p>
              <Button 
                onClick={handleLogin}
                className="btn-primary"
                data-testid="button-signup-cta"
              >
                Get started
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
