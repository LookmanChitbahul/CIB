import React, { useState, useRef, useEffect } from 'react';
import { FloatButton, Drawer, Input, List, Typography, Spin, Avatar } from 'antd';
import { WechatOutlined, SendOutlined, RobotOutlined, UserOutlined } from '@ant-design/icons';
import apiClient from '../api/client';
import { useTheme } from '../context/ThemeContext';

const { Text } = Typography;

const SimpleChatbot = () => {
    const { isDarkMode } = useTheme();
    const [open, setOpen] = useState(false);
    const [messages, setMessages] = useState([
        { text: 'Hello! I am your CIB AI Assistant powered by Gemini 3.0 Flash. How can I assist you with project management today?', sender: 'bot' }
    ]);
    const [inputValue, setInputValue] = useState('');
    const [loading, setLoading] = useState(false);
    const scrollRef = useRef(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, loading]);

    const handleSend = async () => {
        if (!inputValue.trim() || loading) return;

        const userMessage = { text: inputValue, sender: 'user' };
        setMessages(prev => [...prev, userMessage]);
        const currentInput = inputValue;
        setInputValue('');
        setLoading(true);

        try {
            // Prepare history for context
            const history = messages.slice(-10).map(m => ({
                role: m.sender === 'user' ? 'user' : 'model',
                parts: [{ text: m.text }]
            }));

            const response = await apiClient.post('/projects/chat', {
                message: currentInput,
                history
            });

            const botResponse = response.data.text;
            setMessages(prev => [...prev, { text: botResponse, sender: 'bot' }]);
        } catch (error) {
            console.error("Chat Error:", error);
            setMessages(prev => [...prev, {
                text: "My apologies, I'm experiencing a technical hiccup. Please ensure the server is running and the Gemini API key is valid.",
                sender: 'bot'
            }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <FloatButton
                icon={<WechatOutlined />}
                type="primary"
                style={{ right: 24, bottom: 24 }}
                onClick={() => setOpen(true)}
                tooltip="AI Assistant"
                className="shadow-lg hover:scale-110 transition-transform"
            />
            <Drawer
                title={
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                            <RobotOutlined className="text-primary" />
                        </div>
                        <div>
                            <div className="font-bold text-base leading-tight">CIB AI Assistant</div>
                            <div className="text-xs text-green-500 font-medium">Online • Gemini 2.0 Flash</div>
                        </div>
                    </div>
                }
                placement="right"
                onClose={() => setOpen(false)}
                open={open}
                width={400}
                className="chatbot-drawer"
                styles={{
                    body: { padding: 0, display: 'flex', flexDirection: 'column' },
                    header: { borderBottom: isDarkMode ? '1px solid #27272a' : '1px solid #f1f5f9' }
                }}
            >
                <div
                    ref={scrollRef}
                    className="flex-1 overflow-y-auto p-4 space-y-6 bg-slate-50/50 dark:bg-zinc-950/50"
                >
                    {messages.map((msg, idx) => (
                        <div
                            key={idx}
                            className={`flex gap-3 ${msg.sender === 'user' ? 'flex-row-reverse' : ''} animate-in slide-in-from-bottom-2 duration-300`}
                        >
                            <Avatar
                                icon={msg.sender === 'user' ? <UserOutlined /> : <RobotOutlined />}
                                className={msg.sender === 'user' ? 'bg-zinc-800' : 'bg-primary'}
                                size="small"
                            />
                            <div className={`flex flex-col max-w-[80%] ${msg.sender === 'user' ? 'items-end' : ''}`}>
                                <div
                                    className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed shadow-sm ${msg.sender === 'user'
                                        ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-tr-none'
                                        : 'bg-white dark:bg-zinc-800 text-slate-800 dark:text-zinc-100 border border-slate-100 dark:border-zinc-700/50 rounded-tl-none'
                                        }`}
                                >
                                    {msg.text}
                                </div>
                                <span className="text-[10px] text-slate-400 mt-1 uppercase tracking-tighter">
                                    {msg.sender === 'user' ? 'You' : 'Assistant'}
                                </span>
                            </div>
                        </div>
                    ))}
                    {loading && (
                        <div className="flex gap-3 animate-pulse">
                            <Avatar icon={<RobotOutlined />} className="bg-primary" size="small" />
                            <div className="bg-white dark:bg-zinc-800 px-4 py-3 rounded-2xl rounded-tl-none border border-slate-100 dark:border-zinc-700/50">
                                <Spin size="small" />
                            </div>
                        </div>
                    )}
                </div>
                <div className="p-4 border-t border-slate-100 dark:border-zinc-800 bg-white dark:bg-zinc-900">
                    <Input.Search
                        placeholder="Type your question..."
                        enterButton={<SendOutlined />}
                        size="large"
                        value={inputValue}
                        onChange={e => setInputValue(e.target.value)}
                        onSearch={handleSend}
                        disabled={loading}
                        className="custom-search-input shadow-sm"
                    />
                    <p className="text-[10px] text-center text-slate-400 mt-3 uppercase tracking-widest">
                        Powered by Google Gemini 2.0 Flash
                    </p>
                </div>
            </Drawer>
        </>
    );
};

export default SimpleChatbot;
