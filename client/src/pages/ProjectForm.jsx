import React, { useEffect } from 'react';
import { Form, Input, Select, Button, message, Row, Col, Divider, Typography } from 'antd';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router-dom';
import dayjs from 'dayjs';
import { createProject, getProjectById, updateProject } from '../api/client';
import { useTheme } from '../context/ThemeContext';
import {
    SaveOutlined,
    CloseOutlined,
    ProjectOutlined,
    InfoCircleOutlined,
    DollarCircleOutlined
} from '@ant-design/icons';

const { Option } = Select;

const ProjectForm = ({ isEdit = false }) => {
    const [form] = Form.useForm();
    const navigate = useNavigate();
    const { id } = useParams();
    const queryClient = useQueryClient();
    const { isDarkMode } = useTheme();

    // If id exists in params, it's edit mode regardless of the prop
    const effectiveIsEdit = isEdit || !!id;

    const { data: project, isLoading: isFetching } = useQuery({
        queryKey: ['project', id],
        queryFn: () => getProjectById(id),
        enabled: effectiveIsEdit && !!id,
    });

    useEffect(() => {
        if (project?.data) {
            const formData = { ...project.data };
            if (formData.updatedAt) formData.updatedAt = dayjs(formData.updatedAt);
            form.setFieldsValue(formData);
        }
    }, [project, form]);

    const mutation = useMutation({
        mutationFn: (values) => effectiveIsEdit ? updateProject(id, values) : createProject(values),
        onSuccess: () => {
            message.success(effectiveIsEdit ? 'Registry updated successfully' : 'New project registered in matrix');
            queryClient.invalidateQueries(['projects']);
            navigate('/projects');
        },
        onError: () => {
            message.error('Operation failed. Please verify matrix integrity.');
        }
    });

    const onFinish = (values) => {
        // Ensure values are clean
        mutation.mutate(values);
    };

    if (effectiveIsEdit && isFetching) {
        return <div className="flex justify-center items-center h-64 text-blue-500 font-bold tracking-widest">DECRYPTING RECORD...</div>;
    }

    return (
        <div className="max-w-5xl mx-auto py-8 animate-in fade-in slide-in-from-bottom-8 duration-1000">
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
                <div className={`w-20 h-20 rounded-3xl flex items-center justify-center text-3xl shadow-2xl ${isDarkMode ? 'bg-gray-900 text-blue-500 border border-slate-800' : 'bg-white text-black dribbble-shadow'}`}>
                    <ProjectOutlined />
                </div>
            </div>

            <Form
                form={form}
                layout="vertical"
                onFinish={onFinish}
                requiredMark={false}
                className="space-y-10"
            >
                <div className={`glass-card dribbble-shadow p-12 relative overflow-hidden ${isDarkMode ? 'bg-gray-900' : 'bg-white'}`}>
                    <div className="flex items-center gap-3 mb-10">
                        <InfoCircleOutlined className="text-blue-500 text-xl" />
                        <h3 className={`text-xl font-black tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Primary Identification</h3>
                    </div>

                    <Row gutter={[48, 32]}>
                        <Col xs={24} md={12}>
                            <Form.Item
                                name="projectName"
                                label={<span className="font-bold text-slate-400 uppercase text-[10px] tracking-widest\">Entity Name</span>}
                                rules={[{ required: true, message: 'Identity required' }]}
                            >
                                <Input prefix={<ProjectOutlined className="text-slate-300 mr-2" />} placeholder="Enter formal title..." className="h-14 !rounded-2xl" />
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={12}>
                            <Form.Item
                                name="type"
                                label={<span className="font-bold text-slate-400 uppercase text-[10px] tracking-widest\">Operational Protocol</span>}
                                rules={[{ required: true, message: 'Protocol required' }]}
                            >
                                <Select placeholder="Select status..." className="h-14 !rounded-2xl custom-select-glow">
                                    <Option value="NEW">New Registry</Option>
                                    <Option value="ONGOING">Ongoing Flow</Option>
                                    <Option value="COMPLETED">Finalized Node</Option>
                                </Select>
                            </Form.Item>
                        </Col>
                    </Row>

                    <Divider className="my-10 opacity-50" />

                    <div className="flex items-center gap-3 mb-10">
                        <DollarCircleOutlined className="text-blue-500 text-xl" />
                        <h3 className={`text-xl font-black tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Financial Parameters</h3>
                    </div>

                    <Row gutter={[48, 32]}>
                        <Col xs={24} md={24}>
                            <Form.Item
                                name="contractValue"
                                label={<span className="font-bold text-slate-400 uppercase text-[10px] tracking-widest\">Agreed Valuation</span>}
                            >
                                <Input
                                    prefix={<span className="text-slate-300 font-bold mr-2 text-lg">$</span>}
                                    placeholder="Enter numerical value..."
                                    className="h-14 !rounded-2xl text-xl font-black tracking-tight"
                                />
                            </Form.Item>
                        </Col>
                    </Row>
                </div>

                <div className="flex items-center justify-end gap-6 pt-4">
                    <Button
                        size="large"
                        shape="round"
                        icon={<CloseOutlined />}
                        onClick={() => navigate('/projects')}
                        className={`h-16 px-10 font-black tracking-widest uppercase text-[10px] border-none shadow-lg ${isDarkMode ? 'bg-gray-900 text-slate-400 hover:text-white' : 'bg-white text-slate-500'}`}
                    >
                        Abort
                    </Button>
                    <Button
                        type="primary"
                        htmlType="submit"
                        size="large"
                        shape="round"
                        icon={<SaveOutlined />}
                        loading={mutation.isPending}
                        className="h-16 px-12 font-black tracking-widest uppercase text-[10px] bg-black dark:bg-blue-600 border-none shadow-2xl shadow-blue-500/30 hover:scale-105 transition-transform text-white"
                    >
                        Commit Transaction
                    </Button>
                </div>
            </Form>
        </div>
    );
};

export default ProjectForm;
