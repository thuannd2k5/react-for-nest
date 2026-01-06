import { Button, Col, Form, Row, Select } from 'antd';
import { EnvironmentOutlined, MonitorOutlined } from '@ant-design/icons';
import { LOCATION_LIST, SKILLS_LIST } from '@/config/utils';
import { ProForm } from '@ant-design/pro-components';
import { useNavigate } from 'react-router-dom';

const SearchClient = () => {
    const navigate = useNavigate();
    const [form] = Form.useForm();

    const onFinish = async (values: any) => {
        const params = new URLSearchParams();

        if (values.skills?.length) {
            values.skills.forEach((skill: string) =>
                params.append('skills', skill)
            );
        }

        if (values.location?.length) {
            values.location.forEach((loc: string) =>
                params.append('location', loc)
            );
        }

        navigate(`/job?${params.toString()}`);
        return true;
    };

    return (
        <ProForm form={form} onFinish={onFinish} submitter={{ render: () => <></> }}>
            <Row gutter={[20, 20]}>
                <Col span={24}><h2>Việc Làm IT Cho Developer "Chất"</h2></Col>

                <Col span={24} md={16}>
                    <ProForm.Item name="skills">
                        <Select
                            mode="multiple"
                            allowClear
                            showArrow={false}
                            options={SKILLS_LIST}
                            placeholder={<><MonitorOutlined /> Tìm theo kỹ năng...</>}
                        />
                    </ProForm.Item>
                </Col>

                <Col span={12} md={4}>
                    <ProForm.Item name="location">
                        <Select
                            mode="multiple"
                            allowClear
                            showArrow={false}
                            options={LOCATION_LIST}
                            placeholder={<><EnvironmentOutlined /> Địa điểm...</>}
                        />
                    </ProForm.Item>
                </Col>

                <Col span={12} md={4}>
                    <Button type="primary" onClick={() => form.submit()}>
                        Search
                    </Button>
                </Col>
            </Row>
        </ProForm>
    );
};

export default SearchClient;
