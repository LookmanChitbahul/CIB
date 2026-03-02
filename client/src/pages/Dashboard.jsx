import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Table, Spin, Empty, Button, Avatar } from 'antd';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { getDashboardStats } from '../api/client';
import { useTheme } from '../context/ThemeContext';
import {
    ProjectOutlined,
    FileDoneOutlined,
    SyncOutlined,
    FieldTimeOutlined,
    ArrowRightOutlined,
    PlusOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

const Dashboard = () => {
    const navigate = useNavigate();
    const { isDarkMode } = useTheme();
    const { data: stats, isLoading, isError } = useQuery({
        queryKey: ['dashboard'],
        queryFn: async () => {
            const res = await getDashboardStats();
            return res.data;
        }
    });

    if (isLoading) return (
        <div className="flex justify-center items-center h-[70vh]">
            <Spin size="large" tip="Loading statistics...">
                <div style={{ padding: 50 }} />
            </Spin>
        </div>
    );
    if (isError) return <div className="text-center text-red-500 py-20 font-medium">Failed to load dashboard statistics.</div>;

    const isValidStats = stats && typeof stats === 'object' && !Array.isArray(stats);
    if (!isValidStats) return <Empty className="py-20" description="No project data available or API error." />;

    const pieData = stats.projectsByType?.map((item, index) => ({
        name: item.type,
        value: item.count,
        color: COLORS[index % COLORS.length]
    })) || [];

    const barData = stats.projectsOverTime?.map(item => ({
        name: item.date,
        count: item.count
    })) || [];

    const getTypeIcon = (type) => {
        switch (type) {
            case 'NEW': return <PlusOutlined className="text-blue-500" />;
            case 'ONGOING': return <SyncOutlined className="text-amber-500" />;
            case 'COMPLETED': return <FileDoneOutlined className="text-green-500" />;
            default: return <ProjectOutlined />;
        }
    };

    const columns = [
        {
            title: 'Project Name',
            dataIndex: 'projectName',
            key: 'projectName',
            render: (text, record) => (
                <div className="flex items-center gap-3">
                    <Avatar size="small" icon={getTypeIcon(record.type)} className="bg-gray-100 dark:bg-gray-800 border-none" />
                    <span className={`font-bold ${isDarkMode ? 'text-slate-100' : 'text-slate-900'}`}>{text}</span>
                </div>
            )
        },
        {
            title: 'Type',
            dataIndex: 'type',
            key: 'type',
            render: (val) => (
                <span className={`px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest uppercase border ${isDarkMode ? 'border-slate-800 bg-slate-900/50 text-slate-400' : 'border-slate-100 bg-slate-50 text-slate-500'}`}>
                    {val}
                </span>
            )
        },
        {
            title: 'Value',
            dataIndex: 'contractValue',
            key: 'contractValue',
            render: (val) => <span className={`font-bold ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>{val}</span>
        },
        {
            title: 'Timeline',
            dataIndex: 'updatedAt',
            key: 'updatedAt',
            render: (text) => <span className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">{text ? new Date(text).toLocaleDateString() : 'N/A'}</span>
        },
    ];

    const statsItems = [
        { label: 'Active Projects', value: stats?.totalProjects || 0, icon: <ProjectOutlined />, color: 'blue', tag: 'Global' },
        { label: 'Completed', value: stats?.projectsByType?.find(p => p.type === 'COMPLETED')?.count || 0, icon: <FileDoneOutlined />, color: 'green', tag: 'Archived' },
        { label: 'Ongoing', value: stats?.projectsByType?.find(p => p.type === 'ONGOING')?.count || 0, icon: <SyncOutlined />, color: 'amber', tag: 'Current' },
        { label: 'Drafts', value: stats?.totalDrafts || 0, icon: <FieldTimeOutlined />, color: 'purple', tag: 'Local' }
    ];

    return (
        <div className="space-y-12 animate-in fade-in duration-1000">
            {/* Hero Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-gradient-to-r from-blue-600 to-indigo-700 p-12 rounded-[40px] shadow-2xl shadow-blue-500/20 text-white relative overflow-hidden">
                <div className="relative z-10 space-y-4">
                    <h1 className="text-5xl font-black tracking-tight leading-none">Record System <br /> Intelligence</h1>
                    <p className="opacity-80 text-lg font-medium max-w-md">Real-time oversight of project units across the CIB operational matrix.</p>
                </div>
                <div className="relative z-10 flex flex-wrap gap-4">
                    <Button
                        size="large"
                        shape="round"
                        icon={<PlusOutlined />}
                        onClick={() => navigate('/projects/new')}
                        className="h-14 px-8 font-black border-none shadow-xl hover:scale-105 transition-transform"
                    >
                        New Entry
                    </Button>
                    <Button
                        size="large"
                        shape="round"
                        ghost
                        icon={<ArrowRightOutlined />}
                        onClick={() => navigate('/projects')}
                        className="h-14 px-8 font-black border-white/30 hover:bg-white/10"
                    >
                        View Matrix
                    </Button>
                </div>
                <div className="absolute top-[-50%] right-[-10%] w-[500px] h-[500px] bg-white/10 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute bottom-[-20%] left-[20%] w-[300px] h-[300px] bg-blue-400/20 rounded-full blur-3xl pointer-events-none" />
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {statsItems.map((item, idx) => (
                    <div key={idx} className={`glass-card dribbble-shadow p-8 group hover:-translate-y-2 ${isDarkMode ? 'bg-gray-900' : 'bg-white'}`}>
                        <div className="flex items-center justify-between mb-6">
                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl transition-all shadow-inner
                                ${item.color === 'blue' ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600' :
                                    item.color === 'green' ? 'bg-green-50 dark:bg-green-900/20 text-green-600' :
                                        item.color === 'amber' ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-600' :
                                            'bg-purple-50 dark:bg-purple-900/20 text-purple-600'}`}>
                                {item.icon}
                            </div>
                            <span className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">{item.tag}</span>
                        </div>
                        <div className={`text-4xl font-black leading-none mb-2 ${isDarkMode ? 'text-white' : 'text-slate-950'}`}>
                            {item.value}
                        </div>
                        <div className="text-sm text-slate-500 font-bold">{item.label}</div>
                    </div>
                ))}
            </div>

            {/* Visual Intelligence Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                <div className="glass-card dribbble-shadow p-10 flex flex-col h-[550px]">
                    <div className="flex justify-between items-center mb-10">
                        <div>
                            <h3 className={`text-2xl font-black ${isDarkMode ? 'text-white' : 'text-slate-950'}`}>Sector Weights</h3>
                            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Project Distribution</p>
                        </div>
                    </div>
                    <div className="flex-1 min-h-0">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={pieData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={90}
                                    outerRadius={140}
                                    paddingAngle={10}
                                    dataKey="value"
                                    stroke="none"
                                >
                                    {pieData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{
                                        borderRadius: '24px',
                                        border: 'none',
                                        boxShadow: '0 20px 40px -10px rgba(0, 0, 0, 0.1)',
                                        background: isDarkMode ? '#1f2937' : '#ffffff',
                                        padding: '16px 24px',
                                        color: isDarkMode ? '#f8fafb' : '#0f172a'
                                    }}
                                    itemStyle={{ fontSize: '14px', fontWeight: '800', textTransform: 'uppercase' }}
                                />
                                <Legend
                                    verticalAlign="bottom"
                                    iconSize={12}
                                    iconType="circle"
                                    formatter={(value) => <span className="text-slate-500 font-black text-[10px] uppercase tracking-widest ml-3">{value}</span>}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="glass-card dribbble-shadow p-10 flex flex-col h-[550px]">
                    <div className="flex justify-between items-center mb-10">
                        <div>
                            <h3 className={`text-2xl font-black ${isDarkMode ? 'text-white' : 'text-slate-950'}`}>Flow Analysis</h3>
                            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Registration Timeline</p>
                        </div>
                    </div>
                    <div className="flex-1 min-h-0">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={barData} margin={{ top: 20, right: 0, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="0 0" vertical={false} stroke={isDarkMode ? '#1f2937' : '#f1f5f9'} />
                                <XAxis
                                    dataKey="name"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 800, textTransform: 'uppercase' }}
                                    dy={15}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 800 }}
                                />
                                <Tooltip
                                    cursor={{ fill: isDarkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)' }}
                                    contentStyle={{
                                        borderRadius: '24px',
                                        border: 'none',
                                        boxShadow: '0 20px 40px -10px rgba(0, 0, 0, 0.1)',
                                        background: isDarkMode ? '#1f2937' : '#ffffff',
                                        padding: '16px 24px'
                                    }}
                                />
                                <Bar
                                    dataKey="count"
                                    fill={isDarkMode ? '#3b82f6' : '#000000'}
                                    radius={[8, 8, 8, 8]}
                                    barSize={32}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Matrix Pulse Section */}
            <div className={`glass-card dribbble-shadow overflow-hidden ${isDarkMode ? 'bg-gray-900' : 'bg-white'}`}>
                <div className="p-10 flex justify-between items-center border-b border-gray-100 dark:border-gray-800">
                    <div>
                        <h3 className={`text-2xl font-black ${isDarkMode ? 'text-white' : 'text-slate-950'}`}>Operational Log</h3>
                        <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Recent Data Mutations</p>
                    </div>
                    <Button
                        type="text"
                        size="large"
                        className="font-black text-[10px] uppercase tracking-[0.2em] text-blue-600"
                        onClick={() => navigate('/projects')}
                    >
                        Access Matrix <ArrowRightOutlined className="ml-2" />
                    </Button>
                </div>
                <div className="p-6">
                    <Table
                        columns={columns}
                        dataSource={stats.recentProjects?.slice(0, 5) || []}
                        pagination={false}
                        rowKey="id"
                        onRow={(record) => ({
                            onClick: () => navigate(`/projects/${record.id}/edit`),
                            style: { cursor: 'pointer' },
                        })}
                        className="custom-dashboard-table"
                    />
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
