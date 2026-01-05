import { useEffect, useRef, useState } from 'react';
import {
    Button,
    Input,
    Spin,
    Typography,
    Divider,
    Card,
    Avatar,
    Space,
    ConfigProvider,
    theme,
    Empty,
    Layout,
} from 'antd';
import {
    SendOutlined,
    RobotOutlined,
    UserOutlined,
    EnvironmentOutlined,
    ThunderboltOutlined,
    SearchOutlined,
    MessageOutlined,
    BulbOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { callCareerChatAI, callGetChatHistory } from '@/config/ai.api';
import { callFetchJobsByIds } from '@/config/api';
import { getLocationName } from '@/config/utils';

const { Text, Title } = Typography;
const { Content, Header, Footer } = Layout;

// Định nghĩa Interface để tránh lỗi gạch đỏ Typescript
interface ChatMessage {
    id: string;
    role: 'user' | 'assistant';
    message: string;
    loading?: boolean;
    analysis?: string[];
    follow_up_questions?: string[];
    jobs?: any[];
}

const ClientChatPage = () => {
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState('');
    const [sending, setSending] = useState(false);

    const bottomRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();

    // Fetch lịch sử chat
    useEffect(() => {
        const fetchHistory = async () => {
            const res = await callGetChatHistory();
            if (res?.data) {
                setMessages(res.data.map((m: any) => ({
                    id: crypto.randomUUID(),
                    role: m.role,
                    message: m.content,
                })));
            }
        };
        fetchHistory();
    }, []);

    // Tự động cuộn xuống khi có tin nhắn mới
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim() || sending) return;
        const currentInput = input;
        setInput('');

        const userMsg: ChatMessage = { id: crypto.randomUUID(), role: 'user', message: currentInput };
        const aiTempId = crypto.randomUUID();
        const aiTempMsg: ChatMessage = { id: aiTempId, role: 'assistant', message: '', loading: true };

        setMessages(prev => [...prev, userMsg, aiTempMsg]);
        setSending(true);

        try {
            const res = await callCareerChatAI(currentInput);
            const data = res?.data;

            let fetchedJobs: any[] = [];
            // Kiểm tra và fetch dữ liệu job chi tiết từ ID
            if (data?.suggested_jobs && data.suggested_jobs.length > 0) {
                const jobRes = await callFetchJobsByIds(data.suggested_jobs);
                fetchedJobs = jobRes?.data ?? [];
            }

            setMessages(prev => prev.map(m => m.id === aiTempId ? {
                ...m,
                message: data?.reply || "",
                analysis: data?.analysis || [],
                follow_up_questions: data?.follow_up_questions || [],
                jobs: fetchedJobs,
                loading: false,
            } : m));

        } catch (error) {
            console.error("Chat Error:", error);
            setMessages(prev => prev.map(m => m.id === aiTempId ? {
                ...m,
                message: '⚠️ Không thể kết nối với trí tuệ nhân tạo. Vui lòng thử lại sau.',
                loading: false
            } : m));
        } finally {
            setSending(false);
        }
    };

    return (
        <ConfigProvider
            theme={{
                algorithm: isDarkMode ? theme.darkAlgorithm : theme.defaultAlgorithm,
                token: { colorPrimary: '#1677ff', borderRadius: 12 },
            }}
        >
            <Layout style={{
                height: 'calc(100vh - 40px)',
                maxWidth: 1000,
                margin: '20px auto',
                borderRadius: 16,
                overflow: 'hidden',
                background: isDarkMode ? '#141414' : '#fff',
                boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                border: `1px solid ${isDarkMode ? '#303030' : '#f0f0f0'}`
            }}>
                <Header style={{
                    background: isDarkMode ? '#1d1d1d' : '#fff',
                    padding: '0 24px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    borderBottom: `1px solid ${isDarkMode ? '#303030' : '#f0f0f0'}`
                }}>
                    <Space>
                        <Avatar size="large" style={{ backgroundColor: '#52c41a' }} icon={<RobotOutlined />} />
                        <Title level={5} style={{ margin: 0 }}>Career Advisor AI</Title>
                    </Space>
                    <Button
                        type="text"
                        shape="circle"
                        icon={isDarkMode ? <BulbOutlined /> : <ThunderboltOutlined style={{ color: '#fadb14' }} />}
                        onClick={() => setIsDarkMode(!isDarkMode)}
                    />
                </Header>

                <Content style={{
                    padding: '24px',
                    overflowY: 'auto',
                    background: isDarkMode ? '#000' : '#f9f9f9',
                }}>
                    {messages.length === 0 && <Empty description="Bắt đầu cuộc trò chuyện tư vấn sự nghiệp..." style={{ marginTop: 100 }} />}

                    {messages.map((msg) => (
                        <div key={msg.id} style={{
                            display: 'flex',
                            flexDirection: msg.role === 'user' ? 'row-reverse' : 'row',
                            marginBottom: 30,
                            gap: 12
                        }}>
                            <Avatar
                                icon={msg.role === 'user' ? <UserOutlined /> : <RobotOutlined />}
                                style={{ backgroundColor: msg.role === 'user' ? '#1677ff' : '#52c41a', flexShrink: 0 }}
                            />

                            <div style={{
                                maxWidth: '85%',
                                width: '100%',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start'
                            }}>
                                {/* 1. REPLY MESSAGE */}
                                <div style={{
                                    padding: '12px 16px',
                                    borderRadius: 16,
                                    fontSize: 15,
                                    background: msg.role === 'user' ? '#1677ff' : (isDarkMode ? '#1d1d1d' : '#fff'),
                                    color: msg.role === 'user' ? '#fff' : (isDarkMode ? '#e0e0e0' : '#333'),
                                    boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
                                    border: msg.role === 'user' ? 'none' : `1px solid ${isDarkMode ? '#303030' : '#eee'}`,
                                    borderTopRightRadius: msg.role === 'user' ? 4 : 16,
                                    borderTopLeftRadius: msg.role === 'assistant' ? 4 : 16,
                                }}>
                                    {msg.loading ? <Spin size="small" /> : msg.message}
                                </div>

                                {/* 2. ANALYSIS SECTION */}
                                {!msg.loading && msg.analysis && msg.analysis.length > 0 && (
                                    <div style={{
                                        marginTop: 12,
                                        padding: '12px',
                                        borderRadius: 12,
                                        background: isDarkMode ? 'rgba(255,255,255,0.05)' : '#f0f7ff',
                                        borderLeft: '4px solid #1677ff',
                                        width: '100%',
                                        maxWidth: 650
                                    }}>
                                        <Space style={{ marginBottom: 8 }}>
                                            <SearchOutlined style={{ color: '#1677ff' }} />
                                            <Text strong style={{ fontSize: 11, color: '#1677ff', textTransform: 'uppercase' }}>AI Analysis</Text>
                                        </Space>
                                        {msg.analysis.map((item, idx) => (
                                            <div key={idx} style={{ display: 'flex', gap: 8, marginBottom: 4 }}>
                                                <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#52c41a', marginTop: 8, flexShrink: 0 }} />
                                                <Text style={{ fontSize: 13, color: isDarkMode ? '#aaa' : '#555' }}>{item}</Text>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* 3. SUGGESTED JOBS SECTION */}
                                {!msg.loading && msg.jobs && msg.jobs.length > 0 && (
                                    <div style={{ marginTop: 16, width: '100%' }}>
                                        <Divider orientation="left" plain style={{ margin: '10px 0' }}>
                                            <Space>
                                                <ThunderboltOutlined style={{ color: '#faad14' }} />
                                                <Text style={{ fontSize: 13, fontWeight: 600 }}>Việc làm gợi ý</Text>
                                            </Space>
                                        </Divider>
                                        <div style={{
                                            display: 'grid',
                                            gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
                                            gap: 12
                                        }}>
                                            {msg.jobs.map((job: any) => (
                                                <Card
                                                    key={job._id}
                                                    hoverable
                                                    size="small"
                                                    style={{
                                                        borderRadius: 10,
                                                        border: `1px solid ${isDarkMode ? '#303030' : '#f0f0f0'}`,
                                                        background: isDarkMode ? '#1f1f1f' : '#fff'
                                                    }}
                                                    onClick={() => navigate(`/job/${job._id}`)}
                                                >
                                                    <Text strong style={{ display: 'block', marginBottom: 4 }} ellipsis={{ tooltip: job.name }}>
                                                        {job.name}
                                                    </Text>
                                                    <Space direction="vertical" size={0} style={{ width: '100%' }}>
                                                        <Text type="secondary" style={{ fontSize: 12 }}>
                                                            <EnvironmentOutlined /> {getLocationName(job.location)}
                                                        </Text>
                                                        <Text type="danger" strong style={{ fontSize: 13 }}>
                                                            {job.salary ? `${job.salary.toLocaleString()} đ` : 'Thỏa thuận'}
                                                        </Text>
                                                    </Space>
                                                </Card>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* 4. FOLLOW UP QUESTIONS SECTION */}
                                {!msg.loading && msg.follow_up_questions && msg.follow_up_questions.length > 0 && (
                                    <div style={{ marginTop: 16, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                                        {msg.follow_up_questions.map((q, idx) => (
                                            <Button
                                                key={idx}
                                                size="small"
                                                shape="round"
                                                icon={<MessageOutlined style={{ fontSize: 10 }} />}
                                                onClick={() => setInput(q)}
                                                style={{ fontSize: 13, height: 'auto', padding: '4px 12px' }}
                                            >
                                                {q}
                                            </Button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                    <div ref={bottomRef} style={{ height: 1 }} />
                </Content>

                <Footer style={{
                    background: isDarkMode ? '#1d1d1d' : '#fff',
                    padding: '16px 24px',
                    borderTop: `1px solid ${isDarkMode ? '#303030' : '#f0f0f0'}`
                }}>
                    <Space.Compact style={{ width: '100%' }}>
                        <Input
                            size="large"
                            placeholder="Nhập câu hỏi tư vấn sự nghiệp..."
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            onPressEnter={handleSend}
                            disabled={sending}
                        />
                        <Button size="large" type="primary" icon={<SendOutlined />} onClick={handleSend} loading={sending}>
                            Gửi
                        </Button>
                    </Space.Compact>
                </Footer>
            </Layout>
        </ConfigProvider>
    );
};

export default ClientChatPage;