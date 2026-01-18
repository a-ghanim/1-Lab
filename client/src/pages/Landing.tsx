import { motion } from "framer-motion";
import { Atom, Sparkles, BookOpen, Brain, Zap, ArrowRight, Play } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Landing() {
  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  return (
    <div className="min-h-screen bg-background text-foreground overflow-hidden">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[10%] w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] animate-float" />
        <div className="absolute bottom-[-10%] right-[5%] w-[400px] h-[400px] bg-accent/5 rounded-full blur-[100px] animate-float-delayed" />
      </div>

      <header className="relative z-10 flex items-center justify-between px-6 md:px-12 lg:px-20 py-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-primary/10">
            <Atom className="w-5 h-5 text-primary" />
          </div>
          <span className="font-semibold text-lg">One Breath Lab</span>
        </div>

        <Button 
          onClick={handleLogin}
          className="btn-primary"
          data-testid="button-login-header"
        >
          Sign in
        </Button>
      </header>

      <main className="relative z-10 px-6 md:px-12 lg:px-20 pt-16 md:pt-24 lg:pt-32 pb-20">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center space-y-6 mb-16"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-muted text-sm text-muted-foreground mb-4">
              <Sparkles className="w-4 h-4 text-primary" />
              AI-Powered Learning
            </div>

            <h1 className="section-title !text-5xl md:!text-6xl lg:!text-7xl">
              Spawn a school
              <br />
              <span className="gradient-text">from a prompt.</span>
            </h1>

            <p className="section-subtitle mx-auto">
              Type any topic and watch AI generate a complete curriculum with 
              interactive simulations, quizzes, and curated resources.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6">
              <Button 
                onClick={handleLogin}
                size="lg"
                className="btn-primary text-base px-8 py-4 h-auto group"
                data-testid="button-get-started"
              >
                Get started free
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button 
                variant="outline"
                size="lg"
                className="btn-secondary text-base px-8 py-4 h-auto"
                data-testid="button-watch-demo"
              >
                <Play className="w-4 h-4 mr-2" />
                Watch demo
              </Button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="relative rounded-2xl overflow-hidden border border-border/50 bg-card/50 backdrop-blur-sm"
          >
            <div className="aspect-video bg-gradient-to-br from-muted to-card flex items-center justify-center">
              <div className="text-center space-y-4 p-8">
                <div className="inline-flex p-4 rounded-2xl bg-primary/10 glow-cream">
                  <Atom className="w-12 h-12 text-primary animate-pulse-soft" />
                </div>
                <p className="text-lg text-muted-foreground">Interactive demo coming soon</p>
              </div>
            </div>
          </motion.div>
        </div>

        <section className="max-w-6xl mx-auto mt-32">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="section-title !text-3xl md:!text-4xl mb-4">
              Learn anything, your way
            </h2>
            <p className="section-subtitle mx-auto">
              Our AI adapts to your learning style and pace
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: Brain,
                title: "AI Curriculum",
                description: "Generate complete courses from any topic with structured modules and objectives"
              },
              {
                icon: Zap,
                title: "Interactive Sims",
                description: "Visualize complex concepts with p5.js simulations you can interact with"
              },
              {
                icon: BookOpen,
                title: "Smart Resources",
                description: "Curated papers, lectures, and books tailored to your learning goals"
              }
            ].map((feature, idx) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="p-6 rounded-2xl bg-card border border-border/50 card-hover"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </section>

        <motion.section
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto mt-32 text-center"
        >
          <div className="p-12 rounded-3xl bg-gradient-to-br from-primary/10 via-card to-accent/5 border border-border/50">
            <h2 className="section-title !text-3xl md:!text-4xl mb-4">
              Ready to start learning?
            </h2>
            <p className="section-subtitle mx-auto mb-8">
              Join thousands of learners exploring new subjects with AI
            </p>
            <Button 
              onClick={handleLogin}
              size="lg"
              className="btn-primary text-base px-8 py-4 h-auto"
              data-testid="button-signup-cta"
            >
              Create free account
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </motion.section>
      </main>

      <footer className="relative z-10 border-t border-border/50 py-8">
        <div className="max-w-7xl mx-auto px-6 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} One Breath Lab. Learn at the speed of thought.</p>
        </div>
      </footer>
    </div>
  );
}
