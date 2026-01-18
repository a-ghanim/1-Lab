import { useState, useEffect } from "react";
import { ExternalLink, Loader2 } from "lucide-react";

const PHET_SIMULATIONS: Record<string, { url: string; title: string; description: string }> = {
  "quantum-tunneling": {
    url: "https://phet.colorado.edu/sims/cheerpj/quantum-tunneling/latest/quantum-tunneling.html",
    title: "Quantum Tunneling and Wave Packets",
    description: "Explore how quantum particles can tunnel through barriers"
  },
  "wave-interference": {
    url: "https://phet.colorado.edu/sims/html/wave-interference/latest/wave-interference_en.html",
    title: "Wave Interference",
    description: "Make waves with water, sound, or light and see how they interact"
  },
  "projectile-motion": {
    url: "https://phet.colorado.edu/sims/html/projectile-motion/latest/projectile-motion_en.html",
    title: "Projectile Motion",
    description: "Blast objects out of a cannon and explore projectile motion"
  },
  "forces-motion": {
    url: "https://phet.colorado.edu/sims/html/forces-and-motion-basics/latest/forces-and-motion-basics_en.html",
    title: "Forces and Motion",
    description: "Explore forces, mass, and acceleration"
  },
  "gravity-force": {
    url: "https://phet.colorado.edu/sims/html/gravity-force-lab/latest/gravity-force-lab_en.html",
    title: "Gravity Force Lab",
    description: "Visualize gravitational force between objects"
  },
  "pendulum": {
    url: "https://phet.colorado.edu/sims/html/pendulum-lab/latest/pendulum-lab_en.html",
    title: "Pendulum Lab",
    description: "Play with pendulums and discover the physics of oscillation"
  },
  "energy-skate": {
    url: "https://phet.colorado.edu/sims/html/energy-skate-park-basics/latest/energy-skate-park-basics_en.html",
    title: "Energy Skate Park",
    description: "Explore conservation of energy with a skater"
  },
  "circuit": {
    url: "https://phet.colorado.edu/sims/html/circuit-construction-kit-dc/latest/circuit-construction-kit-dc_en.html",
    title: "Circuit Construction Kit",
    description: "Build circuits with batteries, resistors, and light bulbs"
  },
  "ohms-law": {
    url: "https://phet.colorado.edu/sims/html/ohms-law/latest/ohms-law_en.html",
    title: "Ohm's Law",
    description: "See how voltage, resistance, and current are related"
  },
  "atom": {
    url: "https://phet.colorado.edu/sims/html/build-an-atom/latest/build-an-atom_en.html",
    title: "Build an Atom",
    description: "Build atoms from protons, neutrons, and electrons"
  },
  "molecule-shapes": {
    url: "https://phet.colorado.edu/sims/html/molecule-shapes/latest/molecule-shapes_en.html",
    title: "Molecule Shapes",
    description: "Explore molecule geometry and bond angles"
  },
  "states-of-matter": {
    url: "https://phet.colorado.edu/sims/html/states-of-matter/latest/states-of-matter_en.html",
    title: "States of Matter",
    description: "Watch atoms and molecules as a solid, liquid, or gas"
  },
  "gas-properties": {
    url: "https://phet.colorado.edu/sims/html/gas-properties/latest/gas-properties_en.html",
    title: "Gas Properties",
    description: "Pump gas molecules and see how they behave"
  },
  "waves": {
    url: "https://phet.colorado.edu/sims/html/waves-intro/latest/waves-intro_en.html",
    title: "Waves Intro",
    description: "Explore the basics of waves and their properties"
  },
  "sound": {
    url: "https://phet.colorado.edu/sims/html/sound-waves/latest/sound-waves_en.html",
    title: "Sound Waves",
    description: "See and hear how sound waves work"
  },
  "light-refraction": {
    url: "https://phet.colorado.edu/sims/html/bending-light/latest/bending-light_en.html",
    title: "Bending Light",
    description: "Explore light refraction and reflection"
  },
  "photoelectric": {
    url: "https://phet.colorado.edu/sims/cheerpj/photoelectric/latest/photoelectric.html",
    title: "Photoelectric Effect",
    description: "See how light can eject electrons from a metal surface"
  },
  "diffusion": {
    url: "https://phet.colorado.edu/sims/html/diffusion/latest/diffusion_en.html",
    title: "Diffusion",
    description: "See how molecules move from high to low concentration"
  },
  "natural-selection": {
    url: "https://phet.colorado.edu/sims/html/natural-selection/latest/natural-selection_en.html",
    title: "Natural Selection",
    description: "Explore how natural selection works on bunny populations"
  },
  "gene-expression": {
    url: "https://phet.colorado.edu/sims/html/gene-expression-essentials/latest/gene-expression-essentials_en.html",
    title: "Gene Expression Essentials",
    description: "See how genes are expressed into proteins"
  },
  "trigonometry": {
    url: "https://phet.colorado.edu/sims/html/trig-tour/latest/trig-tour_en.html",
    title: "Trig Tour",
    description: "Explore trigonometric functions and the unit circle"
  },
  "graphing-lines": {
    url: "https://phet.colorado.edu/sims/html/graphing-lines/latest/graphing-lines_en.html",
    title: "Graphing Lines",
    description: "Explore the graphs of linear equations"
  },
  "function-builder": {
    url: "https://phet.colorado.edu/sims/html/function-builder/latest/function-builder_en.html",
    title: "Function Builder",
    description: "Build functions and see their outputs"
  },
  "vector-addition": {
    url: "https://phet.colorado.edu/sims/html/vector-addition/latest/vector-addition_en.html",
    title: "Vector Addition",
    description: "Explore vector addition and components"
  },
  "friction": {
    url: "https://phet.colorado.edu/sims/html/friction/latest/friction_en.html",
    title: "Friction",
    description: "Explore friction at the molecular level"
  },
  "spring": {
    url: "https://phet.colorado.edu/sims/html/masses-and-springs/latest/masses-and-springs_en.html",
    title: "Masses and Springs",
    description: "Hang masses from springs and explore oscillation"
  },
  "collision": {
    url: "https://phet.colorado.edu/sims/html/collision-lab/latest/collision-lab_en.html",
    title: "Collision Lab",
    description: "Explore elastic and inelastic collisions"
  },
  "ph-scale": {
    url: "https://phet.colorado.edu/sims/html/ph-scale/latest/ph-scale_en.html",
    title: "pH Scale",
    description: "Test the pH of common substances"
  },
  "concentration": {
    url: "https://phet.colorado.edu/sims/html/concentration/latest/concentration_en.html",
    title: "Concentration",
    description: "Explore how concentration changes with solute and solvent"
  },
  "blackbody": {
    url: "https://phet.colorado.edu/sims/html/blackbody-spectrum/latest/blackbody-spectrum_en.html",
    title: "Blackbody Spectrum",
    description: "Explore how temperature affects electromagnetic radiation"
  },
  "greenhouse": {
    url: "https://phet.colorado.edu/sims/html/greenhouse-effect/latest/greenhouse-effect_en.html",
    title: "Greenhouse Effect",
    description: "Explore how greenhouse gases affect Earth's temperature"
  },
};

const KEYWORD_MAPPINGS: Record<string, string[]> = {
  "quantum-tunneling": ["quantum", "tunneling", "tunnel", "wave function", "barrier", "quantum mechanics"],
  "wave-interference": ["wave", "interference", "diffraction", "superposition"],
  "projectile-motion": ["projectile", "trajectory", "parabola", "throwing", "launch"],
  "forces-motion": ["force", "newton", "motion", "acceleration", "mass", "push", "pull"],
  "gravity-force": ["gravity", "gravitational", "universal gravitation", "g force"],
  "pendulum": ["pendulum", "oscillation", "harmonic", "swing", "period"],
  "energy-skate": ["energy", "kinetic", "potential", "conservation", "mechanical energy"],
  "circuit": ["circuit", "electrical", "current", "voltage", "battery", "resistor"],
  "ohms-law": ["ohm", "resistance", "conductor", "electrical resistance"],
  "atom": ["atom", "proton", "neutron", "electron", "atomic", "nucleus"],
  "molecule-shapes": ["molecule", "molecular", "bond", "geometry", "vsepr", "covalent"],
  "states-of-matter": ["solid", "liquid", "gas", "phase", "state of matter", "phase transition"],
  "gas-properties": ["gas", "pressure", "volume", "ideal gas", "boyle", "charles"],
  "waves": ["wave", "wavelength", "frequency", "amplitude"],
  "sound": ["sound", "acoustic", "audio", "frequency", "pitch", "decibel"],
  "light-refraction": ["refraction", "reflection", "snell", "lens", "prism", "optics"],
  "photoelectric": ["photoelectric", "photon", "electron emission", "light particle"],
  "diffusion": ["diffusion", "concentration", "membrane", "osmosis"],
  "natural-selection": ["evolution", "natural selection", "darwin", "adaptation", "mutation", "survival"],
  "gene-expression": ["gene", "dna", "rna", "transcription", "translation", "protein"],
  "trigonometry": ["trigonometry", "sine", "cosine", "tangent", "unit circle", "trig"],
  "graphing-lines": ["linear", "slope", "intercept", "line equation", "y = mx + b"],
  "function-builder": ["function", "input output", "mathematical function"],
  "vector-addition": ["vector", "component", "magnitude", "direction", "resultant"],
  "friction": ["friction", "static friction", "kinetic friction", "coefficient"],
  "spring": ["spring", "hooke", "elastic", "restoring force", "spring constant"],
  "collision": ["collision", "momentum", "elastic", "inelastic", "conservation of momentum"],
  "ph-scale": ["ph", "acid", "base", "alkaline", "hydrogen ion"],
  "concentration": ["concentration", "molarity", "solution", "solute", "solvent"],
  "blackbody": ["blackbody", "radiation", "planck", "stefan-boltzmann", "wien"],
  "greenhouse": ["greenhouse", "climate", "carbon dioxide", "global warming", "atmosphere"],
};

export function findMatchingPhET(topic: string): { key: string; sim: typeof PHET_SIMULATIONS[string] } | null {
  const lowerTopic = topic.toLowerCase();
  
  for (const [key, keywords] of Object.entries(KEYWORD_MAPPINGS)) {
    for (const keyword of keywords) {
      if (lowerTopic.includes(keyword.toLowerCase())) {
        const sim = PHET_SIMULATIONS[key];
        if (sim) {
          return { key, sim };
        }
      }
    }
  }
  
  return null;
}

interface PhETSimulationProps {
  topic: string;
  fallback?: React.ReactNode;
}

export function PhETSimulation({ topic, fallback }: PhETSimulationProps) {
  const [loading, setLoading] = useState(true);
  const match = findMatchingPhET(topic);
  
  if (!match) {
    return fallback || null;
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="font-medium text-sm">{match.sim.title}</h4>
          <p className="text-xs text-muted-foreground">{match.sim.description}</p>
        </div>
        <a 
          href={match.sim.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-xs text-primary hover:underline"
        >
          Open in new tab <ExternalLink className="w-3 h-3" />
        </a>
      </div>
      
      <div className="relative rounded-xl overflow-hidden bg-white" style={{ height: "500px" }}>
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-muted">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        )}
        <iframe
          src={match.sim.url}
          className="w-full h-full border-0"
          onLoad={() => setLoading(false)}
          allow="fullscreen"
          title={match.sim.title}
        />
      </div>
      
      <p className="text-xs text-muted-foreground text-center">
        Simulation by PhET Interactive Simulations, University of Colorado Boulder
      </p>
    </div>
  );
}
