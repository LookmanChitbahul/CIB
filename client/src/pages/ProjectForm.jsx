import React, { useEffect } from 'react';
import { Form, Input, Select, Button, message, Row, Col, Divider, DatePicker } from 'antd';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router-dom';
import dayjs from 'dayjs';
import { createProject, getProjectById, updateProject } from '../api/client';
import { useTheme } from '../context/ThemeContext';
import {
    SaveOutlined,
    CloseOutlined,
    ProjectOutlined,
    SafetyCertificateOutlined,
    UserOutlined,
    CalendarOutlined,
    DollarCircleOutlined
} from '@ant-design/icons';

const { Option } = Select;
const { TextArea } = Input;

const PERSISTENCE_KEY = 'cib_project_form_draft';

const ProjectForm = ({ isEdit = false }) => {
    const [form] = Form.useForm();
    const navigate = useNavigate();
    const { id } = useParams();
    const queryClient = useQueryClient();
    const { isDarkMode } = useTheme();

    const effectiveIsEdit = isEdit || !!id;

    const { data: project, isLoading: isFetching } = useQuery({
        queryKey: ['project', id],
        queryFn: () => getProjectById(id),
        enabled: effectiveIsEdit && !!id,
    });

    useEffect(() => {
        if (project?.data) {
            const formData = { ...project.data };
            if (formData.startDate) formData.startDate = dayjs(formData.startDate);
            if (formData.completionDate) formData.completionDate = dayjs(formData.completionDate);
            form.setFieldsValue(formData);
        } else if (!effectiveIsEdit) {
            // Load from persistence if creating new
            const saved = localStorage.getItem(PERSISTENCE_KEY);
            if (saved) {
                try {
                    const parsed = JSON.parse(saved);
                    if (parsed.startDate) parsed.startDate = dayjs(parsed.startDate);
                    if (parsed.completionDate) parsed.completionDate = dayjs(parsed.completionDate);
                    form.setFieldsValue(parsed);
                } catch (e) {
                    console.error("Failed to load persistence", e);
                }
            }
        }
    }, [project, form, effectiveIsEdit]);

    const handleValuesChange = (_, allValues) => {
        if (!effectiveIsEdit) {
            localStorage.setItem(PERSISTENCE_KEY, JSON.stringify(allValues));
        }
    };

    const clearDraft = () => {
        localStorage.removeItem(PERSISTENCE_KEY);
    };

    const mutation = useMutation({
        mutationFn: (values) => {
            const payload = {
                ...values,
                pid: parseInt(values.pid),
                startDate: values.startDate?.toISOString(),
                completionDate: values.completionDate?.toISOString(),
            };
            return effectiveIsEdit ? updateProject(id, payload) : createProject(payload);
        },
        onSuccess: () => {
            message.success(effectiveIsEdit ? 'Registry updated successfully' : 'New project registered in matrix');
            clearDraft();
            queryClient.invalidateQueries(['projects']);
            navigate('/projects');
        },
        onError: (error) => {
            const errorMsg = error.response?.data?.error || 'Operation failed. Please verify matrix integrity.';
            message.error(errorMsg);
        }
    });

    const onFinish = (values) => {
        mutation.mutate(values);
    };

    const handleDiscard = () => {
        clearDraft();
        navigate('/projects');
    };

    if (effectiveIsEdit && isFetching) {
        return <div className="flex justify-center items-center h-64 text-blue-500 font-bold tracking-widest">DECRYPTING RECORD...</div>;
    }

    return (
        <div className="max-w-6xl mx-auto py-8 animate-in fade-in slide-in-from-bottom-8 duration-1000">
            <div className="mb-12 flex items-center justify-between">
                <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-[10px] font-black uppercase tracking-[0.2em] mb-4">
                        Data Intake Protocol
                    </div>
                    <h1 className={`text-4xl font-black tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                        {effectiveIsEdit ? 'Modify Record' : 'Registry Entry'}
                    </h1>
                    <p className="text-slate-400 font-medium text-lg mt-2">
                        {effectiveIsEdit ? 'Updating existing operational parameters within the registry.' : 'Establishing new project nodes in the CIB encrypted matrix.'}
                    </p>
                </div>
                <div className={`w-20 h-20 rounded-3xl flex items-center justify-center text-3xl shadow-2xl ${isDarkMode ? 'bg-zinc-900 text-blue-500 border border-zinc-800' : 'bg-white text-black dribbble-shadow'}`}>
                    <ProjectOutlined />
                </div>
            </div>

            <Form
                form={form}
                layout="vertical"
                onFinish={onFinish}
                onValuesChange={handleValuesChange}
                requiredMark={false}
                className="space-y-8"
            >
                {/* Identification Section */}
                <div className={`glass-card dribbble-shadow p-10 relative overflow-hidden ${isDarkMode ? 'bg-zinc-900' : 'bg-white'}`}>
                    <div className="flex items-center gap-3 mb-8">
                        <SafetyCertificateOutlined className="text-blue-500 text-xl" />
                        <h3 className={`text-xl font-black tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Primary Identification</h3>
                    </div>

                    <Row gutter={[32, 24]}>
                        <Col xs={24} md={6}>
                            <Form.Item
                                name="pid"
                                label={<span className="font-bold text-slate-400 uppercase text-[10px] tracking-widest">PID (Manual/Auto)</span>}
                                rules={[{ required: true, message: 'PID required' }]}
                            >
                                <Input prefix={<span className="text-slate-400 font-bold mr-1">#</span>} placeholder="PID" className="h-12 !rounded-xl" />
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={12}>
                            <Form.Item
                                name="projectName"
                                label={<span className="font-bold text-slate-400 uppercase text-[10px] tracking-widest">Project Name</span>}
                                rules={[{ required: true, message: 'Identity required' }]}
                            >
                                <Input placeholder="Enter formal project title..." className="h-12 !rounded-xl" />
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={6}>
                            <Form.Item
                                name="type"
                                label={<span className="font-bold text-slate-400 uppercase text-[10px] tracking-widest">Type</span>}
                                rules={[{ required: true, message: 'Type required' }]}
                            >
                                <Select placeholder="Select type..." className="h-12 !rounded-xl">
                                    <Option value="NEW">New Registry</Option>
                                    <Option value="ONGOING">Ongoing Flow</Option>
                                    <Option value="ON_HOLD">On Hold</Option>
                                    <Option value="COMPLETED">Finalized Node</Option>
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={24}>
                            <Form.Item
                                name="ministryDept"
                                label={<span className="font-bold text-slate-400 uppercase text-[10px] tracking-widest">Ministry / Dept</span>}
                                rules={[{ required: true, message: 'Ministry/Dept required' }]}
                            >
                                <Input placeholder="Responsible governmental body..." className="h-12 !rounded-xl" />
                            </Form.Item>
                        </Col>
                    </Row>
                </div>

                {/* Personnel Section */}
                <div className={`glass-card dribbble-shadow p-10 relative overflow-hidden ${isDarkMode ? 'bg-zinc-900' : 'bg-white'}`}>
                    <div className="flex items-center gap-3 mb-8">
                        <UserOutlined className="text-blue-500 text-xl" />
                        <h3 className={`text-xl font-black tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Project Leadership</h3>
                    </div>

                    <Row gutter={[32, 24]}>
                        <Col xs={24} md={12}>
                            <Form.Item
                                name="leadProgrammeManager"
                                label={<span className="font-bold text-slate-400 uppercase text-[10px] tracking-widest">Lead Programme Manager</span>}
                                rules={[{ required: true, message: 'Required' }]}
                            >
                                <Input placeholder="Lead oversight officer..." className="h-12 !rounded-xl" />
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={12}>
                            <Form.Item
                                name="programmeManager"
                                label={<span className="font-bold text-slate-400 uppercase text-[10px] tracking-widest">Programme Manager</span>}
                                rules={[{ required: true, message: 'Required' }]}
                            >
                                <Input placeholder="Operations manager..." className="h-12 !rounded-xl" />
                            </Form.Item>
                        </Col>
                    </Row>
                </div>

                {/* Logistics Section */}
                <div className={`glass-card dribbble-shadow p-10 relative overflow-hidden ${isDarkMode ? 'bg-zinc-900' : 'bg-white'}`}>
                    <div className="flex items-center gap-3 mb-8">
                        <CalendarOutlined className="text-blue-500 text-xl" />
                        <h3 className={`text-xl font-black tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Timeline & Narrative</h3>
                    </div>

                    <Row gutter={[32, 24]}>
                        <Col xs={24} md={12}>
                            <Form.Item
                                name="startDate"
                                label={<span className="font-bold text-slate-400 uppercase text-[10px] tracking-widest">Start Date</span>}
                                rules={[{ required: true, message: 'Required' }]}
                            >
                                <DatePicker className="w-full h-12 !rounded-xl" />
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={12}>
                            <Form.Item
                                name="completionDate"
                                label={<span className="font-bold text-slate-400 uppercase text-[10px] tracking-widest">Completion Date</span>}
                            >
                                <DatePicker className="w-full h-12 !rounded-xl" />
                            </Form.Item>
                        </Col>
                        <Col xs={24}>
                            <Form.Item
                                name="description"
                                label={<span className="font-bold text-slate-400 uppercase text-[10px] tracking-widest">Project Description</span>}
                                rules={[{ required: true, message: 'Description required' }]}
                            >
                                <TextArea rows={3} placeholder="Project objectives and scope details..." className="!rounded-xl p-4" />
                            </Form.Item>
                        </Col>
                        <Col xs={24}>
                            <Form.Item
                                name="status"
                                label={<span className="font-bold text-slate-400 uppercase text-[10px] tracking-widest">Status / Feedback</span>}
                                rules={[{ required: true, message: 'Status feedback required' }]}
                            >
                                <TextArea rows={3} placeholder="Current progress narrative and meeting highlights..." className="!rounded-xl p-4" />
                            </Form.Item>
                        </Col>
                    </Row>
                </div>

                {/* Financial Section */}
                <div className={`glass-card dribbble-shadow p-10 relative overflow-hidden ${isDarkMode ? 'bg-zinc-900' : 'bg-white'}`}>
                    <div className="flex items-center gap-3 mb-8">
                        <DollarCircleOutlined className="text-blue-500 text-xl" />
                        <h3 className={`text-xl font-black tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Financial Parameters</h3>
                    </div>

                    <Row gutter={[32, 24]}>
                        <Col xs={24} md={12}>
                            <Form.Item
                                name="contractValue"
                                label={<span className="font-bold text-slate-400 uppercase text-[10px] tracking-widest">Contract Value / Project Value</span>}
                                rules={[{ required: true, message: 'Required' }]}
                            >
                                <Input
                                    prefix={<span className="text-slate-400 font-bold mr-1">$</span>}
                                    placeholder="Numerical value..."
                                    className="h-12 !rounded-xl"
                                />
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={12}>
                            <Form.Item
                                name="fundAvailable"
                                label={<span className="font-bold text-slate-400 uppercase text-[10px] tracking-widest">Fund Available</span>}
                                rules={[{ required: true, message: 'Required' }]}
                            >
                                <Select placeholder="Funding status..." className="h-12 !rounded-xl">
                                    <Option value="YES">Yes</Option>
                                    <Option value="NO">No</Option>
                                    <Option value="FUNDED">Funded</Option>
                                </Select>
                            </Form.Item>
                        </Col>
                    </Row>
                </div>

                <div className="flex items-center justify-end gap-6 pt-4">
                    <Button
                        size="large"
                        shape="round"
                        icon={<CloseOutlined />}
                        onClick={handleDiscard}
                        className={`h-14 px-8 font-black tracking-widest uppercase text-[10px] border-none shadow-lg ${isDarkMode ? 'bg-zinc-800 text-slate-400 hover:text-white' : 'bg-white text-slate-500'}`}
                    >
                        Discard
                    </Button>
                    <Button
                        type="primary"
                        htmlType="submit"
                        size="large"
                        shape="round"
                        icon={<SaveOutlined />}
                        loading={mutation.isPending}
                        className="h-14 px-10 font-black tracking-widest uppercase text-[10px] bg-blue-600 border-none shadow-2xl shadow-blue-500/30 hover:scale-105 transition-all text-white"
                    >
                        Save
                    </Button>
                </div>
            </Form>
        </div>
    );
};

export default ProjectForm;
