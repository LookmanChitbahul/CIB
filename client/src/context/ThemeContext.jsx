import React, { createContext, useContext, useState, useEffect } from 'react';
import { ConfigProvider, theme } from 'antd';

const ThemeContext = createContext();

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }) => {
    const [isDarkMode, setIsDarkMode] = useState(() => {
        const saved = localStorage.getItem('cib_theme');
        return saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches);
    });

    const toggleTheme = () => {
        setIsDarkMode(prev => {
            const newValue = !prev;
            localStorage.setItem('cib_theme', newValue ? 'dark' : 'light');
            return newValue;
        });
    };

    useEffect(() => {
        if (isDarkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [isDarkMode]);

    return (
        <ThemeContext.Provider value={{ isDarkMode, toggleTheme }}>
            <ConfigProvider
                theme={{
                    algorithm: isDarkMode ? theme.darkAlgorithm : theme.defaultAlgorithm,
                    token: {
                        colorPrimary: isDarkMode ? '#3b82f6' : '#000000',
                        colorInfo: '#3b82f6',
                        borderRadius: 16, // Modern, spacious rounding
                        fontFamily: "'Inter', sans-serif",
                        colorText: isDarkMode ? '#f1f5f9' : '#0f172a',
                        colorBgContainer: isDarkMode ? '#111827' : '#ffffff',
                        colorBorder: isDarkMode ? '#374151' : '#e2e8f0',
                    },
                    components: {
                        Layout: {
                            bodyBg: isDarkMode ? '#030712' : '#f9fafb',
                            headerBg: isDarkMode ? '#030712' : '#ffffff',
                            siderBg: isDarkMode ? '#030712' : '#ffffff',
                        },
                        Card: {
                            borderRadiusLG: 24,
                            colorBgContainer: isDarkMode ? '#111827' : '#ffffff',
                        },
                        Button: {
                            borderRadius: 12,
                            fontWeight: 600,
                        },
                        Input: {
                            borderRadius: 12,
                            paddingBlock: 10,
                        },
                        Table: {
                            borderRadius: 20,
                            headerBg: isDarkMode ? '#1f2937' : '#f3f4f6',
                            headerColor: isDarkMode ? '#f9fafb' : '#111827',
                        }
                    }
                }}
            >
                <div className={`min-h-screen transition-all duration-500 font-sans ${isDarkMode ? 'bg-gray-950 text-slate-100' : 'bg-gray-50 text-slate-900'}`}>
                    {children}
                </div>
            </ConfigProvider>
        </ThemeContext.Provider>
    );
};
