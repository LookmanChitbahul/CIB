import React, { useState } from 'react';
import { Layout, Menu, Button, theme } from 'antd';
import {
    DesktopOutlined,
    ProjectOutlined,
    PlusCircleOutlined,
    MenuUnfoldOutlined,
    MenuFoldOutlined,
} from '@ant-design/icons';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import SimpleChatbot from './SimpleChatbot';

const { Header, Sider, Content } = Layout;

const MainLayout = () => {
    const [collapsed, setCollapsed] = useState(false);

    // We strictly assume light mode now
    const {
        token: { colorBgContainer },
    } = theme.useToken();

    const navigate = useNavigate();
    const location = useLocation();

    const handleMenuClick = ({ key }) => {
        navigate(key);
    };

    const menuItems = [
        {
            key: '/',
            icon: <DesktopOutlined />,
            label: 'Dashboard',
        },
        {
            key: '/projects',
            icon: <ProjectOutlined />,
            label: 'Projects',
        },
        {
            key: '/projects/new',
            icon: <PlusCircleOutlined />,
            label: 'Add Project',
        },
    ];

    const selectedKey = location.pathname === '/' ? '/' :
        location.pathname.startsWith('/projects/new') ? '/projects/new' :
            location.pathname.startsWith('/projects') ? '/projects' : '/';

    return (
        <Layout className="min-h-screen">
            <Sider
                trigger={null}
                collapsible
                collapsed={collapsed}
                width={260}
                className="shadow-xl"
                style={{ background: '#ffffff' }}
            >
                <div className="flex items-center justify-center h-16 transition-all duration-300 bg-white border-b border-gray-200">
                    <span className="font-bold text-xl tracking-wider text-black">
                        {collapsed ? 'CIB' : 'CIB PROJECT'}
                    </span>
                </div>
                <Menu
                    theme="light"
                    mode="inline"
                    selectedKeys={[selectedKey]}
                    items={menuItems}
                    onClick={handleMenuClick}
                    className="border-none mt-4"
                    style={{ background: 'transparent' }}
                />
            </Sider>
            <Layout className="transition-all duration-300">
                <Header
                    className="flex items-center justify-between px-6 shadow-sm z-10 transition-colors duration-300"
                    style={{ background: '#ffffff' }}
                >
                    <Button
                        type="text"
                        icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                        onClick={() => setCollapsed(!collapsed)}
                        className="text-lg w-10 h-10 flex items-center justify-center hover:bg-gray-100 text-black"
                    />
                    {/* Theme switcher removed as requested */}
                </Header>
                <Content className="p-6 overflow-auto" style={{ background: '#f8fafc' }}>
                    <div
                        className="p-8 min-h-[280px] rounded-xl shadow-sm transition-all duration-300 border border-gray-200"
                        style={{ background: '#ffffff' }}
                    >
                        <Outlet />
                    </div>
                </Content>
                <SimpleChatbot />
            </Layout>
        </Layout>
    );
};

export default MainLayout;
