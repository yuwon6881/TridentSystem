import notification from "../assets/notification.mp3"

export function initiateTimer(isBreak: boolean) {
    const minutes = isBreak ? 20 : 0.1
    return minutes * 60
}

export async function notificationSound() {
    const audio = new Audio(notification)
    audio.volume = 0.5
    audio.play().catch((err) => console.warn('Failed to play audio: ', err.message || 'Unknown error'))
}