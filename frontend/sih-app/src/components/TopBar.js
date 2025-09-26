import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { getNotifications, markNotificationAsRead } from '../api/notifications';
import { io } from "socket.io-client";
import { IoNotifications, IoLogOut } from 'react-icons/io5';

const socket = io("http://localhost:5000");

export default function TopBar({ user, onLogout }) {
    const [notifications, setNotifications] = useState([]);
    const [showNotifications, setShowNotifications] = useState(false);
    const notificationsRef = useRef(null); 

    const hasUnread = notifications.some(n => !n.isRead);

    useEffect(() => {
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
            
            return () => {
                socket.off('new_notification', handleNewNotification);
            };
        } else {
            setNotifications([]);
        }
    }, [user]);

    useEffect(() => {
        function handleClickOutside(event) {
            if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
                setShowNotifications(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [notificationsRef]);


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
        // You might want to navigate to a specific link here if your notifications have one
        setShowNotifications(false);
    };

    return (
        <header className="top-bar">
            <Link to="/" className="top-bar-title-link">
                <h1 className="top-bar-title">CivicWatch</h1>
            </Link>
            <nav className="top-bar-nav">
                {user && (
                    <>
                        { !user.isAdmin && (
                            <div className="notifications-container" ref={notificationsRef}>
                                <button onClick={() => setShowNotifications(!showNotifications)} className="icon-button">
                                    <IoNotifications size={24} />
                                    {hasUnread && <span className="unread-indicator"></span>}
                                </button>
                                {showNotifications && (
                                    <div className="notifications-dropdown">
                                        {notifications.length > 0 ? (
                                            notifications.map(n => (
                                                <div
                                                    key={n.id}
                                                    onClick={() => handleNotificationClick(n)}
                                                    className={`notification-item ${!n.isRead ? 'unread' : ''}`}
                                                >
                                                    {n.message}
                                                </div>
                                            ))
                                        ) : (
                                            <div className="notification-item">No new notifications</div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}
                        <button onClick={onLogout} className="icon-button logout-button">
                            <IoLogOut size={24} />
                        </button>
                    </>
                )}
            </nav>
        </header>
    );
}