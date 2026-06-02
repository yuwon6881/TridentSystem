import {Progress} from "antd";
import {ArrowCounterclockwise, Pause, Play, SkipEnd} from "react-bootstrap-icons";
import CustomButton from "../components/CustomButton.tsx";
import {useTimer} from "../contexts/TimerContext.tsx";
import {initiateTimer} from "../utils/timerUtils.ts";

const FocusTimerPage = () => {
    const {isPlaying, isBreak, remainingTimeInSeconds, setIsPlaying, resetTimer, skipTimer} =
        useTimer()
    const minutes = Math.floor(remainingTimeInSeconds / 60)
    const seconds = remainingTimeInSeconds % 60
    const percent = (remainingTimeInSeconds / initiateTimer(isBreak)) * 100

    return (
        <div>
            <div className={"text-blue-300 tracking-widest font-semibold"}
                 style={{fontFamily: 'Inter'}}>{'CURRENT SESSION'}</div>
            {isBreak ? <div className={"customFont"}>Recharge & Refuel</div> :
                <div className={"customFont"}>Focus Phase</div>}
            <div className={"space-y-9"}>
                <div className={"space-y-4"}>
                    <div
                        className={"text-9xl"}>{minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}</div>
                    <Progress percent={percent} status="active" showInfo={false}/>
                </div>
                <div className={"flex justify-around items-end"}>
                    <CustomButton onClick={() => {
                        resetTimer()
                    }}><ArrowCounterclockwise size={26}/><span>Reset</span></CustomButton>
                    {!isPlaying &&
                        <CustomButton
                            onClick={() => {
                                setIsPlaying(true)
                            }}
                            customSize={'w-20 h-20'} needBackground={true}><Play
                            size={48}/></CustomButton>}
                    {isPlaying &&
                        <CustomButton
                            onClick={() => setIsPlaying(false)}
                            customSize={'w-20 h-20'}
                            needBackground={true}><Pause
                            size={48}/></CustomButton>}
                    <CustomButton onClick={() => {
                        skipTimer()
                    }}><SkipEnd size={48}/><span>Skip</span></CustomButton>
                </div>
            </div>
        </div>
    )
}

export default FocusTimerPage