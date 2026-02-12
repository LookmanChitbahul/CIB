import React, { createContext, useContext } from 'react';
import { ConfigProvider, theme } from 'antd';

const ThemeContext = createContext();

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }) => {
    // Strictly enforcing Light Mode
    const isDarkMode = false;
    const toggleTheme = () => { }; // No-op

    return (
        <ThemeContext.Provider value={{ isDarkMode, toggleTheme }}>
            <ConfigProvider
                theme={{
                    algorithm: theme.defaultAlgorithm,
                    token: {
                        colorPrimary: '#000000', // Black primary for very strict professional look, or keep blue? User said "black text". Let's keep blue primary for actions but text is black.
                        colorText: '#000000',
                        colorBgContainer: '#ffffff',
                        borderRadius: 6,
                        fontSize: 14,
                    },
                    components: {
                        Table: {
                            headerBg: '#f8fafc',
                            headerColor: '#000000', // Black header text
                            headerSplitColor: '#e2e8f0',
                            colorText: '#000000',
                            borderColor: '#e2e8f0',
                        },
                        Layout: {
                            bodyBg: '#ffffff',
                            headerBg: '#ffffff',
                            siderBg: '#ffffff',
                        },
                        Card: {
                            colorBgContainer: '#ffffff',
                            colorBorderSecondary: '#e2e8f0',
                        },
                        Input: {
                            colorBgContainer: '#ffffff',
                            colorBorder: '#cbd5e1',
                            colorText: '#000000',
                            colorTextPlaceholder: '#94a3b8',
                        },
                        Select: {
                            colorBgContainer: '#ffffff',
                            colorBorder: '#cbd5e1',
                            colorText: '#000000',
                            optionSelectedColor: '#000000',
                        }
                    }
                }}
            >
                <div className="min-h-screen bg-white text-black font-sans">
                    {children}
                </div>
            </ConfigProvider>
        </ThemeContext.Provider>
    );
};
