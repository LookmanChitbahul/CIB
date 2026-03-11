import React, { useState } from 'react';
import { Layout, Menu, Button, Avatar, Tooltip } from 'antd';
import {
    DashboardOutlined,
    ProjectOutlined,
    PlusCircleOutlined,
    MenuUnfoldOutlined,
    MenuFoldOutlined,
    SunOutlined,
    MoonOutlined,
    UserOutlined,
    BellOutlined,
    SettingOutlined
} from '@ant-design/icons';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import SimpleChatbot from './SimpleChatbot';

const { Header, Sider, Content } = Layout;

const MainLayout = () => {
    const [collapsed, setCollapsed] = useState(false);
    const { isDarkMode, toggleTheme } = useTheme();

    const navigate = useNavigate();
    const location = useLocation();

    const menuItems = [
        {
            key: '/',
            icon: <DashboardOutlined className="text-xl" />,
            label: 'Overview',
        },
        {
            key: '/projects',
            icon: <ProjectOutlined className="text-xl" />,
            label: 'Project Matrix',
        },
        {
            key: '/projects/new',
            icon: <PlusCircleOutlined className="text-xl" />,
            label: 'Register New',
        },
        {
            key: '/registry',
            icon: <SettingOutlined className="text-xl" />,
            label: 'Registry Admin',
        },
    ];

    const selectedKey = location.pathname;

    return (
        <Layout className="min-h-screen">
            <Sider
                trigger={null}
                collapsible
                collapsed={collapsed}
                width={260}
                className="dribbble-shadow z-30"
                style={{
                    position: 'sticky',
                    top: 0,
                    height: '100vh',
                    margin: '16px',
                    borderRadius: '32px',
                    background: isDarkMode ? '#111827' : '#ffffff'
                }}
            >
                <div className="flex items-center justify-center h-24 mb-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-lg ${isDarkMode ? 'bg-blue-600' : 'bg-black'}`}>
                        {collapsed ? 'C' : 'CIB'}
                    </div>
                </div>

                <Menu
                    theme={isDarkMode ? 'dark' : 'light'}
                    mode="inline"
                    selectedKeys={[selectedKey]}
                    items={menuItems}
                    onClick={({ key }) => navigate(key)}
                    className="border-none px-4"
                />
            </Sider>

            <Layout>
                <Header className={`flex items-center justify-between h-20 px-10 border-b border-slate-200 dark:border-slate-800 ${isDarkMode ? 'bg-gray-950' : 'bg-white'}`}>
                    <div className="flex items-center gap-6">
                        <Button
                            type="text"
                            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                            onClick={() => setCollapsed(!collapsed)}
                            className={`text-xl flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}
                        />
                        <div className={`h-6 w-px ${isDarkMode ? 'bg-gray-800' : 'bg-gray-200'}`} />
                        <h2 className={`font-bold text-lg hidden sm:block ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                            {menuItems.find(item => item.key === selectedKey)?.label || 'Record System'}
                        </h2>
                    </div>

                    <div className="flex items-center gap-4">
                        <Tooltip title="Toggle Theme">
                            <Button
                                type="text"
                                icon={isDarkMode ? <SunOutlined /> : <MoonOutlined />}
                                onClick={toggleTheme}
                                className={`text-xl flex items-center justify-center rounded-2xl w-12 h-12 hover:bg-gray-100 dark:hover:bg-gray-800 ${isDarkMode ? 'text-amber-400' : 'text-slate-600'}`}
                            />
                        </Tooltip>
                        <Button
                            type="text"
                            icon={<BellOutlined />}
                            className={`text-xl flex items-center justify-center rounded-2xl w-12 h-12 hover:bg-gray-100 dark:hover:bg-gray-800 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}
                        />
                    </div>
                </Header>

                <Content className="p-10 overflow-auto">
                    <div className="max-w-[1400px] mx-auto min-h-[calc(100vh-160px)]">
                        <Outlet />
                    </div>
                </Content>
            </Layout>
            <SimpleChatbot />
        </Layout>
    );
};

export default MainLayout;
