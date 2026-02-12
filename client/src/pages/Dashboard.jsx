import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Row, Col, Statistic, Table, Spin, Empty, Button, Tooltip as AntTooltip } from 'antd';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { getDashboardStats } from '../api/client';
import {
    ProjectOutlined,
    FileDoneOutlined,
    FieldTimeOutlined,
    ArrowRightOutlined,
    ClockCircleOutlined,
    CheckCircleOutlined,
    SyncOutlined,
    PauseCircleOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const COLORS = ['#1677ff', '#52c41a', '#faad14', '#f5222d'];

const Dashboard = () => {
    const navigate = useNavigate();
    const { data: stats, isLoading, isError } = useQuery({
        queryKey: ['dashboard'],
        queryFn: async () => {
            const res = await getDashboardStats();
            return res.data;
        }
    });

    if (isLoading) return <div className="flex justify-center items-center h-[70vh]"><Spin size="large" tip="Loading statistics..." /></div>;
    if (isError) return <div className="text-center text-red-500 py-20 font-medium">Failed to load dashboard statistics.</div>;

    // Check if stats has the expected structure to avoid crashes
    const isValidStats = stats && typeof stats === 'object' && !Array.isArray(stats);
    if (!isValidStats) return <Empty className="py-20" description="No project data available or API error." />;

    const pieData = (stats.projectsByType || []).map(item => ({ name: item.type, value: item.count }));
    const barData = (stats.projectsOverTime || []).map(item => ({ name: item.date, count: item.count }));

    const getTypeIcon = (type) => {
        switch (type) {
            case 'NEW': return <SyncOutlined className="text-blue-500" />;
            case 'ONGOING': return <ClockCircleOutlined className="text-green-500" />;
            case 'ON_HOLD': return <PauseCircleOutlined className="text-amber-500" />;
            case 'COMPLETED': return <CheckCircleOutlined className="text-purple-500" />;
            default: return null;
        }
    };

    const recentColumns = [
        {
            title: 'Project Name',
            dataIndex: 'projectName',
            key: 'projectName',
            className: 'font-semibold text-slate-900',
        },
        {
            title: 'Type',
            dataIndex: 'type',
            key: 'type',
            render: (val) => (
                <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium border border-slate-200 bg-slate-50">
                    {getTypeIcon(val)} {val}
                </span>
            )
        },
        {
            title: 'Value',
            dataIndex: 'contractValue',
            key: 'contractValue',
            className: 'text-slate-500',
        },
        {
            title: 'Last Updated',
            dataIndex: 'updatedAt',
            key: 'updatedAt',
            render: (text) => <span className="text-slate-400 text-xs">{new Date(text).toLocaleDateString()}</span>
        },
    ];

    return (
        <div className="space-y-8 p-2 animate-in fade-in duration-700">
            {/* Header section - Clean & Minimal */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-1">
                    <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Project Dashboard</h1>
                    <p className="text-slate-500 font-medium">System Overview: {stats.totalProjects} active projects.</p>
                </div>
                {/* Drafts Notification - Refined */}
                {stats.totalDrafts > 0 && (
                    <div className="bg-white border border-amber-200 shadow-sm px-4 py-2 rounded-full flex items-center gap-3 animate-pulse-slow">
                        <SyncOutlined spin className="text-amber-500" />
                        <span className="text-amber-700 font-semibold text-sm">
                            {stats.totalDrafts} {stats.totalDrafts === 1 ? 'Draft' : 'Drafts'} Pending Review
                        </span>
                    </div>
                )}
            </div>

            {/* Stats Cards - Modern, Bordered, Clean White */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all group">
                    <div className="flex items-center gap-4 mb-3">
                        <div className="w-10 h-10 rounded-lg bg-blue-50 group-hover:bg-blue-100 transition-colors flex items-center justify-center text-blue-600">
                            <ProjectOutlined className="text-lg" />
                        </div>
                        <span className="text-slate-400 text-xs font-bold uppercase tracking-widest">Active Projects</span>
                    </div>
                    <div className="text-3xl font-black text-slate-900 leading-none mb-1">
                        {stats.totalProjects}
                    </div>
                    <div className="text-[10px] text-slate-400 font-medium">PRODUCTION</div>
                </div>

                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all group">
                    <div className="flex items-center gap-4 mb-3">
                        <div className="w-10 h-10 rounded-lg bg-green-50 group-hover:bg-green-100 transition-colors flex items-center justify-center text-green-600">
                            <FileDoneOutlined className="text-lg" />
                        </div>
                        <span className="text-slate-400 text-xs font-bold uppercase tracking-widest">Completed</span>
                    </div>
                    <div className="text-3xl font-black text-slate-900 leading-none mb-1">
                        {stats.projectsByType.find(p => p.type === 'COMPLETED')?.count || 0}
                    </div>
                    <div className="text-[10px] text-slate-400 font-medium">ARCHIVED</div>
                </div>

                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all group">
                    <div className="flex items-center gap-4 mb-3">
                        <div className="w-10 h-10 rounded-lg bg-amber-50 group-hover:bg-amber-100 transition-colors flex items-center justify-center text-amber-600">
                            <SyncOutlined className="text-lg" />
                        </div>
                        <span className="text-slate-400 text-xs font-bold uppercase tracking-widest">Ongoing</span>
                    </div>
                    <div className="text-3xl font-black text-slate-900 leading-none mb-1">
                        {stats.projectsByType.find(p => p.type === 'ONGOING')?.count || 0}
                    </div>
                    <div className="text-[10px] text-slate-400 font-medium">IN PROGRESS</div>
                </div>

                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all group">
                    <div className="flex items-center gap-4 mb-3">
                        <div className="w-10 h-10 rounded-lg bg-purple-50 group-hover:bg-purple-100 transition-colors flex items-center justify-center text-purple-600">
                            <FieldTimeOutlined className="text-lg" />
                        </div>
                        <span className="text-slate-400 text-xs font-bold uppercase tracking-widest">Drafts</span>
                    </div>
                    <div className="text-3xl font-black text-slate-900 leading-none mb-1">
                        {stats.totalDrafts}
                    </div>
                    <div className="text-[10px] text-slate-400 font-medium">LOCAL SAVES</div>
                </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Pie Chart Card */}
                <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[450px]">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-bold text-slate-900">Project Type Distribution</h3>
                        <div className="flex gap-2">
                            {COLORS.map((color, idx) => (
                                <div key={idx} className="w-2.5 h-2.5 rounded-full" style={{ background: color }}></div>
                            ))}
                        </div>
                    </div>
                    <div className="flex-1 min-h-0">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={pieData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={80}
                                    outerRadius={120}
                                    paddingAngle={8}
                                    dataKey="value"
                                    stroke="none"
                                >
                                    {pieData.map((entry, index) => (
                                        <Cell
                                            key={`cell-${index}`}
                                            fill={COLORS[index % COLORS.length]}
                                            className="focus:outline-none transition-opacity hover:opacity-80"
                                        />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{
                                        borderRadius: '12px',
                                        border: '1px solid #e2e8f0',
                                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                                        background: '#ffffff',
                                        padding: '12px 16px',
                                        color: '#0f172a'
                                    }}
                                    itemStyle={{ color: '#0f172a', fontSize: '14px', fontWeight: '600' }}
                                />
                                <Legend
                                    verticalAlign="bottom"
                                    height={36}
                                    iconType="circle"
                                    formatter={(value) => <span className="text-slate-500 font-semibold text-xs ml-2">{value}</span>}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Timeline Chart Card */}
                <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[450px]">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-bold text-slate-900">Registration Timeline</h3>
                        <div className="text-xs text-slate-400 font-bold uppercase tracking-wider">Historical Data</div>
                    </div>
                    <div className="flex-1 min-h-0">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                data={barData}
                                margin={{ top: 20, right: 30, left: -20, bottom: 0 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke='#f1f5f9' />
                                <XAxis
                                    dataKey="name"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 600 }}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 600 }}
                                />
                                <Tooltip
                                    cursor={{ fill: 'rgba(0,0,0,0.02)' }}
                                    contentStyle={{
                                        borderRadius: '12px',
                                        border: '1px solid #e2e8f0',
                                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                                        background: '#ffffff',
                                        padding: '12px 16px'
                                    }}
                                />
                                <Bar
                                    dataKey="count"
                                    fill="#1677ff"
                                    radius={[4, 4, 0, 0]}
                                    barSize={40}
                                    name="Started Projects"
                                    className="transition-all hover:brightness-110"
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Recent Activity Section */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-8 flex justify-between items-center border-b border-slate-50">
                    <div>
                        <h3 className="text-xl font-bold text-slate-900">Recent Project Updates</h3>
                        <p className="text-slate-400 text-xs mt-1">Latest changes in the project ecosystem.</p>
                    </div>
                    <Button
                        type="primary"
                        icon={<ArrowRightOutlined />}
                        onClick={() => navigate('/projects')}
                        className="bg-primary hover:bg-primary-hover border-none rounded-xl h-10 px-6 font-bold flex items-center shadow-lg shadow-blue-500/20"
                    >
                        View All Projects
                    </Button>
                </div>
                <div className="recent-table-container">
                    <Table
                        dataSource={stats.recentProjects}
                        columns={recentColumns}
                        pagination={false}
                        rowKey="id"
                        size="large"
                        className="custom-dashboard-table"
                    />
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
