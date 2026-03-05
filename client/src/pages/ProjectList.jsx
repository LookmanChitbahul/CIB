import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Table, Button, Input, Space, Tag, Tooltip, Typography, Card, Descriptions, Slider, Timeline, Spin, App, Modal } from 'antd';
import {
    EditOutlined,
    DeleteOutlined,
    SearchOutlined,
    PlusOutlined,
    ExclamationCircleOutlined,
    ProjectOutlined,
    CalendarOutlined,
    BankOutlined,
    UserOutlined,
    HourglassOutlined,
    DownOutlined,
    HistoryOutlined,
    FileExcelOutlined,
    FilePdfOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { getProjects, deleteProject, getProjectHistory } from '../api/client';
import { useTheme } from '../context/ThemeContext';

const ProjectList = () => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { isDarkMode } = useTheme();
    const { message: messageApi, modal: modalApi } = App.useApp();
    const [searchText, setSearchText] = useState('');
    const [fov, setFov] = useState(85);
    const [selectedRowKeys, setSelectedRowKeys] = useState([]);
    const [historyVisible, setHistoryVisible] = useState(false);
    const [currentHistory, setCurrentHistory] = useState([]);
    const [historyLoading, setHistoryLoading] = useState(false);

    const { data: projectsData, isLoading, isError } = useQuery({
        queryKey: ['projects'],
        queryFn: async () => {
            const res = await getProjects();
            return res.data;
        }
    });

    const projects = projectsData?.data || [];

    const scale = 1 - (fov - 70) / 100;
    const fontSize = Math.max(9, 14 * scale);
    const subFontSize = Math.max(8, 10 * scale);
    const colWidth = (base) => base * scale;

    const deleteMutation = useMutation({
        mutationFn: deleteProject,
        onSuccess: () => {
            messageApi.success('Project purged from matrix');
            queryClient.invalidateQueries(['projects']);
        },
        onError: () => {
            messageApi.error('Purge operation failed');
        }
    });

    const showDeleteConfirm = (id) => {
        modalApi.confirm({
            title: 'Purge this record?',
            icon: <ExclamationCircleOutlined className="text-red-500" />,
            content: 'This will permanently remove the project from the CIB matrix.',
            okText: 'Confirm Purge',
            okType: 'danger',
            cancelText: 'Cancel',
            centered: true,
            onOk() {
                deleteMutation.mutate(id);
            },
        });
    };

    const { Text } = Typography;

    const fetchHistory = async (id) => {
        setHistoryLoading(true);
        setHistoryVisible(true);
        try {
            const res = await getProjectHistory(id);
            setCurrentHistory(res.data);
        } catch (error) {
            messageApi.error('Failed to retrieve history logs');
        } finally {
            setHistoryLoading(false);
        }
    };

    const handleBulkExport = (type) => {
        const baseUrl = import.meta.env.PROD ? '/api' : (import.meta.env.VITE_API_URL || 'http://localhost:3001/api');
        const ids = selectedRowKeys.join(',');
        window.open(`${baseUrl}/projects/export/${type}?ids=${ids}`, '_blank');
    };

    const getTypeColor = (type) => {
        switch (type) {
            case 'NEW': return 'blue';
            case 'ONGOING': return 'orange';
            case 'ON_HOLD': return 'red';
            case 'COMPLETED': return 'green';
            case 'OVERDUE': return 'volcano';
            default: return 'default';
        }
    };

    const columns = [
        {
            title: 'PID',
            dataIndex: 'pid',
            key: 'pid',
            width: colWidth(80),
            render: (pid, record) => (
                <span className="font-black" style={{ fontSize: `${fontSize}px`, color: isDarkMode ? '#60a5fa' : '#2563eb' }}>
                    #{pid || record.id}
                </span>
            )
        },
        {
            title: 'Project Name',
            dataIndex: 'projectName',
            key: 'projectName',
            width: colWidth(240),
            render: (text) => (
                <div
                    className={`font-black tracking-tight truncate ${isDarkMode ? 'text-white' : 'text-slate-900'}`}
                    style={{ fontSize: `${fontSize}px` }}
                    title={text}
                >
                    {text}
                </div>
            ),
        },
        {
            title: 'Ministry/Dept',
            dataIndex: 'ministryDept',
            key: 'ministryDept',
            width: colWidth(180),
            render: (text) => (
                <div className="flex items-center gap-1.5 truncate">
                    <BankOutlined className="text-slate-300" style={{ fontSize: `${subFontSize}px` }} />
                    <span
                        className={`font-semibold truncate ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}
                        style={{ fontSize: `${fontSize - 2}px` }}
                    >
                        {text || 'N/A'}
                    </span>
                </div>
            )
        },
        {
            title: 'Type',
            dataIndex: 'type',
            key: 'type',
            width: colWidth(110),
            render: (val) => (
                <Tag
                    color={getTypeColor(val)}
                    className="rounded-full px-2 py-0 font-black uppercase tracking-widest border-none shadow-sm m-0"
                    style={{ fontSize: `${subFontSize - 1}px` }}
                >
                    {val}
                </Tag>
            ),
        },
        {
            title: 'Lead Programme Manager',
            dataIndex: 'leadProgrammeManager',
            key: 'leadProgrammeManager',
            width: colWidth(180),
            render: (text) => (
                <div className={`flex items-center gap-1.5 font-bold uppercase tracking-wider truncate ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                    <UserOutlined className="text-blue-500" style={{ fontSize: `${subFontSize}px` }} />
                    <span style={{ fontSize: `${subFontSize}px` }} className="truncate" title={text}>{text || 'Unassigned'}</span>
                </div>
            )
        },
        {
            title: 'Timeline',
            key: 'timeline',
            width: colWidth(240),
            render: (_, record) => (
                <div className="flex flex-col gap-1">
                    <div className={`flex items-center gap-1.5 ${isDarkMode ? 'text-slate-300' : 'text-slate-500'}`}>
                        <CalendarOutlined style={{ fontSize: `${subFontSize}px` }} />
                        <span className="font-bold uppercase tracking-widest" style={{ fontSize: `${subFontSize - 1}px` }}>
                            {record.startDate ? new Date(record.startDate).toLocaleDateString() : 'N/A'}
                            <span className="mx-1 opacity-40">→</span>
                            {record.completionDate ? new Date(record.completionDate).toLocaleDateString() : 'OPEN'}
                        </span>
                    </div>
                </div>
            )
        },
        {
            title: 'Contract Value',
            dataIndex: 'contractValue',
            key: 'contractValue',
            width: colWidth(150),
            render: (val) => {
                const displayVal = String(val || '0.00').replace(/^\$/, '');
                return (
                    <span
                        className={`font-black tracking-tighter ${isDarkMode ? 'text-slate-200' : 'text-slate-700'}`}
                        style={{ fontSize: `${fontSize - 1}px` }}
                    >
                        ${displayVal}
                    </span>
                );
            }
        },
        {
            title: 'Actions',
            key: 'action',
            align: 'right',
            width: 140,
            render: (_, record) => (
                <Space size="small">
                    <Tooltip title="History Logs">
                        <Button
                            type="text"
                            size="small"
                            icon={<HistoryOutlined style={{ fontSize: `${fontSize}px` }} />}
                            onClick={() => fetchHistory(record.id)}
                            className={`flex items-center justify-center p-2 rounded-lg ${isDarkMode ? 'text-amber-400 hover:bg-amber-900/20' : 'text-amber-500 hover:bg-amber-50'}`}
                        />
                    </Tooltip>
                    <Tooltip title="Edit">
                        <Button
                            type="text"
                            size="small"
                            icon={<EditOutlined style={{ fontSize: `${fontSize}px` }} />}
                            onClick={() => navigate(`/projects/${record.id}/edit`)}
                            className={`flex items-center justify-center p-2 rounded-lg hover:bg-blue-50 hover:text-blue-600 ${isDarkMode ? 'text-slate-400 border border-zinc-800' : 'text-slate-400 border border-slate-100'}`}
                        />
                    </Tooltip>
                    <Tooltip title="Delete">
                        <Button
                            type="text"
                            danger
                            size="small"
                            icon={<DeleteOutlined style={{ fontSize: `${fontSize}px` }} />}
                            onClick={() => showDeleteConfirm(record.id)}
                            className={`flex items-center justify-center p-2 rounded-lg hover:bg-red-50 ${isDarkMode ? 'border border-zinc-800' : 'border border-slate-100'}`}
                        />
                    </Tooltip>
                </Space>
            ),
        },
    ];

    const expandedRowRender = (record) => (
        <Card
            className={`mx-4 mb-4 border-none shadow-sm ${isDarkMode ? 'bg-zinc-950/50' : 'bg-slate-50/50'}`}
            styles={{ body: { padding: '24px' } }}
        >
            <Descriptions
                title={<span className={`text-sm font-black uppercase tracking-widest ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>Detailed Parameters</span>}
                column={2}
                size="small"
                className="custom-descriptions"
            >
                <Descriptions.Item label="Programme Manager" span={2}>
                    <Text className={isDarkMode ? 'text-slate-300' : 'text-slate-600'}>{record.programmeManager || 'N/A'}</Text>
                </Descriptions.Item>
                <Descriptions.Item label="Description" span={2}>
                    <p className={`text-sm leading-relaxed ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                        {record.description || 'No detailed description provided.'}
                    </p>
                </Descriptions.Item>
                <Descriptions.Item label="Status Feedback" span={2}>
                    <div className={`p-4 rounded-xl border ${isDarkMode ? 'bg-zinc-900/50 border-zinc-800 text-slate-300' : 'bg-white border-slate-100 text-slate-600'}`}>
                        <p className="text-sm italic">
                            {record.status || 'Waiting for operational feedback...'}
                        </p>
                    </div>
                </Descriptions.Item>
            </Descriptions>
        </Card>
    );

    const filteredProjects = projects.filter(p =>
        p.projectName?.toLowerCase().includes(searchText?.toLowerCase() || '') ||
        p.type?.toLowerCase().includes(searchText?.toLowerCase() || '') ||
        p.ministryDept?.toLowerCase().includes(searchText?.toLowerCase() || '') ||
        p.leadProgrammeManager?.toLowerCase().includes(searchText?.toLowerCase() || '') ||
        p.pid?.toString().includes(searchText)
    );

    const onSelectChange = (newSelectedRowKeys) => {
        setSelectedRowKeys(newSelectedRowKeys);
    };

    const rowSelection = {
        selectedRowKeys,
        onChange: onSelectChange,
    };

    if (isError) return (
        <div className="flex flex-col items-center justify-center h-[50vh] space-y-4">
            <h2 className={`text-2xl font-black ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Operational Matrix Offline</h2>
            <p className="text-slate-400">Failed to establish connection to the project registry.</p>
            <Button type="primary" onClick={() => queryClient.invalidateQueries(['projects'])}>Retry Protocol</Button>
        </div>
    );

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
                <div className="space-y-2">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-[10px] font-black uppercase tracking-[0.2em]">
                        Operational Matrix
                    </div>
                    <div className="flex items-center gap-4">
                        <h1 className={`text-4xl font-black tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Matrix View</h1>
                        <div className={`hidden md:flex flex-col px-4 py-2 rounded-2xl border ${isDarkMode ? 'bg-zinc-950 border-zinc-800' : 'bg-slate-50 border-slate-200'} min-w-[200px]`}>
                            <div className="flex justify-between items-center mb-1">
                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Registry FOV</span>
                                <span className="text-[10px] font-black text-blue-500 font-mono">{fov}</span>
                            </div>
                            <Slider
                                min={60}
                                max={110}
                                value={fov}
                                onChange={setFov}
                                tooltip={{ open: false }}
                                className="m-0 py-1"
                            />
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <Input
                        prefix={<SearchOutlined className="text-slate-400 mr-2" />}
                        placeholder="Scan registry..."
                        className="w-full md:w-64 h-12 !rounded-2xl text-sm font-medium dribbble-shadow border-none dark:bg-zinc-900 dark:text-white"
                        onChange={e => setSearchText(e.target.value)}
                    />
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={() => navigate('/projects/new')}
                        size="large"
                        className="h-12 px-6 !rounded-2xl font-black bg-blue-600 border-none shadow-xl shadow-blue-500/20 hover:scale-105 transition-all text-white text-xs"
                    >
                        NEW ENTRY
                    </Button>
                </div>
            </div>

            {selectedRowKeys.length > 0 && (
                <div className="flex items-center justify-between p-4 bg-blue-600 rounded-3xl shadow-xl animate-in zoom-in duration-300">
                    <div className="flex items-center gap-4 text-white ml-2">
                        <span className="text-xs font-black uppercase tracking-widest">{selectedRowKeys.length} Nodes Selected</span>
                    </div>
                    <div className="flex gap-3">
                        <Button
                            ghost
                            icon={<FileExcelOutlined />}
                            onClick={() => handleBulkExport('excel')}
                            className="border-white/20 hover:bg-white/10 text-white font-black text-[10px] uppercase tracking-widest h-10 px-6 rounded-xl"
                        >
                            Excel Export
                        </Button>
                        <Button
                            ghost
                            icon={<FilePdfOutlined />}
                            onClick={() => handleBulkExport('pdf')}
                            className="border-white/20 hover:bg-white/10 text-white font-black text-[10px] uppercase tracking-widest h-10 px-6 rounded-xl"
                        >
                            PDF Export
                        </Button>
                        <Button
                            danger
                            type="primary"
                            onClick={() => setSelectedRowKeys([])}
                            className="bg-red-500 border-none font-black text-[10px] uppercase tracking-widest h-10 px-6 rounded-xl"
                        >
                            Reset
                        </Button>
                    </div>
                </div>
            )}

            <div className={`glass-card dribbble-shadow overflow-hidden ${isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white'}`}>
                <Table
                    rowSelection={rowSelection}
                    columns={columns}
                    dataSource={filteredProjects}
                    loading={isLoading}
                    rowKey="id"
                    scroll={{ x: fov < 90 ? 1200 : '100%' }}
                    expandable={{
                        expandedRowRender,
                        expandIcon: ({ expanded, onExpand, record }) =>
                            expanded ? (
                                <DownOutlined rotate={180} onClick={e => onExpand(record, e)} className="text-blue-500 cursor-pointer" />
                            ) : (
                                <DownOutlined onClick={e => onExpand(record, e)} className="text-slate-400 cursor-pointer" />
                            )
                    }}
                    pagination={{
                        pageSize: 10,
                        className: `px-8 py-4 font-bold ${isDarkMode ? 'pagination-dark' : ''}`,
                        position: ['bottomCenter'],
                    }}
                />
            </div>

            <Modal
                title={
                    <div className="flex items-center gap-3">
                        <HistoryOutlined className="text-amber-500" />
                        <span className="font-black uppercase tracking-tight">Timeline Logs</span>
                    </div>
                }
                open={historyVisible}
                onCancel={() => setHistoryVisible(false)}
                footer={null}
                width={600}
                centered
                styles={{ body: { padding: '24px' } }}
                className="history-modal"
            >
                {historyLoading ? (
                    <div className="py-20 text-center"><Spin indicator={<HistoryOutlined spin className="text-3xl text-blue-500" />} /></div>
                ) : (
                    <Timeline
                        mode="left"
                        className="mt-8"
                        items={currentHistory.map((item, idx) => ({
                            color: idx === 0 ? 'blue' : 'gray',
                            children: (
                                <div className="pb-8">
                                    <div className="flex justify-between items-center mb-2">
                                        <Text strong className={isDarkMode ? 'text-blue-400' : 'text-blue-600'}>
                                            {idx === 0 ? 'Current Version (Latest Change)' : (idx === currentHistory.length - 1 ? 'Initial Registry' : `Version Snapshot #${currentHistory.length - idx}`)}
                                        </Text>
                                        <Text type="secondary" className="text-[10px] font-bold uppercase tracking-widest">
                                            {new Date(item.modifiedAt).toLocaleString()}
                                        </Text>
                                    </div>
                                    <div className={`p-4 rounded-2xl border ${isDarkMode ? 'bg-zinc-950 border-zinc-800' : 'bg-slate-50 border-slate-100'}`}>
                                        <div className="grid grid-cols-2 gap-y-2 text-[11px]">
                                            <div><span className="text-slate-400 uppercase font-black tracking-tighter mr-2">Status:</span> <Tag size="small" color={getTypeColor(item.snapshot.type)}>{item.snapshot.type}</Tag></div>
                                            <div><span className="text-slate-400 uppercase font-black tracking-tighter mr-2">User:</span> <span className="font-bold">{item.snapshot.leadProgrammeManager}</span></div>
                                            <div className="col-span-2 mt-2"><span className="text-slate-400 uppercase font-black tracking-tighter block mb-1">Feedback:</span> <span className="italic">{item.snapshot.status}</span></div>
                                        </div>
                                    </div>
                                </div>
                            )
                        }))}
                    />
                )}
            </Modal>

            <p className="text-center text-[9px] font-bold text-slate-400 uppercase tracking-[0.3em] opacity-50">
                Adjust FOV slider to toggle between Global Visibility and Detailed Inspection
            </p>
        </div>
    );
};

export default ProjectList;
