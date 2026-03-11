import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Table, Button, Input, Space, Tag, Modal, Form, Switch, Tabs, App as AntdApp, Tooltip } from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined, UserOutlined, BankOutlined, PartitionOutlined, SearchOutlined } from '@ant-design/icons';
import {
    getMinistries, upsertMinistry, deleteMinistry,
    getDepartments, upsertDepartment, deleteDepartment,
    getPersonnel, upsertPersonnel, deletePersonnel
} from '../api/client';
import { useTheme } from '../context/ThemeContext';

const RegistryManagement = () => {
    const queryClient = useQueryClient();
    const { isDarkMode } = useTheme();
    const { message: messageApi, modal: modalApi } = AntdApp.useApp();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [activeTab, setActiveTab] = useState('ministries');
    const [searchText, setSearchText] = useState('');
    const [form] = Form.useForm();

    // Queries
    const { data: ministries, isLoading: loadingMinistries } = useQuery({ queryKey: ['ministries'], queryFn: getMinistries });
    const { data: departments, isLoading: loadingDepartments } = useQuery({ queryKey: ['departments'], queryFn: getDepartments });
    const { data: personnel, isLoading: loadingPersonnel } = useQuery({ queryKey: ['personnel'], queryFn: getPersonnel });

    // Mutations
    const mutationMap = {
        ministries: useMutation({
            mutationFn: upsertMinistry,
            onSuccess: () => {
                queryClient.invalidateQueries(['ministries']);
                messageApi.success('Ministry registry updated');
                handleCloseModal();
            }
        }),
        departments: useMutation({
            mutationFn: upsertDepartment,
            onSuccess: () => {
                queryClient.invalidateQueries(['departments']);
                messageApi.success('Department registry updated');
                handleCloseModal();
            }
        }),
        personnel: useMutation({
            mutationFn: upsertPersonnel,
            onSuccess: () => {
                queryClient.invalidateQueries(['personnel']);
                messageApi.success('Personnel registry updated');
                handleCloseModal();
            }
        })
    };

    const deleteMutationMap = {
        ministries: useMutation({ mutationFn: deleteMinistry, onSuccess: () => queryClient.invalidateQueries(['ministries']) }),
        departments: useMutation({ mutationFn: deleteDepartment, onSuccess: () => queryClient.invalidateQueries(['departments']) }),
        personnel: useMutation({ mutationFn: deletePersonnel, onSuccess: () => queryClient.invalidateQueries(['personnel']) })
    };

    const handleOpenModal = (item = null) => {
        setEditingItem(item);
        if (item) {
            form.setFieldsValue(item);
        } else {
            form.resetFields();
            form.setFieldsValue({ isActive: true });
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingItem(null);
        form.resetFields();
    };

    const onFinish = (values) => {
        const payload = editingItem ? { ...values, id: editingItem.id } : values;
        mutationMap[activeTab].mutate(payload);
    };

    const handleDelete = (id) => {
        modalApi.confirm({
            title: 'Delete this entry?',
            content: 'This operation cannot be undone.',
            okText: 'Delete',
            okType: 'danger',
            onOk: () => deleteMutationMap[activeTab].mutate(id)
        });
    };

    const commonColumns = [
        {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
            sorter: (a, b) => a.name.localeCompare(b.name),
            ... (searchText ? {
                render: (text) => (
                    <span className={text.toLowerCase().includes(searchText.toLowerCase()) ? "bg-yellow-200 dark:bg-yellow-900/40" : ""}>
                        {text}
                    </span>
                )
            } : {})
        },
        {
            title: 'Status',
            dataIndex: 'isActive',
            key: 'isActive',
            render: (active) => (
                <Tag color={active ? 'green' : 'red'}>
                    {active ? 'ACTIVE' : 'INACTIVE'}
                </Tag>
            )
        },
        {
            title: 'Actions',
            key: 'actions',
            align: 'right',
            render: (_, record) => (
                <Space>
                    <Button icon={<EditOutlined />} onClick={() => handleOpenModal(record)} />
                    <Button danger icon={<DeleteOutlined />} onClick={() => handleDelete(record.id)} />
                </Space>
            )
        }
    ];

    const personnelColumns = [
        ...commonColumns.slice(0, 1),
        {
            title: 'Role',
            dataIndex: 'role',
            key: 'role',
            filters: [
                { text: 'Lead PM', value: 'LEAD_PM' },
                { text: 'PM', value: 'PM' },
            ],
            onFilter: (value, record) => record.role === value,
            render: (role) => (
                <Tag color={role === 'LEAD_PM' ? 'blue' : 'cyan'} className="font-bold">
                    {role}
                </Tag>
            )
        },
        ...commonColumns.slice(1)
    ];

    const filterData = (data) => {
        if (!data) return [];
        if (!searchText) return data;
        return data.filter(item =>
            item.name?.toLowerCase().includes(searchText.toLowerCase()) ||
            item.role?.toLowerCase().includes(searchText.toLowerCase())
        );
    };

    const tabItems = [
        {
            key: 'ministries',
            label: <span><BankOutlined /> Ministries</span>,
            children: (
                <Table
                    dataSource={filterData(ministries)}
                    columns={commonColumns}
                    loading={loadingMinistries}
                    rowKey="id"
                    pagination={{
                        pageSizeOptions: ['5', '10', '20', '50'],
                        showSizeChanger: true,
                        showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} records`,
                        position: ['bottomCenter']
                    }}
                />
            )
        },
        {
            key: 'departments',
            label: <span><PartitionOutlined /> Departments</span>,
            children: (
                <Table
                    dataSource={filterData(departments)}
                    columns={commonColumns}
                    loading={loadingDepartments}
                    rowKey="id"
                    pagination={{
                        pageSizeOptions: ['5', '10', '20', '50'],
                        showSizeChanger: true,
                        showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} records`,
                        position: ['bottomCenter']
                    }}
                />
            )
        },
        {
            key: 'personnel',
            label: <span><UserOutlined /> Personnel</span>,
            children: (
                <Table
                    dataSource={filterData(personnel)}
                    columns={personnelColumns}
                    loading={loadingPersonnel}
                    rowKey="id"
                    pagination={{
                        pageSizeOptions: ['5', '10', '20', '50'],
                        showSizeChanger: true,
                        showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} records`,
                        position: ['bottomCenter']
                    }}
                />
            )
        }
    ];

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className={`text-4xl font-black tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Registry Management</h1>
                    <p className="text-slate-400 mt-2">Manage dynamic lists for the Operational Matrix.</p>
                </div>
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    size="large"
                    className="h-12 !rounded-2xl font-black bg-blue-600 border-none shadow-xl"
                    onClick={() => handleOpenModal()}
                >
                    ADD ENTRY
                </Button>
            </div>

            <div className={`glass-card p-6 ${isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white'}`}>
                <div className="mb-6 flex items-center gap-4">
                    <Input
                        prefix={<SearchOutlined className="text-slate-400 mr-2" />}
                        placeholder={`Search ${activeTab}...`}
                        className="w-full md:w-80 h-11 !rounded-2xl text-sm font-medium dribbble-shadow border-none dark:bg-zinc-800 dark:text-white"
                        onChange={e => setSearchText(e.target.value)}
                        allowClear
                    />
                    <div className="text-slate-400 text-xs font-bold uppercase tracking-widest hidden md:block">
                        {filterData(activeTab === 'ministries' ? ministries : activeTab === 'departments' ? departments : personnel).length} Results
                    </div>
                </div>
                <Tabs
                    activeKey={activeTab}
                    onChange={setActiveTab}
                    items={tabItems}
                    className="custom-tabs"
                />
            </div>

            <Modal
                title={`${editingItem ? 'Edit' : 'Add New'} ${activeTab.slice(0, -1)}`}
                open={isModalOpen}
                onCancel={handleCloseModal}
                footer={null}
                centered
            >
                <Form form={form} layout="vertical" onFinish={onFinish} initialValues={{ isActive: true }} className="mt-4">
                    <Form.Item name="name" label="Name" rules={[{ required: true, message: 'Please enter a name' }]}>
                        <Input className="h-12 !rounded-xl" />
                    </Form.Item>

                    {activeTab === 'personnel' && (
                        <Form.Item name="role" label="Role" rules={[{ required: true, message: 'Please select a role' }]}>
                            <select className={`w-full h-12 rounded-xl border px-3 ${isDarkMode ? 'bg-zinc-800 border-zinc-700 text-white' : 'bg-white border-slate-200'}`}>
                                <option value="LEAD_PM">Lead Programme Manager (LEAD_PM)</option>
                                <option value="PM">Programme Manager (PM)</option>
                            </select>
                        </Form.Item>
                    )}

                    <Form.Item name="isActive" label="Active Status" valuePropName="checked">
                        <Switch />
                    </Form.Item>

                    <div className="flex justify-end gap-3 mt-8">
                        <Button onClick={handleCloseModal} className="h-12 !rounded-xl">Cancel</Button>
                        <Button type="primary" htmlType="submit" className="h-12 !rounded-xl bg-blue-600 border-none">
                            Save Changes
                        </Button>
                    </div>
                </Form>
            </Modal>
        </div>
    );
};

export default RegistryManagement;
