import {StrictMode} from 'react'
import {createRoot} from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import {ConfigProvider, theme} from "antd";
import {BrowserRouter} from "react-router-dom";

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <ConfigProvider theme={{
            algorithm: theme.darkAlgorithm,
            token: {
                colorPrimary: '#06b6d4',
                colorBgContainer: '#0b0f19',
                colorBgBase: '#030712',
                borderRadius: 12,
                fontFamily: '"Hanken Grotesk", sans-serif',
            },
        }}>
            <BrowserRouter>
                <App/>
            </BrowserRouter>
        </ConfigProvider>
    </StrictMode>,
)
