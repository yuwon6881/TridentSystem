import * as React from "react";

interface CustomButtonProps {
    children: React.ReactNode;
    needBackground?: boolean;
    customSize?: string;
    onClick?: () => void;
}

const CustomButton = ({children, needBackground, customSize, onClick}: CustomButtonProps) => {
    return (
        <div
            className={`${needBackground ? 'bg-blue-500 hover:bg-blue-600' : 'hover:text-blue-300'}  hover:cursor-pointer rounded-xl flex flex-col space-y-2 items-center justify-center ${customSize ? customSize : 'w-16 h-16'}`}
            onClick={onClick}>
            {children}
        </div>
    )
}

export default CustomButton