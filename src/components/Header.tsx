import {Button, Badge, Tooltip} from "antd";
import {CloudSyncOutlined, DisconnectOutlined, LoadingOutlined, CheckCircleOutlined, InfoCircleOutlined} from "@ant-design/icons";

interface HeaderProps {
    isConnected: boolean;
    lastSynced: string | null;
    isLoading: boolean;
    onSyncClick: () => void;
    onDisconnect: () => void;
}

const Header = ({isConnected, lastSynced, isLoading, onSyncClick, onDisconnect}: HeaderProps) => {
    return (
        <header className="sticky top-0 z-50 w-full glass-panel border-b border-white/5 py-4 px-6 md:px-10 flex flex-col md:flex-row items-center justify-between gap-4 shadow-xl">
            {/* Logo and Branding */}
            <div className="flex items-center gap-3 self-start md:self-auto">
                <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500/20 to-blue-600/20 border border-cyan-500/30 shadow-lg shadow-cyan-500/5">
                    <svg className="w-6 h-6" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <defs>
                            <linearGradient id="header-trident" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stop-color="#06b6d4" />
                                <stop offset="100%" stop-color="#3b82f6" />
                            </linearGradient>
                        </defs>
                        <path d="M256 90 L275 170 L256 190 L237 170 Z" fill="url(#header-trident)" />
                        <path d="M180 150 L200 210 L188 230 L170 180 Z" fill="url(#header-trident)" />
                        <path d="M332 150 L342 180 L324 230 L312 210 Z" fill="url(#header-trident)" />
                        <path d="M180 200 C 180 290, 332 290, 332 200 C 332 260, 285 285, 256 285 C 227 285, 180 260, 180 200 Z" fill="url(#header-trident)" />
                        <rect x="248" y="275" width="16" height="150" rx="8" fill="url(#header-trident)" />
                        <path d="M236 420 L256 448 L276 420 Z" fill="url(#header-trident)" />
                    </svg>
                </div>
                <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                        <span className="text-xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400 bg-clip-text text-transparent customFont tracking-wide">
                            Trident System
                        </span>
                        <Badge count="v1.1" style={{ backgroundColor: 'rgba(6, 182, 212, 0.15)', color: '#06b6d4', boxShadow: 'none', border: '1px solid rgba(6, 182, 212, 0.3)' }} />
                    </div>
                    <span className="text-xs text-gray-500 font-medium tracking-widest uppercase">Stay Focused</span>
                </div>
            </div>

            {/* Sync Status Controls */}
            <div className="flex items-center gap-4 flex-wrap w-full md:w-auto justify-end">
                {isConnected ? (
                    <div className="flex items-center gap-3 bg-gray-900/60 border border-white/5 py-1.5 px-3 md:px-4 rounded-xl text-xs md:text-sm">
                        <div className="flex items-center gap-2">
                            {isLoading ? (
                                <LoadingOutlined className="text-cyan-400 animate-spin" />
                            ) : (
                                <CheckCircleOutlined className="text-emerald-400" />
                            )}
                            <span className="text-gray-300 font-medium hidden sm:inline">Calendar Connected</span>
                        </div>
                        <div className="h-4 w-px bg-white/10 hidden sm:block"></div>
                        {lastSynced && (
                            <span className="text-gray-400">
                                Synced: <span className="text-gray-200 font-semibold">{lastSynced}</span>
                            </span>
                        )}
                        <Tooltip title="Disconnect Google Calendar">
                            <Button 
                                type="text" 
                                danger
                                icon={<DisconnectOutlined />} 
                                onClick={onDisconnect}
                                className="hover:bg-red-500/10 flex items-center justify-center p-2 rounded-lg"
                            />
                        </Tooltip>
                    </div>
                ) : (
                    <div className="flex items-center gap-2 text-xs text-gray-400 mr-2">
                        <InfoCircleOutlined />
                        <span>Authorize calendar connection to load your events.</span>
                    </div>
                )}

                <Button
                    type={isConnected ? "default" : "primary"}
                    size="large"
                    icon={isLoading ? <LoadingOutlined /> : <CloudSyncOutlined />}
                    disabled={isLoading}
                    onClick={onSyncClick}
                    className={`font-semibold rounded-xl flex items-center justify-center transition-all ${
                        !isConnected 
                            ? "bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 border-none shadow-lg shadow-cyan-500/20" 
                            : "hover:border-cyan-400 hover:text-cyan-400"
                    }`}
                >
                    {isLoading ? "Syncing..." : isConnected ? "Sync Calendar" : "Connect Google Calendar"}
                </Button>
            </div>
        </header>
    );
};

export default Header;
