import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Table, Button, Input, Select, Space, Modal, notification, Tag, Tooltip, Avatar } from 'antd';
import {
    EditOutlined,
    DeleteOutlined,
    DownloadOutlined,
    PlusOutlined,
    SearchOutlined,
    FilterOutlined,
    FileTextOutlined,
    SafetyCertificateOutlined,
    BankOutlined,
    UserOutlined,
    ArrowsAltOutlined
} from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import { Resizable } from 'react-resizable';
import { getProjects, deleteProject } from '../api/client';
import { useTheme } from '../context/ThemeContext';

const { Option } = Select;

// Resizable Header Component
const ResizableTitle = (props) => {
    const { onResize, width, ...restProps } = props;
    if (!width) return <th {...restProps} />;
    return (
        <Resizable
            width={width}
            height={0}
            handle={<span className="react-resizable-handle" onClick={(e) => e.stopPropagation()} />}
            onResize={onResize}
            draggableOpts={{ enableUserSelectHack: false }}
        >
            <th {...restProps} />
        </Resizable>
    );
};

const ProjectList = () => {
    const { isDarkMode } = useTheme();
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [search, setSearch] = useState('');
    const [typeFilter, setTypeFilter] = useState('');
    const [fundFilter, setFundFilter] = useState('');
    const [isDraftFilter, setIsDraftFilter] = useState('false');
    const [sorter, setSorter] = useState({ field: 'updatedAt', order: 'descend' });

    // Column widths state for resizability
    const [columnsWidth, setColumnsWidth] = useState({
        projectName: 350,
        leadProgrammeManager: 180,
        type: 140,
        fundAvailable: 120,
        contractValue: 140,
        status: 250,
        actions: 100,
    });

    const queryClient = useQueryClient();
    const navigate = useNavigate();

    const { data, isLoading } = useQuery({
        queryKey: ['projects', page, pageSize, search, typeFilter, fundFilter, isDraftFilter, sorter],
        queryFn: async () => {
            const params = {
                page,
                pageSize,
                search,
                type: typeFilter,
                fundAvailable: fundFilter,
                isDraft: isDraftFilter === 'all' ? undefined : isDraftFilter,
                sortBy: sorter.field,
                sortOrder: sorter.order === 'ascend' ? 'asc' : 'desc'
            };
            const res = await getProjects(params);
            return res.data;
        },
        placeholderData: (previousData) => previousData,
    });

    const deleteMutation = useMutation({
        mutationFn: deleteProject,
        onSuccess: () => {
            notification.success({ message: 'Success', description: 'Record purged.' });
            queryClient.invalidateQueries(['projects']);
        },
        onError: () => notification.error({ message: 'Error', description: 'Action failed.' })
    });

    const handleDelete = (id) => {
        Modal.confirm({
            title: 'Delete Record?',
            content: 'This action is irreversible.',
            okText: 'Delete',
            okType: 'danger',
            centered: true,
            onOk: () => deleteMutation.mutate(id),
        });
    };

    const handleResize = (key) => (e, { size }) => {
        setColumnsWidth((prev) => ({ ...prev, [key]: size.width }));
    };

    const rawColumns = [
        {
            title: 'Project Name',
            dataIndex: 'projectName',
            key: 'projectName',
            width: columnsWidth.projectName,
            fixed: 'left',
            render: (_, record) => (
                <div className="flex items-center gap-3 py-2">
                    <Avatar size="small" className={`flex-shrink-0 ${record.isDraft ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'} border-none`}>
                        {record.isDraft ? <FileTextOutlined className="text-xs" /> : <SafetyCertificateOutlined className="text-xs" />}
                    </Avatar>
                    <div className="truncate">
                        <div className="font-bold text-slate-900 text-sm leading-tight truncate">{record.projectName}</div>
                        <div className="text-xs font-semibold text-slate-500 mt-0.5">ID: {record.pid} • {record.ministryDept}</div>
                    </div>
                </div>
            )
        },
        {
            title: 'Lead Programme Manager',
            dataIndex: 'leadProgrammeManager',
            key: 'leadProgrammeManager',
            width: columnsWidth.leadProgrammeManager,
            render: (val) => <span className="text-xs font-bold text-slate-800">{val}</span>
        },
        {
            title: 'Type',
            dataIndex: 'type',
            key: 'type',
            width: columnsWidth.type,
            render: (type) => (
                <Tag className="rounded-md border-none px-2 py-0.5 text-[11px] font-bold uppercase" color={type === 'COMPLETED' ? 'purple' : type === 'ONGOING' ? 'green' : 'blue'}>
                    {type}
                </Tag>
            )
        },
        {
            title: 'Funding',
            dataIndex: 'fundAvailable',
            key: 'fundAvailable',
            width: columnsWidth.fundAvailable,
            render: (fund) => (
                <span className={`text-[11px] font-black uppercase px-2 py-0.5 rounded ${fund === 'YES' ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-700'}`}>
                    {fund}
                </span>
            )
        },
        {
            title: 'Contract Value',
            dataIndex: 'contractValue',
            key: 'contractValue',
            width: columnsWidth.contractValue,
            render: (val) => <span className="font-bold text-xs text-slate-900">{val}</span>
        },
        {
            title: 'Progress Status',
            dataIndex: 'status',
            key: 'status',
            width: columnsWidth.status,
            render: (val) => <div className="text-slate-700 text-xs font-medium truncate max-w-[200px]">{val}</div>
        },
        {
            title: 'Actions',
            key: 'actions',
            width: columnsWidth.actions,
            fixed: 'right',
            align: 'center',
            render: (_, record) => (
                <Space>
                    <Button
                        size="small"
                        type="text"
                        icon={<EditOutlined className="text-blue-600" />}
                        onClick={() => navigate(`/projects/${record.id}/edit`)}
                    />
                    <Button
                        size="small"
                        type="text"
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => handleDelete(record.id)}
                    />
                </Space>
            )
        }
    ];

    const columns = useMemo(() => rawColumns.map((col) => ({
        ...col,
        onHeaderCell: (column) => ({
            width: column.width,
            onResize: handleResize(column.key),
        }),
    })), [columnsWidth]);

    const handleTableChange = (pagination, filters, sorter) => {
        setPage(pagination.current);
        setPageSize(pagination.pageSize);
        if (sorter.field) setSorter({ field: sorter.field, order: sorter.order });
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500 p-2">
            <div className="flex justify-between items-end px-2">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 leading-none tracking-tight">Project Matrix</h1>
                    <p className="text-slate-500 text-sm font-medium mt-2">Manage and track project records.</p>
                </div>
                <div className="flex gap-3">
                    <Button icon={<DownloadOutlined />} size="large" className="rounded-lg font-bold text-xs text-slate-700 border-slate-300 hover:text-blue-600 hover:border-blue-300">Excel</Button>
                    <Button icon={<DownloadOutlined />} size="large" className="rounded-lg font-bold text-xs text-slate-700 border-slate-300 hover:text-blue-600 hover:border-blue-300">PDF</Button>
                    <Link to="/projects/new">
                        <Button type="primary" icon={<PlusOutlined />} size="large" className="rounded-lg font-bold text-xs shadow-lg shadow-blue-500/30">Add Project</Button>
                    </Link>
                </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 flex flex-wrap gap-4 items-center shadow-sm">
                <Input
                    prefix={<SearchOutlined className="text-slate-400" />}
                    placeholder="Search PID, Name..."
                    onChange={e => setSearch(e.target.value)}
                    className="flex-1 min-w-[200px] rounded-lg border-slate-300 h-10 text-sm font-medium text-slate-900"
                />
                <Select
                    className="w-48"
                    placeholder="All Types"
                    allowClear
                    onChange={val => setTypeFilter(val)}
                    size="large"
                >
                    <Option value="NEW">New</Option>
                    <Option value="ONGOING">Ongoing</Option>
                    <Option value="COMPLETED">Completed</Option>
                </Select>
                <Select
                    className="w-48"
                    defaultValue="false"
                    onChange={val => setIsDraftFilter(val)}
                    size="large"
                >
                    <Option value="false">Live Records</Option>
                    <Option value="true">Drafts</Option>
                    <Option value="all">View All</Option>
                </Select>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <Table
                    components={{ header: { cell: ResizableTitle } }}
                    columns={columns}
                    dataSource={data?.data || []}
                    loading={isLoading}
                    rowKey="id"
                    pagination={{
                        current: page,
                        pageSize: pageSize,
                        total: data?.meta?.total || 0,
                        size: 'default',
                        className: 'px-6 py-6',
                        showSizeChanger: true
                    }}
                    onChange={handleTableChange}
                    onRow={(record) => ({
                        onClick: () => navigate(`/projects/${record.id}/edit`),
                        style: { cursor: 'pointer' },
                    })}
                    scroll={{ x: 1200 }}
                    size="middle"
                    className="compact-resizable-table"
                    rowClassName="transition-colors hover:bg-slate-50 text-slate-900"
                />
            </div>
        </div>
    );
};

export default ProjectList;
