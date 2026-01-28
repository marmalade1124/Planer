import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, ChevronRight, Zap } from "lucide-react";
import { useConfetti } from "@/hooks/useConfetti";

export const OnboardingOverlay = () => {
    const [step, setStep] = useState(0);
    const [isVisible, setIsVisible] = useState(false);
    const confetti = useConfetti();

    useEffect(() => {
        const seen = localStorage.getItem("planer_onboarding_seen");
        if (!seen) {
            setIsVisible(true);
        }
    }, []);

    const handleNext = () => {
        if (step < 2) {
            setStep(prev => prev + 1);
        } else {
            handleComplete();
        }
    };

    const handleComplete = () => {
        localStorage.setItem("planer_onboarding_seen", "true");
        confetti.trigger();
        setIsVisible(false);
    };

    if (!isVisible) return null;

    const slides = [
        {
            icon: <div className="text-4xl">👋</div>,
            title: "Welcome to PlanREAL",
            desc: "The minimal planner that adapts to your energy, not just your time.",
            btn: "Get Started"
        },
        {
            icon: <Zap size={48} className="text-yellow-500" />,
            title: "Track Your Energy",
            desc: "Tag tasks as High, Medium, or Low energy. We'll help you pick what to do based on how you feel.",
            btn: "Next"
        },
        {
            icon: <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-purple-600 rounded-xl flex items-center justify-center text-white"><Check /></div>,
            title: "Reality Mode",
            desc: "Overwhelmed? Hit 'Reality Mode' to let AI filter your list down to the ONE thing that matters right now.",
            btn: "Let's Go!"
        }
    ];

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-white/90 backdrop-blur-xl">
             <div className="max-w-md w-full">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={step}
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -20, scale: 0.95 }}
                        transition={{ duration: 0.3 }}
                        className="flex flex-col items-center text-center space-y-6"
                    >
                        <div className="p-6 bg-white rounded-3xl shadow-xl border border-gray-100 mb-4">
                            {slides[step].icon}
                        </div>
                        
                        <div className="space-y-2">
                            <h2 className="text-2xl font-bold text-[#1A1A1A]">{slides[step].title}</h2>
                            <p className="text-gray-500 leading-relaxed max-w-xs mx-auto">
                                {slides[step].desc}
                            </p>
                        </div>

                        <div className="pt-4 flex gap-2">
                            {/* Dots */}
                            {[0, 1, 2].map(i => (
                                <div key={i} className={`h-2 w-2 rounded-full transition-colors ${i === step ? 'bg-[#1A1A1A]' : 'bg-gray-200'}`} />
                            ))}
                        </div>

                        <button 
                            onClick={handleNext}
                            className="w-full py-4 bg-[#1A1A1A] text-white rounded-2xl font-medium text-lg hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 mt-8"
                        >
                            {slides[step].btn}
                            {step < 2 && <ChevronRight size={20} />}
                        </button>
                    </motion.div>
                </AnimatePresence>
             </div>
        </div>
    );
};
