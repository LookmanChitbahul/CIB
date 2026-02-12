import React, { useEffect } from 'react';
import { Form, Input, Select, DatePicker, Button, notification, Spin, Breadcrumb, Divider } from 'antd';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { getProject, createProject, updateProject } from '../api/client';
import {
    LeftOutlined,
    FileTextOutlined,
    CloudUploadOutlined,
} from '@ant-design/icons';

const { Option } = Select;
const { TextArea } = Input;

const ProjectForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [form] = Form.useForm();
    const queryClient = useQueryClient();
    const isEditMode = !!id;

    const { data: projectData, isLoading: isFetching } = useQuery({
        queryKey: ['project', id],
        queryFn: () => getProject(id),
        enabled: isEditMode,
        staleTime: 0,
    });

    const storageKey = isEditMode ? `cib_draft_${id}` : 'cib_draft_new';

    useEffect(() => {
        const loadData = () => {
            const saved = localStorage.getItem(storageKey);
            let initial = {};

            if (projectData?.data) {
                const d = projectData.data;
                initial = {
                    ...d,
                    pid: d.pid.toString(),
                    startDate: d.startDate ? dayjs(d.startDate) : null,
                    completionDate: d.completionDate ? dayjs(d.completionDate) : null,
                };
            }

            if (saved) {
                try {
                    const parsed = JSON.parse(saved);
                    if (parsed.startDate) parsed.startDate = dayjs(parsed.startDate);
                    if (parsed.completionDate) parsed.completionDate = dayjs(parsed.completionDate);

                    initial = { ...initial, ...parsed };

                    notification.info({
                        message: 'Unsaved Changes Restored',
                        description: 'We restored your last uncommitted edits.',
                        duration: 3,
                        key: 'draft_restore'
                    });
                } catch (e) {
                    console.error("Draft parse error", e);
                }
            }

            if (Object.keys(initial).length > 0) {
                form.setFieldsValue(initial);
            }
        };

        loadData();
    }, [projectData, form, storageKey]);

    const handleValuesChange = (_, allValues) => {
        localStorage.setItem(storageKey, JSON.stringify(allValues));
    };

    const mutation = useMutation({
        mutationFn: ({ values, isDraft }) => {
            const payload = {
                ...values,
                pid: parseInt(values.pid),
                startDate: values.startDate ? values.startDate.toISOString() : null,
                completionDate: values.completionDate ? values.completionDate.toISOString() : null,
                isDraft: isDraft
            };

            if (isEditMode) {
                return updateProject(id, payload);
            }
            return createProject(payload);
        },
        onSuccess: (_, { isDraft }) => {
            localStorage.removeItem(storageKey);
            notification.success({
                message: isDraft ? 'Draft Saved' : 'Project Published',
                description: isDraft
                    ? 'Your changes have been saved to the drafts repository.'
                    : 'Project record is now live and visible in the public matrix.'
            });
            queryClient.invalidateQueries(['projects']);
            navigate('/projects');
        },
        onError: (error) => {
            notification.error({
                message: 'Deployment Error',
                description: error.response?.data?.error || error.message
            });
        }
    });

    const onFinish = (values) => {
        mutation.mutate({ values, isDraft: false });
    };

    const handleSaveDraft = async () => {
        try {
            const values = await form.validateFields();
            mutation.mutate({ values, isDraft: true });
        } catch (error) {
            notification.warning({ message: 'Validation Failed', description: 'Please fill in basic identity fields before saving as draft.' });
        }
    };

    if (isEditMode && isFetching) {
        return <div className="flex justify-center items-center h-[70vh]"><Spin size="large" tip="Retrieving record..." /></div>;
    }

    return (
        <div className="max-w-6xl mx-auto space-y-8 py-8 animate-in fade-in slide-in-from-top-4 duration-700">
            {/* Header section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-2">
                <div className="space-y-2">
                    <Breadcrumb
                        items={[
                            { title: <Link className="text-slate-500 font-bold uppercase text-[10px] tracking-widest hover:text-blue-600" to="/">Hub</Link> },
                            { title: <Link className="text-slate-500 font-bold uppercase text-[10px] tracking-widest hover:text-blue-600" to="/projects">Records</Link> },
                            { title: <span className="text-blue-600 font-bold uppercase text-[10px] tracking-widest">{isEditMode ? 'Edit' : 'Genesis'}</span> }
                        ]}
                        separator={<span className="text-slate-300">/</span>}
                    />
                    <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 leading-none">
                        {isEditMode ? "Modify Operational Unit" : "Project Registration"}
                    </h1>
                    <p className="text-slate-500 font-medium text-base">Input protocol for strategic project data entry.</p>
                </div>
                <Button
                    size="large"
                    icon={<LeftOutlined />}
                    onClick={() => navigate('/projects')}
                    className="rounded-xl border-slate-200 shadow-sm hover:shadow hover:border-slate-300 hover:text-slate-700 transition-all h-10 px-6 font-bold text-slate-500 bg-white"
                >
                    Cancel
                </Button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="bg-slate-50 px-8 py-5 border-b border-slate-200 flex justify-between items-center">
                    <div className="space-y-1">
                        <h3 className="font-bold text-lg text-slate-900 flex items-center gap-3">
                            <span className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center text-sm font-bold shadow-sm">01</span>
                            Project Details
                        </h3>
                        <p className="text-slate-500 text-sm pl-11">Enter the core information for this project record.</p>
                    </div>
                    <div className="hidden md:block">
                        <div className={`px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wide border ${projectData?.data?.isDraft ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-blue-50 text-blue-700 border-blue-200'}`}>
                            Status: {isEditMode ? (projectData?.data?.isDraft ? 'Draft' : 'Active') : 'New Entry'}
                        </div>
                    </div>
                </div>

                <Form
                    form={form}
                    layout="vertical"
                    onFinish={onFinish}
                    onValuesChange={handleValuesChange}
                    initialValues={{ type: 'NEW', fundAvailable: 'NO' }}
                    className="p-8"
                    requiredMark={true}
                >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8">
                        {/* PID Section */}
                        <div className="space-y-6">
                            <Form.Item
                                name="pid"
                                label={<span className="font-semibold text-slate-700 block mb-1">Project ID (PID)</span>}
                                rules={[{ required: true, message: 'ID required' }]}
                            >
                                <Input
                                    size="large"
                                    type="number"
                                    placeholder="Enter PID"
                                    disabled={isEditMode}
                                    className="rounded-lg font-medium text-slate-900 border-slate-300 focus:border-blue-500 hover:border-slate-400 py-2.5 bg-white"
                                />
                            </Form.Item>

                            <Form.Item
                                name="projectName"
                                label={<span className="font-semibold text-slate-700 block mb-1">Project Name</span>}
                                rules={[{ required: true }]}
                            >
                                <Input
                                    size="large"
                                    placeholder="Enter full project title"
                                    className="rounded-lg font-medium text-slate-900 border-slate-300 focus:border-blue-500 hover:border-slate-400 py-2.5"
                                />
                            </Form.Item>
                        </div>

                        {/* Managers Section */}
                        <div className="space-y-6">
                            <div className="grid grid-cols-2 gap-5">
                                <Form.Item name="leadProgrammeManager" label={<span className="font-semibold text-slate-700 block mb-1">Lead PgM</span>} rules={[{ required: true }]}>
                                    <Input size="large" className="rounded-lg text-slate-900 border-slate-300 py-2.5" placeholder="Name" />
                                </Form.Item>

                                <Form.Item name="programmeManager" label={<span className="font-semibold text-slate-700 block mb-1">Unit Manager</span>} rules={[{ required: true }]}>
                                    <Input size="large" className="rounded-lg text-slate-900 border-slate-300 py-2.5" placeholder="Name" />
                                </Form.Item>
                            </div>

                            <Form.Item
                                name="ministryDept"
                                label={<span className="font-semibold text-slate-700 block mb-1">Ministry / Department</span>}
                                rules={[{ required: true }]}
                            >
                                <Input size="large" placeholder="e.g. Ministry of Works" className="rounded-lg text-slate-900 border-slate-300 py-2.5" />
                            </Form.Item>
                        </div>

                        <Divider className="md:col-span-2 border-slate-100 my-2" />

                        {/* Classification & Funding */}
                        <div className="grid grid-cols-2 gap-10">
                            <Form.Item
                                name="type"
                                label={<span className="font-semibold text-slate-700 block mb-1">Project Type</span>}
                                rules={[{ required: true }]}
                            >
                                <Select size="large" className="rounded-lg font-medium">
                                    <Option value="NEW">New</Option>
                                    <Option value="ONGOING">Ongoing</Option>
                                    <Option value="ON_HOLD">On Hold</Option>
                                    <Option value="COMPLETED">Completed</Option>
                                </Select>
                            </Form.Item>

                            <Form.Item
                                name="fundAvailable"
                                label={<span className="font-semibold text-slate-700 block mb-1">Funding Available</span>}
                                rules={[{ required: true }]}
                            >
                                <Select size="large" className="rounded-lg font-medium">
                                    <Option value="YES">Yes</Option>
                                    <Option value="NO">No</Option>
                                    <Option value="FUNDED">Funded</Option>
                                </Select>
                            </Form.Item>
                        </div>

                        {/* Value & Dates */}
                        <div className="space-y-6">
                            <Form.Item name="contractValue" label={<span className="font-semibold text-slate-700 block mb-1">Contract Value</span>} rules={[{ required: true }]}>
                                <Input size="large" placeholder="0.00" className="rounded-lg font-medium text-slate-900 border-slate-300 py-2.5" />
                            </Form.Item>

                            <div className="grid grid-cols-2 gap-5">
                                <Form.Item name="startDate" label={<span className="font-semibold text-slate-700 block mb-1">Start Date</span>} rules={[{ required: true }]}>
                                    <DatePicker size="large" className="w-full rounded-lg" />
                                </Form.Item>

                                <Form.Item name="completionDate" label={<span className="font-semibold text-slate-700 block mb-1">Completion Date</span>}>
                                    <DatePicker size="large" className="w-full rounded-lg" />
                                </Form.Item>
                            </div>
                        </div>

                        {/* Descriptions */}
                        <div className="md:col-span-2 space-y-8">
                            <Form.Item
                                name="description"
                                label={<span className="font-semibold text-slate-700 block mb-1">Project Description</span>}
                                rules={[{ required: true }]}
                            >
                                <TextArea rows={4} className="rounded-lg text-slate-900 border-slate-300 py-3" placeholder="Enter detailed project description..." />
                            </Form.Item>

                            <Form.Item
                                name="status"
                                label={<span className="font-semibold text-slate-700 block mb-1">Progress Status</span>}
                                rules={[{ required: true }]}
                            >
                                <TextArea rows={3} placeholder="Current progress update..." className="rounded-lg text-slate-900 border-slate-300 py-3" />
                            </Form.Item>
                        </div>
                    </div>

                    {/* Form Controls */}
                    <div className="mt-12 flex flex-col md:flex-row justify-end gap-4 pt-8 border-t border-slate-100">
                        <Button
                            size="large"
                            icon={<FileTextOutlined />}
                            onClick={handleSaveDraft}
                            loading={mutation.isPending && mutation.variables?.isDraft}
                            className="rounded-lg h-12 px-8 font-bold text-slate-600 hover:text-blue-600 hover:border-blue-200 border-slate-200"
                        >
                            Save Draft
                        </Button>
                        <Button
                            type="primary"
                            htmlType="submit"
                            loading={mutation.isPending && !mutation.variables?.isDraft}
                            size="large"
                            icon={<CloudUploadOutlined />}
                            className="bg-blue-600 hover:bg-blue-500 rounded-lg h-12 px-10 font-bold text-white shadow-md hover:shadow-lg transition-all"
                        >
                            {isEditMode && !projectData?.data?.isDraft ? 'Update Project' : 'Initialize Project'}
                        </Button>
                    </div>
                </Form>
            </div>
        </div>
    );
};

export default ProjectForm;
