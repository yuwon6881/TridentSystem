import {theme} from "antd";
import * as React from "react";

interface CustomComponentProps {
    children: React.ReactNode;
    className?: string;
    style?: React.CSSProperties;
}

const customComponent = ({children, className, style}: CustomComponentProps) => {
    const {token} = theme.useToken()

    return (
        <div
            className={className}
            style={{
                ...style,
                backgroundColor: token.colorBgContainer,
                color: token.colorText,
            }}
        >
            {children}
        </div>
    )
}
export default customComponent