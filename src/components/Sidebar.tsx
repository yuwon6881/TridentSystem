import {Menu, type MenuProps} from "antd";
import {CalendarOutlined, ClockCircleOutlined} from "@ant-design/icons";
import CustomComponent from "./CustomComponent.tsx";
import {useNavigate} from "react-router-dom";

const Sidebar = ({collapsed}: {
    collapsed: boolean
}) => {
    type MenuItem = Required<MenuProps>['items'][2]
    const navigate = useNavigate()
    const items: MenuItem[] = [
        {
            key: '/',
            label: 'Focus Timer',
            icon: <ClockCircleOutlined/>
        },
        {
            key: '/annualMacro',
            label: 'Annual Macro',
            icon: <CalendarOutlined/>
        }
    ]

    const handleMenuClick: MenuProps['onClick'] = (e) => {
        navigate(e.key)
    }

    return (
        <>
            <CustomComponent className={"lg:w-64"} style={{borderInlineEnd: '1px solid #303030'}}>
                <SidebarTitle isCollapse={collapsed}/>
                <Menu id={'sidebar-menu'} style={{borderInlineEnd: 'none'}} className="h-screen"
                      defaultSelectedKeys={[window.location.pathname]} mode="inline"
                      onClick={handleMenuClick}
                      inlineCollapsed={collapsed}
                      items={items}/>
            </CustomComponent>
        </>
    )

}

const SidebarTitle = ({isCollapse}: { isCollapse: boolean }) => {
    return (
        <div className={`flex flex-col px-7 pt-4 py-10 items-start ${isCollapse ? "hidden" : ""}`}>
            <span className={"text-blue-300 font-semibold text-center customFont"}>Trident System</span>
            <span className={"text-sm"}>STAY FOCUSED</span>
        </div>
    )
}

export default Sidebar