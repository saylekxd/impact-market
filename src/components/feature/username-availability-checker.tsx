import { useRef, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase"; // Assuming @/ works here
import { CheckCircle, XCircle, Loader2 } from "lucide-react";

export const UsernameAvailabilityChecker: React.FC = () => {
    const [creatorName, setCreatorName] = useState("");
    const [availabilityStatus, setAvailabilityStatus] = useState<
        "idle" | "checking" | "available" | "unavailable"
    >("idle");
    const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const newName = event.target.value;
        setCreatorName(newName);

        if (debounceTimeoutRef.current) {
            clearTimeout(debounceTimeoutRef.current);
        }

        if (newName.trim() === '') {
            setAvailabilityStatus("idle");
        } else {
            setAvailabilityStatus("checking");
            debounceTimeoutRef.current = setTimeout(() => {
                handleCheckAvailability(newName);
            }, 500); 
        }
    };

    const handleCheckAvailability = async (nameToCheck: string) => {
        const trimmedName = nameToCheck.trim();
        if (!trimmedName) {
            setAvailabilityStatus("idle");
            return;
        }
        console.log("Checking availability for:", trimmedName);

        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('username')
                .eq('username', trimmedName)
                .maybeSingle();

            if (error) {
                console.error("Error checking username:", error);
                setAvailabilityStatus("idle");
                return;
            }

            setAvailabilityStatus(data === null ? "available" : "unavailable");
        } catch (err) {
            console.error("Unexpected error checking username:", err);
            setAvailabilityStatus("idle");
        }
    };

    useEffect(() => {
        // Cleanup timer on unmount
        return () => {
            if (debounceTimeoutRef.current) {
                clearTimeout(debounceTimeoutRef.current);
            }
        };
    }, []);

    return (
        <div className="w-full">
            <div className="relative w-full mb-3">
                <input
                    id="creatorNameInput"
                    type="text"
                    value={creatorName}
                    onChange={handleInputChange}
                    placeholder="Sprawdź dostępność nazwy..."
                    className="w-full h-12 sm:h-14 md:h-16 rounded-full border border-gray-600 bg-[#2a2a2a] px-6 sm:px-8 text-base sm:text-lg md:text-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#ffa04f] focus:border-transparent transition-all duration-200"
                />
                {availabilityStatus === "checking" && (
                    <div className="absolute inset-y-0 right-0 flex items-center pr-6">
                        <Loader2 className="h-5 w-5 sm:h-6 sm:w-6 md:h-8 md:w-8 text-gray-400 animate-spin" />
                    </div>
                )}
            </div>

            <AnimatePresence>
                {availabilityStatus !== "idle" && availabilityStatus !== "checking" && (
                    <motion.p
                        key="status-message"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.3 }}
                        className={`mt-4 text-base sm:text-lg md:text-xl flex items-center justify-center space-x-3 ${
                            availabilityStatus === "available" 
                                ? "text-green-400" 
                                : "text-red-400"
                        }`}
                    >
                        {availabilityStatus === "available" ? (
                            <>
                                <CheckCircle className="h-5 w-5 sm:h-6 sm:w-6 md:h-8 md:w-8" />
                                <span>Mamy to! Nazwa "{creatorName}" jest dostępne.</span>
                            </>
                        ) : (
                            <>
                                <XCircle className="h-5 w-5 sm:h-6 sm:w-6 md:h-8 md:w-8" />
                                <span>Sorry, Nazwa "{creatorName}" jest aktualnie zajęta.</span>
                            </>
                        )}
                    </motion.p>
                )}
            </AnimatePresence>
        </div>
    );
}; 