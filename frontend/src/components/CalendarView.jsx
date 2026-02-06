import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon, Clock } from 'lucide-react';

const CalendarView = ({
    boardData,
    onUpdateItem,
    onItemClick,
    statusOptions
}) => {
    const [viewMode, setViewMode] = useState('month'); // 'month' or 'week'
    const [currentDate, setCurrentDate] = useState(new Date(2025, 9, 1)); // Default to Oct 2025 for demo
    const [dragOverDay, setDragOverDay] = useState(null);

    // Helper: Parse 'Aug 28 - Sep 9' format
    const parseTimeline = (timelineStr) => {
        if (!timelineStr || timelineStr === '-') return null;
        const parts = timelineStr.split(' - ');
        const parseDate = (str) => {
            const [mon, day] = str.split(' ');
            const monthMap = { 'Jan': 0, 'Feb': 1, 'Mar': 2, 'Apr': 3, 'May': 4, 'Jun': 5, 'Jul': 6, 'Aug': 7, 'Sep': 8, 'Oct': 9, 'Nov': 10, 'Dec': 11 };
            return new Date(2025, monthMap[mon], parseInt(day));
        };
        const start = parseDate(parts[0]);
        const end = parts.length > 1 ? parseDate(parts[1]) : start;
        return { start, end };
    };

    // Helper: Format date for timeline string
    const formatTimeline = (start, end) => {
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        return `${monthNames[start.getMonth()]} ${start.getDate()} - ${monthNames[end.getMonth()]} ${end.getDate()}`;
    };

    const calendarData = useMemo(() => {
        const items = boardData.groups.flatMap(g => g.items.map(i => ({ ...i, groupId: g.id })));
        return items.map(item => {
            const timeline = parseTimeline(item.timeline);
            return { ...item, parsedTimeline: timeline };
        }).filter(item => item.parsedTimeline);
    }, [boardData]);

    const getDaysInMonth = (date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        const days = [];
        // Pad previous month
        const prevMonthLastDay = new Date(year, month, 0).getDate();
        for (let i = firstDay - 1; i >= 0; i--) {
            days.push({ day: prevMonthLastDay - i, month: month - 1, current: false });
        }
        // Current month
        for (let i = 1; i <= daysInMonth; i++) {
            days.push({ day: i, month: month, current: true });
        }
        // Pad next month
        const remaining = 42 - days.length;
        for (let i = 1; i <= remaining; i++) {
            days.push({ day: i, month: month + 1, current: false });
        }
        return days;
    };

    const days = getDaysInMonth(currentDate);

    const handlePrev = () => {
        const next = new Date(currentDate);
        if (viewMode === 'month') next.setMonth(next.getMonth() - 1);
        else next.setDate(next.getDate() - 7);
        setCurrentDate(next);
    };

    const handleNext = () => {
        const next = new Date(currentDate);
        if (viewMode === 'month') next.setMonth(next.getMonth() + 1);
        else next.setDate(next.getDate() + 7);
        setCurrentDate(next);
    };

    const handleDragStart = (e, item) => {
        e.dataTransfer.setData('itemId', item.id);
        e.dataTransfer.setData('groupId', item.groupId);
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDrop = (e, dayObj) => {
        e.preventDefault();
        setDragOverDay(null);
        const itemId = e.dataTransfer.getData('itemId');
        const groupId = e.dataTransfer.getData('groupId');
        const item = calendarData.find(i => i.id === itemId);
        if (!item) return;

        const originalDuration = item.parsedTimeline.end.getTime() - item.parsedTimeline.start.getTime();
        const newStart = new Date(currentDate.getFullYear(), dayObj.month, dayObj.day);
        const newEnd = new Date(newStart.getTime() + originalDuration);

        onUpdateItem(groupId, itemId, { timeline: formatTimeline(newStart, newEnd) });
    };

    const handleResize = (item, isEnd, increment) => {
        const newStart = new Date(item.parsedTimeline.start);
        const newEnd = new Date(item.parsedTimeline.end);

        if (isEnd) {
            newEnd.setDate(newEnd.getDate() + increment);
            if (newEnd < newStart) newEnd.setTime(newStart.getTime());
        } else {
            newStart.setDate(newStart.getDate() + increment);
            if (newStart > newEnd) newStart.setTime(newEnd.getTime());
        }

        onUpdateItem(item.groupId, item.id, { timeline: formatTimeline(newStart, newEnd) });
    };

    return (
        <div className="calendar-view">
            <div className="calendar-header">
                <div className="calendar-nav">
                    <h2>{currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}</h2>
                    <div className="nav-btns">
                        <button onClick={handlePrev}><ChevronLeft size={20} /></button>
                        <button className="today-btn" onClick={() => setCurrentDate(new Date(2025, 9, 1))}>Today</button>
                        <button onClick={handleNext}><ChevronRight size={20} /></button>
                    </div>
                </div>
                <div className="view-toggle">
                    <button className={viewMode === 'month' ? 'active' : ''} onClick={() => setViewMode('month')}>Month</button>
                    <button className={viewMode === 'week' ? 'active' : ''} onClick={() => setViewMode('week')}>Week</button>
                </div>
            </div>

            <div className="calendar-grid-header">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                    <div key={d} className="weekday-label">{d}</div>
                ))}
            </div>

            <div className={`calendar-grid ${viewMode}`}>
                {days.map((d, i) => (
                    <div
                        key={i}
                        className={`calendar-day ${!d.current ? 'other-month' : ''} ${dragOverDay === i ? 'drag-over' : ''}`}
                        onDragOver={e => { e.preventDefault(); setDragOverDay(i); }}
                        onDragLeave={() => setDragOverDay(null)}
                        onDrop={e => handleDrop(e, d)}
                    >
                        <span className="day-number">{d.day}</span>

                        {/* Task bars in this day */}
                        <div className="day-tasks">
                            {calendarData.filter(item => {
                                const start = item.parsedTimeline.start;
                                const end = item.parsedTimeline.end;
                                const date = new Date(currentDate.getFullYear(), d.month, d.day);
                                return date >= start && date <= end;
                            }).map(item => {
                                const isStart = item.parsedTimeline.start.getDate() === d.day && item.parsedTimeline.start.getMonth() === d.month;
                                const isEnd = item.parsedTimeline.end.getDate() === d.day && item.parsedTimeline.end.getMonth() === d.month;
                                const statusColor = statusOptions.find(o => o.label === item.status)?.color || '#c4c4c4';

                                return (
                                    <div
                                        key={item.id}
                                        draggable
                                        className={`task-bar ${isStart ? 'is-start' : ''} ${isEnd ? 'is-end' : ''}`}
                                        style={{ background: statusColor }}
                                        onDragStart={e => handleDragStart(e, item)}
                                        onClick={() => onItemClick(item)}
                                    >
                                        {isStart && <span className="task-name">{item.name}</span>}
                                        {isStart && (
                                            <div className="resize-handle left">
                                                <div className="resize-btn" onClick={(e) => { e.stopPropagation(); handleResize(item, false, -1); }}>-</div>
                                                <div className="resize-btn" onClick={(e) => { e.stopPropagation(); handleResize(item, false, 1); }}>+</div>
                                            </div>
                                        )}
                                        {isEnd && (
                                            <div className="resize-handle right">
                                                <div className="resize-btn" onClick={(e) => { e.stopPropagation(); handleResize(item, true, -1); }}>-</div>
                                                <div className="resize-btn" onClick={(e) => { e.stopPropagation(); handleResize(item, true, 1); }}>+</div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>

            <style>{`
                .calendar-view {
                    padding: 24px;
                    display: flex;
                    flex-direction: column;
                    height: 100%;
                    background: #fff;
                }
                .calendar-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 24px;
                }
                .calendar-nav { display: flex; align-items: center; gap: 24px; }
                .calendar-nav h2 { margin: 0; font-size: 20px; color: #323338; min-width: 180px; }
                .nav-btns { display: flex; align-items: center; gap: 8px; }
                .nav-btns button { 
                    background: transparent; border: 1px solid #e1e1e1; border-radius: 4px; padding: 4px; color: #676879; cursor: pointer; display: flex; align-items: center;
                }
                .nav-btns button:hover { background: #f5f6f8; }
                .today-btn { font-size: 14px; padding: 4px 12px; font-weight: 500; }

                .view-toggle { background: #f5f6f8; padding: 4px; border-radius: 6px; display: flex; gap: 4px; }
                .view-toggle button {
                    background: transparent; border: none; padding: 6px 16px; border-radius: 4px; font-size: 14px; color: #676879; cursor: pointer; font-weight: 500;
                }
                .view-toggle button.active { background: #fff; color: #0085ff; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }

                .calendar-grid-header { display: grid; grid-template-columns: repeat(7, 1fr); border-bottom: 1px solid #e1e1e1; }
                .weekday-label { padding: 12px; text-align: center; color: #676879; font-size: 13px; font-weight: 600; text-transform: uppercase; }

                .calendar-grid { 
                    display: grid; 
                    grid-template-columns: repeat(7, 1fr); 
                    grid-template-rows: repeat(6, 1fr);
                    flex: 1;
                    border-left: 1px solid #e1e1e1;
                    border-bottom: 1px solid #e1e1e1;
                }
                .calendar-day {
                    border-right: 1px solid #e1e1e1;
                    border-top: 1px solid #e1e1e1;
                    min-height: 120px;
                    padding: 8px;
                    display: flex;
                    flex-direction: column;
                    gap: 4px;
                    background: #fff;
                    transition: background 0.2s;
                }
                .calendar-day:hover { background: #fafbfc; }
                .calendar-day.other-month { background: #f8f9fb; color: #b2b3bd; }
                .calendar-day.drag-over { background: #f0f7ff; box-shadow: inset 0 0 0 2px #0085ff; }
                .day-number { font-size: 13px; font-weight: 500; margin-bottom: 4px; }

                .day-tasks { display: flex; flex-direction: column; gap: 2px; }
                .task-bar {
                    height: 24px;
                    padding: 0 8px;
                    font-size: 11px;
                    color: #fff;
                    display: flex;
                    align-items: center;
                    cursor: grab;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    position: relative;
                    border-radius: 0;
                    margin: 0 -8px; /* Extend to cell edges */
                    z-index: 10;
                    transition: filter 0.2s;
                }
                .task-bar:hover { filter: brightness(1.1); }
                .task-bar:active { cursor: grabbing; }
                .task-bar.is-start { border-top-left-radius: 4px; border-bottom-left-radius: 4px; margin-left: 0; z-index: 11; }
                .task-bar.is-end { border-top-right-radius: 4px; border-bottom-right-radius: 4px; margin-right: 0; }
                .task-name { font-weight: 600; flex: 1; }

                .resize-handle {
                    display: none;
                    position: absolute;
                    top: 0; bottom: 0;
                    background: rgba(0,0,0,0.1);
                    align-items: center;
                    gap: 1px;
                    padding: 0 2px;
                    z-index: 20;
                }
                .task-bar:hover .resize-handle { display: flex; }
                .resize-handle.left { left: 0; }
                .resize-handle.right { right: 0; }
                
                .resize-btn {
                    width: 14px;
                    height: 14px;
                    background: #fff;
                    color: #333;
                    border-radius: 2px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 10px;
                    font-weight: 800;
                    cursor: pointer;
                    opacity: 0.8;
                }
                .resize-btn:hover { opacity: 1; transform: scale(1.1); }

                @media (max-width: 768px) {
                    .calendar-grid { grid-template-columns: repeat(1, 1fr); }
                    .weekday-label { display: none; }
                }
            `}</style>
        </div>
    );
};

export default CalendarView;
