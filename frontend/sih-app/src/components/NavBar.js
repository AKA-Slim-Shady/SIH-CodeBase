import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { colors, spacing, typography } from "../theme/theme";
import { getNotifications, markNotificationAsRead } from '../api/notifications';
import { io } from "socket.io-client";

// Connect to the socket server
const socket = io("http://localhost:5000");

export default function NavBar({ user, onLogout }) {
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState([]);
    const [showNotifications, setShowNotifications] = useState(false);
    const notificationsRef = useRef(null); // Ref for the notifications dropdown

    // Calculate if there are any unread notifications
    const hasUnread = notifications.some(n => !n.isRead);

    // Effect to fetch initial notifications and set up socket listeners
    useEffect(() => {
        // --- UPGRADE: Only run notification logic for non-admin users ---
        if (user && !user.isAdmin) {
            socket.emit('join_room', user.id);

            const fetchNotifications = async () => {
                try {
                    const data = await getNotifications();
                    setNotifications(data);
                } catch (error) {
                    console.error("Failed to fetch notifications:", error);
                }
            };
            fetchNotifications();

            const handleNewNotification = (newNotification) => {
                setNotifications(prev => [newNotification, ...prev]);
            };
            socket.on('new_notification', handleNewNotification);
            
            // Cleanup function to run when the component unmounts or user logs out
            return () => {
                socket.off('new_notification', handleNewNotification);
            };
        } else {
            // If user logs out or is an admin, clear notifications
            setNotifications([]);
        }
    }, [user]);

    // Effect to handle clicking outside the dropdown to close it
    useEffect(() => {
        function handleClickOutside(event) {
            if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
                setShowNotifications(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [notificationsRef]);


    // Handles clicking on a single notification
    const handleNotificationClick = async (notification) => {
        if (!notification.isRead) {
            try {
                await markNotificationAsRead(notification.id);
                setNotifications(prev => 
                    prev.map(n => n.id === notification.id ? { ...n, isRead: true } : n)
                );
            } catch (error) {
                console.error("Failed to mark as read:", error);
            }
        }
        
        if (notification.link) {
            navigate(notification.link);
        }
        
        setShowNotifications(false); // Close the dropdown
    };

    return (
        <header style={{ ...headerStyle }}>
            <Link to="/" style={{ textDecoration: 'none' }}>
                <h1 style={{ color: colors.primary, fontFamily: typography.font, margin: 0 }}>CivicWatch</h1>
            </Link>
            <nav style={{ ...navStyle }}>
                {!user ? (
                    <>
                        <Link to="/signin" style={{ ...linkStyle }}>Sign In</Link>
                        <Link to="/signup" style={{ ...linkStyle, color: colors.secondary }}>Sign Up</Link>
                    </>
                ) : (
                    <>
                        <Link to="/report" style={{ ...linkStyle }}>Report</Link>
                        <Link to="/user" style={{ ...linkStyle }}>User</Link>
                        {user.isAdmin && (
                            <Link to="/dashboard" style={{ ...linkStyle }}>Admin Dashboard</Link>
                        )}
                        
                        {/* --- UPGRADE: Conditionally render the entire notification feature --- */}
                        { !user.isAdmin && (
                            <div style={{ position: 'relative' }} ref={notificationsRef}>
                                <button onClick={() => setShowNotifications(!showNotifications)} style={{ ...iconButtonStyle }}>
                                    🔔
                                    {hasUnread && <span style={{ ...unreadIndicatorStyle }}></span>}
                                </button>
                                {showNotifications && (
                                    <div style={{ ...notificationsDropdownStyle }}>
                                        {notifications.length > 0 ? (
                                            notifications.map(n => (
                                                <div
                                                    key={n.id}
                                                    onClick={() => handleNotificationClick(n)}
                                                    style={{ ...notificationItemStyle, fontWeight: n.isRead ? 'normal' : 'bold' }}
                                                >
                                                    {n.message}
                                                </div>
                                            ))
                                        ) : (
                                            <div style={{ padding: '10px', textAlign: 'center' }}>No new notifications</div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}
                        {/* --- END: Conditional Rendering --- */}

                        <button onClick={onLogout} style={{ ...logoutButtonStyle }}>
                            Logout
                        </button>
                    </>
                )}
            </nav>
        </header>
    );
}

// --- Styles ---
const headerStyle = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: `0 ${spacing.m}`,
    height: '60px',
    background: "#fff",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
    position: "sticky",
    top: 0,
    zIndex: 1000,
};

const navStyle = {
    display: "flex",
    alignItems: 'center',
    gap: spacing.m
};

const linkStyle = {
    textDecoration: "none",
    color: colors.primary,
    fontWeight: 600
};

const logoutButtonStyle = {
    background: "none",
    border: "none",
    color: colors.secondary,
    fontWeight: 600,
    cursor: "pointer",
    fontSize: '1em'
};

const iconButtonStyle = {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontSize: '1.5rem',
    position: 'relative',
    padding: '0 8px'
};

const unreadIndicatorStyle = {
    position: 'absolute',
    top: '4px',
    right: '6px',
    width: '10px',
    height: '10px',
    background: 'red',
    borderRadius: '50%',
    border: '2px solid white'
};

const notificationsDropdownStyle = {
    position: 'absolute',
    top: '45px',
    right: 0,
    width: '300px',
    maxHeight: '400px',
    overflowY: 'auto',
    background: 'white',
    borderRadius: '8px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
    border: '1px solid #eee',
};

const notificationItemStyle = {
    padding: '12px',
    borderBottom: '1px solid #f0f0f0',
    cursor: 'pointer',
    fontSize: '0.9rem',
    lineHeight: '1.4',
};

