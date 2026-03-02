import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Table, Button, Input, Space, Tag, Modal, message, Tooltip } from 'antd';
import {
    EditOutlined,
    DeleteOutlined,
    SearchOutlined,
    PlusOutlined,
    ExclamationCircleOutlined,
    ProjectOutlined,
    FileDoneOutlined,
    SyncOutlined,
    CalendarOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { getProjects, deleteProject } from '../api/client';
import { useTheme } from '../context/ThemeContext';

const { confirm } = Modal;

const ProjectList = () => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { isDarkMode } = useTheme();
    const [searchText, setSearchText] = useState('');

    const { data: projectsData, isLoading, isError } = useQuery({
        queryKey: ['projects'],
        queryFn: async () => {
            const res = await getProjects();
            // Backend returns { data: [...], meta: { ... } }
            return res.data;
        }
    });

    const projects = projectsData?.data || [];

    const deleteMutation = useMutation({
        mutationFn: deleteProject,
        onSuccess: () => {
            message.success('Project purged from matrix');
            queryClient.invalidateQueries(['projects']);
        },
        onError: () => {
            message.error('Purge operation failed');
        }
    });

    const showDeleteConfirm = (id) => {
        confirm({
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

    const getTypeColor = (type) => {
        switch (type) {
            case 'NEW': return 'blue';
            case 'ONGOING': return 'orange';
            case 'COMPLETED': return 'green';
            default: return 'default';
        }
    };

    const getTypeIcon = (type) => {
        switch (type) {
            case 'NEW': return <PlusOutlined />;
            case 'ONGOING': return <SyncOutlined spin />;
            case 'COMPLETED': return <FileDoneOutlined />;
            default: return <ProjectOutlined />;
        }
    };

    const columns = [
        {
            title: 'IDENTITY',
            dataIndex: 'projectName',
            key: 'projectName',
            render: (text, record) => (
                <div className="flex items-center gap-4 py-1">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl shadow-sm
                        ${getTypeColor(record.type) === 'blue' ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20' :
                            getTypeColor(record.type) === 'orange' ? 'bg-amber-50 text-amber-600 dark:bg-amber-900/20' :
                                'bg-green-50 text-green-600 dark:bg-green-900/20'
                        }`}>
                        {getTypeIcon(record.type)}
                    </div>
                    <div>
                        <div className={`font-black text-base tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{text}</div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Ref: #{String(record.id).slice(0, 8) || 'N/A'}</div>
                    </div>
                </div>
            ),
        },
        {
            title: 'PROTOCOL',
            dataIndex: 'type',
            key: 'type',
            render: (val) => (
                <Tag color={getTypeColor(val)} className="rounded-full px-4 py-1 font-black text-[10px] uppercase tracking-widest border-none shadow-sm">
                    {val}
                </Tag>
            ),
        },
        {
            title: 'CONTRACT VALUE',
            dataIndex: 'contractValue',
            key: 'contractValue',
            render: (val) => (
                <span className={`font-black tracking-tight ${isDarkMode ? 'text-slate-200' : 'text-slate-700'}`}>
                    {val || 'N/A'}
                </span>
            )
        },
        {
            title: 'LATEST UPDATE',
            dataIndex: 'updatedAt',
            key: 'updatedAt',
            render: (date) => (
                <div className="flex items-center gap-2 text-slate-400">
                    <CalendarOutlined className="text-xs" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">
                        {date ? new Date(date).toLocaleDateString() : 'N/A'}
                    </span>
                </div>
            ),
        },
        {
            title: 'ACTIONS',
            key: 'action',
            align: 'right',
            render: (_, record) => (
                <Space size="middle">
                    <Tooltip title="Modify Record">
                        <Button
                            type="text"
                            icon={<EditOutlined />}
                            onClick={() => navigate(`/projects/${record.id}/edit`)}
                            className={`flex items-center justify-center w-10 h-10 rounded-xl hover:bg-blue-50 hover:text-blue-600 ${isDarkMode ? 'text-slate-400 border border-slate-800' : 'text-slate-400 border border-slate-100'}`}
                        />
                    </Tooltip>
                    <Tooltip title="Purge Record">
                        <Button
                            type="text"
                            danger
                            icon={<DeleteOutlined />}
                            onClick={() => showDeleteConfirm(record.id)}
                            className={`flex items-center justify-center w-10 h-10 rounded-xl hover:bg-red-50 ${isDarkMode ? 'border border-slate-800' : 'border border-slate-100'}`}
                        />
                    </Tooltip>
                </Space>
            ),
        },
    ];

    const filteredProjects = projects.filter(p =>
        p.projectName?.toLowerCase().includes(searchText?.toLowerCase() || '') ||
        p.type?.toLowerCase().includes(searchText?.toLowerCase() || '')
    );

    if (isError) return (
        <div className="flex flex-col items-center justify-center h-[50vh] space-y-4">
            <h2 className={`text-2xl font-black ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Operational Matrix Offline</h2>
            <p className="text-slate-400">Failed to establish connection to the project registry.</p>
            <Button type="primary" onClick={() => queryClient.invalidateQueries(['projects'])}>Retry Protocol</Button>
        </div>
    );

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-2">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-[10px] font-black uppercase tracking-[0.2em]">
                        Operational Matrix
                    </div>
                    <h1 className={`text-4xl font-black tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Project Intelligence</h1>
                    <p className="text-slate-400 font-medium text-lg">Managing active units within the registry matrix.</p>
                </div>
                <div className="flex items-center gap-4">
                    <Input
                        prefix={<SearchOutlined className="text-slate-400 mr-2" />}
                        placeholder="Scan for identifiers..."
                        className="w-full md:w-80 h-14 !rounded-2xl text-base font-medium dribbble-shadow border-none dark:bg-gray-900 dark:text-white"
                        onChange={e => setSearchText(e.target.value)}
                    />
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={() => navigate('/projects/new')}
                        size="large"
                        className="h-14 px-8 !rounded-2xl font-black bg-black dark:bg-blue-600 border-none shadow-xl shadow-blue-500/20 hover:scale-105 transition-transform text-white"
                    >
                        NEW REGISTRY
                    </Button>
                </div>
            </div>

            <div className={`glass-card dribbble-shadow overflow-hidden ${isDarkMode ? 'bg-gray-900' : 'bg-white'}`}>
                <Table
                    columns={columns}
                    dataSource={filteredProjects}
                    loading={isLoading}
                    rowKey="id"
                    pagination={{
                        pageSize: 8,
                        className: `px-8 py-6 pb-12 font-bold ${isDarkMode ? 'pagination-dark' : ''}`,
                        position: ['bottomCenter'],
                    }}
                    onRow={(record) => ({
                        className: 'hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors cursor-pointer',
                        onClick: () => navigate(`/projects/${record.id}/edit`),
                    })}
                />
            </div>
        </div>
    );
};

export default ProjectList;

