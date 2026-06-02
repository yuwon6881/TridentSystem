import FocusTimerPage from "./pages/FocusTimerPage.tsx";
import Sidebar from "./components/Sidebar.tsx";
import CustomComponent from "./components/CustomComponent.tsx";
import {Routes, Route} from "react-router-dom"
import AnnualMacroPage from "./pages/AnnualMacroPage.tsx";
import {useState} from "react";
import {TimerProvider} from "./contexts/TimerProvider.tsx";

function App() {
    const [collapsed, setCollapsed] = useState(false)

    window.addEventListener('resize', () => {
        const width = window.innerWidth;
        setCollapsed(width < 500)
    })

    return (
        <div className={"flex h-screen w-screen overflow-hidden"}>
            <Sidebar collapsed={collapsed}/>
            <CustomComponent className={"flex flex-1 flex-col items-center h-screen text-center justify-around py-28"}>
                <div className={`flex flex-col ${collapsed ? '': 'hidden'}`}>
                    <span className={"text-3xl text-blue-300 font-semibold text-center customFont"}>Trident System</span>
                    <span className={"text-lg"}>STAY FOCUSED</span>
                </div>
                <TimerProvider>
                    <Routes>
                        <Route path="/" index element={<FocusTimerPage/>}/>
                        <Route path="/annualMacro" element={<AnnualMacroPage/>}/>
                    </Routes>
                </TimerProvider>
            </CustomComponent>
        </div>
    )
}

export default App
