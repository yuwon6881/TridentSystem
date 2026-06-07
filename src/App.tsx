import {useState, useEffect} from "react";
import Header from "./components/Header.tsx";
import {Routes, Route} from "react-router-dom"
import AnnualMacroPage from "./pages/AnnualMacroPage.tsx";

declare global {
    interface Window {
        google?: {
            accounts: {
                oauth2: {
                    initTokenClient: (config: {
                        client_id: string;
                        scope: string;
                        callback: (tokenResponse: { access_token: string }) => void;
                    }) => TokenClient;
                };
            };
        };
    }
}

type TokenClient = {
    requestAccessToken: () => void;
    revokeToken: () => void;
}

export type EventDataSource = {
    key: number;
    Month: string;
    EventName: string;
    StartDate: string;
    EndDate: string;
    rawStartDate: number;
    isAllDay: boolean;
}

export type CalendarItem = {
    id: string;
    summary: string;
    primary?: boolean;
}

type EventTime = {
    dateTime?: string;
    date?: string;
}

type Event = {
    summary: string;
    start: EventTime;
    end: EventTime;
}

// Helper to safely parse date/datetime from Google Calendar event
const parseEventDate = (eventTime: EventTime | undefined): Date | null => {
    if (!eventTime) return null;
    if (eventTime.dateTime) {
        const date = new Date(eventTime.dateTime);
        return isNaN(date.getTime()) ? null : date;
    }
    if (eventTime.date) {
        // Parse "YYYY-MM-DD" as local time to prevent timezone shift issues
        const parts = eventTime.date.split('-');
        if (parts.length === 3) {
            const year = parseInt(parts[0], 10);
            const month = parseInt(parts[1], 10) - 1; // 0-indexed in JS
            const day = parseInt(parts[2], 10);
            const date = new Date(year, month, day);
            return isNaN(date.getTime()) ? null : date;
        }
        const date = new Date(eventTime.date);
        return isNaN(date.getTime()) ? null : date;
    }
    return null;
};

// Formats a Google Calendar start/end date safely
const formatEventDateTime = (eventTime: EventTime | undefined): string => {
    const date = parseEventDate(eventTime);
    if (!date) return "Invalid Date";
    
    // If all-day event
    if (eventTime?.date && !eventTime.dateTime) {
        return date.toLocaleDateString('en-GB', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        }) + " (All Day)";
    }
    
    // Timed event
    return date.toLocaleString('en-GB', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        hour12: true
    });
};

function App() {
    const [dataSource, setDataSource] = useState<EventDataSource[]>([]);
    const [calendarList, setCalendarList] = useState<CalendarItem[]>([]);
    const [selectedCalendarId, setSelectedCalendarId] = useState<string | null>(null);
    const [tokenClient, setTokenClient] = useState<TokenClient | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isConnected, setIsConnected] = useState(false);
    const [lastSynced, setLastSynced] = useState<string | null>(null);

    const handleSyncClick = () => {
        if (tokenClient) {
            setIsLoading(true);
            tokenClient.requestAccessToken();
        } else {
            console.error("Google Identity Services script not loaded yet");
        }
    };

    const handleDisconnect = () => {
        sessionStorage.removeItem('accessToken');
        sessionStorage.removeItem('selectedCalendarId');
        setDataSource([]);
        setCalendarList([]);
        setSelectedCalendarId(null);
        setIsConnected(false);
        setLastSynced(null);
    };

    // Fetch lists of calendars
    const fetchCalendarList = (accessToken: string, targetCalId?: string | null) => {
        setIsLoading(true);
        fetch('https://www.googleapis.com/calendar/v3/users/me/calendarList', {
            headers: {'Authorization': `Bearer ${accessToken}`}
        })
            .then((res) => {
                if (!res.ok) {
                    throw new Error("Failed to fetch calendar list");
                }
                return res.json();
            })
            .then((data) => {
                const items: CalendarItem[] = (data.items || []).filter(
                    (item: CalendarItem) => !item.primary && item.id !== 'primary'
                );
                setCalendarList(items);
                setIsConnected(true);

                const savedCalId = targetCalId || sessionStorage.getItem('selectedCalendarId');
                
                if (savedCalId && items.some(item => item.id === savedCalId)) {
                    setSelectedCalendarId(savedCalId);
                    fetchCalendarEvents(accessToken, savedCalId);
                } else if (items.length > 0) {
                    setIsLoading(false);
                } else {
                    setIsLoading(false);
                }
            })
            .catch((err) => {
                console.error(err);
                setIsLoading(false);
                handleDisconnect();
            });
    };

    // Fetch events of a specific calendar
    const fetchCalendarEvents = (accessToken: string, calendarId: string) => {
        setIsLoading(true);
        const currentYear = new Date().getFullYear();
        const timeMin = encodeURIComponent(`${currentYear}-01-01T00:00:00Z`);
        const timeMax = encodeURIComponent(`${currentYear}-12-31T23:59:59Z`);
        
        fetch(`https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events?singleEvents=true&timeMin=${timeMin}&timeMax=${timeMax}&maxResults=2500&orderBy=startTime`, {
            headers: {'Authorization': `Bearer ${accessToken}`}
        })
            .then((res) => {
                if (!res.ok) {
                    throw new Error("Failed to fetch calendar events");
                }
                return res.json();
            })
            .then((data) => {
                const events: Event[] = data.items || [];
                const eventMappedToDataSource = events
                    .map((event, index) => {
                        const startDate = parseEventDate(event.start);
                        const endDate = parseEventDate(event.end);
                        
                        if (!startDate || !endDate) return null;
                        if (startDate.getFullYear() !== currentYear) return null;

                        return {
                            key: index,
                            Month: startDate.toLocaleString('en-GB', {month: 'long'}),
                            EventName: event.summary || 'Untitled Event',
                            StartDate: formatEventDateTime(event.start),
                            EndDate: formatEventDateTime(event.end),
                            rawStartDate: startDate.getTime(),
                            isAllDay: !!(event.start?.date && !event.start?.dateTime),
                        };
                    })
                    .filter((item): item is NonNullable<typeof item> => item !== null)
                    .sort((a, b) => a.rawStartDate - b.rawStartDate);

                setDataSource(eventMappedToDataSource);
                setLastSynced(new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
                setIsLoading(false);
            })
            .catch((err) => {
                console.error(err);
                setIsLoading(false);
            });
    };

    const handleSelectCalendar = (calendarId: string) => {
        setSelectedCalendarId(calendarId);
        sessionStorage.setItem('selectedCalendarId', calendarId);
        const token = sessionStorage.getItem('accessToken');
        if (token) {
            fetchCalendarEvents(token, calendarId);
        }
    };

    useEffect(() => {
        const token = sessionStorage.getItem('accessToken');
        if (token != null) {
            fetchCalendarList(token);
        }
        const initializeGsi = () => {
            if (window.google) {
                const client = window.google.accounts.oauth2.initTokenClient({
                    client_id: '479595412867-u880gdoi5mnr6ii8uhtlqablkh4q0t98.apps.googleusercontent.com',
                    scope: 'https://www.googleapis.com/auth/calendar.readonly',
                    callback: (tokenResponse: { access_token: string }) => {
                        if (tokenResponse && tokenResponse.access_token) {
                            sessionStorage.setItem('accessToken', tokenResponse.access_token);
                            fetchCalendarList(tokenResponse.access_token);
                        } else {
                            setIsLoading(false);
                        }
                    },
                });
                setTokenClient(client);
            }
        };

        if (window.google) {
            initializeGsi();
        } else {
            const interval = setInterval(() => {
                if (window.google) {
                    initializeGsi();
                    clearInterval(interval);
                }
            }, 100);
            return () => clearInterval(interval);
        }
    }, []);

    return (
        <div className="min-h-screen w-screen flex flex-col bg-[#030712] relative overflow-x-hidden text-gray-200">
            {/* Glowing ambient backgrounds */}
            <div className="glow-bg-blue" />
            <div className="glow-bg-indigo" />

            <Header 
                isConnected={isConnected} 
                lastSynced={lastSynced} 
                isLoading={isLoading} 
                onSyncClick={handleSyncClick} 
                onDisconnect={handleDisconnect}
            />

            <main className="flex-1 w-full max-w-7xl mx-auto px-4 py-8 md:py-12 z-10 relative">
                <Routes>
                    <Route 
                        path="/" 
                        index 
                        element={
                            <AnnualMacroPage 
                                dataSource={dataSource} 
                                calendarList={calendarList}
                                selectedCalendarId={selectedCalendarId}
                                handleSelectCalendar={handleSelectCalendar}
                                isLoading={isLoading} 
                                isConnected={isConnected}
                                handleSyncClick={handleSyncClick}
                            />
                        }
                    />
                </Routes>
            </main>
        </div>
    )
}

export default App;
