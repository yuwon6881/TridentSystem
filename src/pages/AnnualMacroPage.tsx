import {useState, useMemo} from "react";
import {Button, Table, Input, Card, Radio, Tag, Empty, Tooltip, Select} from "antd";
import {
    SearchOutlined,
    CalendarOutlined,
    AppstoreOutlined,
    UnorderedListOutlined,
    ClockCircleOutlined,
    CarryOutOutlined,
    ScheduleOutlined,
    BellOutlined
} from "@ant-design/icons";
import type {EventDataSource, CalendarItem} from "../App.tsx";

interface AnnualMacroPageProps {
    dataSource: EventDataSource[];
    calendarList: CalendarItem[];
    selectedCalendarId: string | null;
    handleSelectCalendar: (calendarId: string) => void;
    isLoading: boolean;
    isConnected: boolean;
    handleSyncClick: () => void;
}

const {Option} = Select;

const AnnualMacroPage = ({
    dataSource,
    calendarList,
    selectedCalendarId,
    handleSelectCalendar,
    isLoading,
    isConnected,
    handleSyncClick
}: AnnualMacroPageProps) => {
    const [searchQuery, setSearchQuery] = useState("");
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

    const months = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    // Filter events by search query
    const filteredEvents = useMemo(() => {
        if (!searchQuery.trim()) return dataSource;
        return dataSource.filter(event => 
            event.EventName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            event.Month.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [dataSource, searchQuery]);

    // Group events by month for grid view
    const eventsByMonth = useMemo(() => {
        const grouped: Record<string, EventDataSource[]> = {};
        months.forEach(m => {
            grouped[m] = [];
        });
        filteredEvents.forEach(event => {
            if (grouped[event.Month]) {
                grouped[event.Month].push(event);
            }
        });
        return grouped;
    }, [filteredEvents]);

    // Statistics Calculation
    const stats = useMemo(() => {
        const total = dataSource.length;
        
        // Find current month events count
        const currentMonthName = new Date().toLocaleString('en-GB', {month: 'long'});
        const currentMonthCount = dataSource.filter(e => e.Month === currentMonthName).length;

        // Next upcoming event details
        let nextEventStr = "None scheduled";
        const now = new Date();
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
        const futureEvents = dataSource
            .filter(e => e.rawStartDate >= startOfToday)
            .sort((a, b) => a.rawStartDate - b.rawStartDate);
        
        if (futureEvents.length > 0) {
            nextEventStr = `${futureEvents[0].EventName} (${new Date(futureEvents[0].rawStartDate).toLocaleDateString('en-GB', {day: 'numeric', month: 'short'})})`;
        } else if (dataSource.length > 0) {
            nextEventStr = `${dataSource[0].EventName}`;
        }

        return {
            total,
            currentMonthName,
            currentMonthCount,
            nextEventStr
        };
    }, [dataSource]);

    const columns = [
        {
            title: 'Month',
            dataIndex: 'Month',
            key: 'Month',
            sorter: (a: EventDataSource, b: EventDataSource) => a.rawStartDate - b.rawStartDate,
            render: (text: string) => (
                <span className="font-semibold text-cyan-400">{text}</span>
            )
        },
        {
            title: 'Event Name',
            dataIndex: 'EventName',
            key: 'EventName',
            render: (text: string) => (
                <span className="font-medium text-gray-100">{text}</span>
            )
        },
        {
            title: 'Start Date & Time',
            dataIndex: 'StartDate',
            key: 'StartDate',
            sorter: (a: EventDataSource, b: EventDataSource) => a.rawStartDate - b.rawStartDate,
            defaultSortOrder: 'ascend' as const,
            render: (text: string) => (
                <span className="text-gray-400 flex items-center gap-1.5">
                    <ClockCircleOutlined className="text-gray-600 text-xs" />
                    {text}
                </span>
            )
        },
        {
            title: 'End Date & Time',
            dataIndex: 'EndDate',
            key: 'EndDate',
            render: (text: string) => (
                <span className="text-gray-500">{text}</span>
            )
        }
    ];

    // Landing screen if not connected
    if (!isConnected) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
                <div className="glass-panel p-10 md:p-16 rounded-3xl max-w-xl w-full flex flex-col items-center shadow-2xl relative overflow-hidden border border-white/5">
                    <div className="absolute -top-12 -left-12 w-40 h-40 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>
                    <div className="absolute -bottom-12 -right-12 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>

                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 flex items-center justify-center mb-8 shadow-lg shadow-cyan-500/5">
                        <CalendarOutlined className="text-4xl text-cyan-400 animate-pulse" />
                    </div>

                    <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-200 to-gray-400 mb-4 tracking-tight">
                        Connect Your Calendar
                    </h1>
                    
                    <p className="text-gray-400 mb-8 max-w-md text-sm md:text-base leading-relaxed">
                        Stay on top of your schedule. Authorize Trident System to retrieve and display your annual macro events, milestones, and updates directly in a beautiful dashboard.
                    </p>

                    <Button 
                        type="primary" 
                        size="large"
                        loading={isLoading}
                        onClick={handleSyncClick}
                        className="px-8 font-semibold h-12 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 border-none shadow-lg shadow-cyan-500/25 transition-all duration-300 hover:scale-105"
                    >
                        Connect Google Calendar
                    </Button>
                </div>
            </div>
        );
    }

    // Connected but user needs to select which calendar to track
    if (!selectedCalendarId) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
                <div className="glass-panel p-10 md:p-12 rounded-3xl max-w-lg w-full flex flex-col items-center shadow-2xl relative border border-white/5">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-500/15 to-indigo-500/15 border border-cyan-500/25 flex items-center justify-center mb-6">
                        <CarryOutOutlined className="text-3xl text-cyan-400" />
                    </div>

                    <h2 className="text-2xl font-bold text-white mb-2">Select a Calendar</h2>
                    <p className="text-gray-400 text-sm mb-6">
                        We found multiple calendars in your account. Choose the calendar you wish to display events from.
                    </p>

                    <Select
                        placeholder="Choose a calendar..."
                        loading={isLoading}
                        onChange={handleSelectCalendar}
                        className="w-full h-11 text-left mb-6 custom-select"
                        size="large"
                        dropdownClassName="bg-gray-950 border border-white/10"
                    >
                        {calendarList.map(cal => (
                            <Option key={cal.id} value={cal.id}>
                                <div className="flex items-center justify-between">
                                    <span className="font-semibold text-gray-200">{cal.summary}</span>
                                    {cal.primary && (
                                        <Tag color="cyan" className="m-0 text-[10px] scale-90 border-none font-bold">PRIMARY</Tag>
                                    )}
                                </div>
                            </Option>
                        ))}
                    </Select>

                    <p className="text-xs text-gray-500 italic">
                        You can change this calendar selection at any time from the dashboard.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Header info / title & Calendar Switcher */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex flex-col gap-2">
                    <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                        <CalendarOutlined className="text-cyan-400" />
                        Annual Macro Dashboard
                    </h2>
                    <p className="text-gray-400 text-sm">
                        High-level review and monitoring of your year-round major events.
                    </p>
                </div>
                
                {/* Switcher Calendar Select */}
                <div className="flex items-center gap-2 self-start md:self-auto bg-gray-900/40 p-2 rounded-xl border border-white/5">
                    <span className="text-xs text-gray-400 font-semibold px-2 shrink-0">TRACKING:</span>
                    <Select
                        value={selectedCalendarId}
                        onChange={handleSelectCalendar}
                        loading={isLoading}
                        className="w-56 text-left border-none custom-select-header"
                        dropdownClassName="bg-gray-950 border border-white/10"
                    >
                        {calendarList.map(cal => (
                            <Option key={cal.id} value={cal.id}>
                                <span className="font-medium text-gray-200">{cal.summary}</span>
                            </Option>
                        ))}
                    </Select>
                </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Total Events */}
                <div className="glass-panel p-6 rounded-2xl border border-white/5 flex items-center justify-between">
                    <div className="space-y-1">
                        <span className="text-xs font-semibold text-gray-500 uppercase tracking-widest">Total Events</span>
                        <h3 className="text-3xl font-bold text-white customFont">{stats.total}</h3>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
                        <CarryOutOutlined className="text-xl text-cyan-400" />
                    </div>
                </div>

                {/* Current Month Load */}
                <div className="glass-panel p-6 rounded-2xl border border-white/5 flex items-center justify-between">
                    <div className="space-y-1">
                        <span className="text-xs font-semibold text-gray-500 uppercase tracking-widest">{stats.currentMonthName} Load</span>
                        <h3 className="text-3xl font-bold text-white customFont">
                            {stats.currentMonthCount} <span className="text-sm text-gray-500 font-medium">events</span>
                        </h3>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                        <ScheduleOutlined className="text-xl text-blue-400" />
                    </div>
                </div>

                {/* Next Event */}
                <div className="glass-panel p-6 rounded-2xl border border-white/5 flex items-center justify-between lg:col-span-2">
                    <div className="space-y-1 max-w-[80%]">
                        <span className="text-xs font-semibold text-gray-500 uppercase tracking-widest">Next Critical Event</span>
                        <Tooltip title={stats.nextEventStr}>
                            <h3 className="text-lg font-bold text-white truncate customFont mt-1">{stats.nextEventStr}</h3>
                        </Tooltip>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shrink-0">
                        <BellOutlined className="text-xl text-indigo-400" />
                    </div>
                </div>
            </div>

            {/* Controls Bar */}
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-gray-900/40 p-4 rounded-2xl border border-white/5">
                {/* Search Bar */}
                <Input
                    prefix={<SearchOutlined className="text-gray-500" />}
                    placeholder="search milestones"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full sm:max-w-md h-10 bg-gray-950/60 border-white/10 hover:border-cyan-500/50 focus:border-cyan-500 text-white rounded-xl placeholder:text-gray-500"
                    allowClear
                />

                {/* View Switcher */}
                <Radio.Group 
                    value={viewMode} 
                    onChange={(e) => setViewMode(e.target.value)}
                    buttonStyle="solid"
                    className="shrink-0"
                >
                    <Radio.Button value="grid" className="h-10 inline-flex items-center px-4 rounded-l-xl bg-gray-950/60 border-white/10 text-gray-400 hover:text-white">
                        <AppstoreOutlined className="mr-1.5" /> Grid View
                    </Radio.Button>
                    <Radio.Button value="list" className="h-10 inline-flex items-center px-4 rounded-r-xl bg-gray-950/60 border-white/10 text-gray-400 hover:text-white">
                        <UnorderedListOutlined className="mr-1.5" /> Detailed List
                    </Radio.Button>
                </Radio.Group>
            </div>

            {/* Content Display */}
            {filteredEvents.length === 0 ? (
                <div className="glass-panel p-16 rounded-3xl border border-white/5 flex flex-col items-center justify-center text-center">
                    <Empty
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                        description={
                            <span className="text-gray-400 font-medium">
                                No events found matching "{searchQuery}"
                            </span>
                        }
                    />
                </div>
            ) : viewMode === "grid" ? (
                /* Year Grid (12 Months) */
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {months.map(month => {
                        const monthEvents = eventsByMonth[month] || [];
                        const isCurrentMonth = new Date().toLocaleString('en-GB', {month: 'long'}) === month;
                        
                        return (
                            <Card 
                                key={month}
                                className={`glass-panel glass-panel-hover border rounded-2xl relative overflow-hidden transition-all duration-300 ${
                                    isCurrentMonth 
                                        ? "border-cyan-500/40 shadow-lg shadow-cyan-500/5 bg-cyan-950/5" 
                                        : "border-white/5"
                                }`}
                                bodyStyle={{ padding: '20px' }}
                            >
                                {/* Month Header */}
                                <div className="flex items-center justify-between border-b border-white/5 pb-3 mb-4">
                                    <span className={`text-lg font-bold customFont ${isCurrentMonth ? "text-cyan-400" : "text-white"}`}>
                                        {month}
                                    </span>
                                    <Tag className="rounded-full px-2.5 py-0.5 border-none font-semibold text-xs" style={{ 
                                        backgroundColor: monthEvents.length > 0 
                                            ? (isCurrentMonth ? 'rgba(6, 182, 212, 0.2)' : 'rgba(255, 255, 255, 0.06)') 
                                            : 'rgba(255, 255, 255, 0.02)',
                                        color: monthEvents.length > 0 
                                            ? (isCurrentMonth ? '#22d3ee' : '#9ca3af') 
                                            : '#4b5563'
                                    }}>
                                        {monthEvents.length} {monthEvents.length === 1 ? 'event' : 'events'}
                                    </Tag>
                                </div>

                                {/* Month Events List */}
                                <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
                                    {monthEvents.length === 0 ? (
                                        <div className="text-xs text-gray-600 italic py-2">
                                            No events scheduled
                                        </div>
                                    ) : (
                                        monthEvents
                                            .sort((a, b) => a.rawStartDate - b.rawStartDate)
                                            .map(event => {
                                                const dateObj = new Date(event.rawStartDate);
                                                const formattedDate = dateObj.toLocaleDateString('en-GB', {day: 'numeric', month: 'short'});
                                                const timeDisplay = event.isAllDay 
                                                    ? "All Day" 
                                                    : dateObj.toLocaleTimeString('en-GB', {hour: '2-digit', minute: '2-digit'});
                                                
                                                return (
                                                    <div 
                                                        key={event.key} 
                                                        className="group/item flex flex-col gap-1 p-2 rounded-lg bg-white/[0.02] hover:bg-white/[0.05] border border-white/[0.02] transition-colors"
                                                    >
                                                        <span className="text-xs font-semibold text-gray-200 group-hover/item:text-cyan-400 transition-colors line-clamp-2">
                                                            {event.EventName}
                                                        </span>
                                                        <span className="text-[10px] text-gray-500 font-medium">
                                                            {formattedDate} {` • `} {timeDisplay}
                                                        </span>
                                                    </div>
                                                );
                                            })
                                    )}
                                </div>
                            </Card>
                        );
                    })}
                </div>
            ) : (
                /* Detailed Table View */
                <div className="glass-panel rounded-2xl border border-white/5 overflow-hidden p-2 shadow-2xl">
                    <Table
                        columns={columns}
                        dataSource={filteredEvents}
                        pagination={{ pageSize: 8, showSizeChanger: false }}
                        className="w-full"
                    />
                </div>
            )}
        </div>
    );
};

export default AnnualMacroPage;