import React, {useEffect, useState} from "react";
import {TimerContext} from "./TimerContext.tsx";
import {initiateTimer, notificationSound} from "../utils/timerUtils.ts";

export const TimerProvider = ({children}: { children: React.ReactNode }) => {
    const [isPlaying, setIsPlaying] = useState<boolean>(() => {
        return localStorage.getItem('timer_isPlaying') === 'true'
    })
    const [isBreak, setIsBreak] = useState<boolean>(() => {
        return localStorage.getItem('timer_isBreak') === 'true'
    })
    const [remainingTimeInSeconds, setRemainingTimeInSeconds] = useState<number>(() => {
        const storedRemainingTime = localStorage.getItem('timer_remainingTime')
        const storedEndTime = localStorage.getItem('timer_endTime')

        if (storedEndTime) {
            const endTime = parseInt(storedEndTime)
            if (endTime < Date.now()) setIsPlaying(false)
            return Math.max(0, Math.round((endTime - Date.now()) / 1000))
        } else if (storedRemainingTime) {
            return parseInt(storedRemainingTime) / 1000
        }

        return initiateTimer(isBreak)
    })

    useEffect(() => {
        let interval: number | undefined = undefined;
        if (isPlaying) {
            interval = setInterval(() => {
                setRemainingTimeInSeconds(prevTime => {
                    if (prevTime > 1) {
                        return prevTime - 1
                    }
                    notificationSound()
                    const nextIsBreak = !isBreak
                    const nextTime = initiateTimer(nextIsBreak)
                    setIsBreak(nextIsBreak)
                    return nextTime
                })
            }, 1000)
        }
        return () => clearInterval(interval)
    }, [isPlaying, isBreak])

    useEffect(() => {
        localStorage.setItem('timer_isBreak', isBreak.toString())
        localStorage.setItem('timer_isPlaying', isPlaying.toString())
    }, [isBreak, isPlaying]);

    useEffect(() => {
        if (isPlaying) {
            localStorage.setItem('timer_endTime', (Date.now() + remainingTimeInSeconds * 1000).toString())
            localStorage.removeItem('timer_remainingTime')
        } else {
            localStorage.setItem('timer_remainingTime', (remainingTimeInSeconds * 1000).toString())
            localStorage.removeItem('timer_endTime')
        }
    }, [isPlaying, remainingTimeInSeconds]);

    const skipTimer = () => {
        const nextIsBreak = !isBreak
        setIsBreak(nextIsBreak)
        setRemainingTimeInSeconds(initiateTimer(nextIsBreak))
    }

    const resetTimer = () => {
        setRemainingTimeInSeconds(initiateTimer(isBreak))
        localStorage.setItem('timer_remainingTime', (initiateTimer(isBreak) * 1000).toString())
        setIsPlaying(false)
    }

    return (
        <TimerContext value={{
            isPlaying,
            isBreak,
            remainingTimeInSeconds,
            setIsPlaying,
            skipTimer,
            resetTimer
        }}>
            {children}
        </TimerContext>
    )
}