import {createContext, useContext} from "react";

type TimerContextType = {
    isPlaying: boolean;
    isBreak: boolean;
    remainingTimeInSeconds: number;
    setIsPlaying: (isPlaying: boolean) => void;
    skipTimer: () => void;
    resetTimer: () => void;
}

export const TimerContext = createContext<TimerContextType | undefined>(undefined);

export const useTimer = () => {
    const context = useContext(TimerContext);
    if (!context) throw new Error("useTimer must be used within a TimerProvider");
    return context;
};