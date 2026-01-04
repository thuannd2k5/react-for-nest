import { useEffect, useRef, useState } from 'react';
import { Button, Col, Input, Row, Spin, Typography } from 'antd';
import styles from 'styles/client.module.scss';
import {
    callCareerChatAI,
    callGetChatHistory,
} from '@/config/ai.api';

const { Text } = Typography;

type ChatMessage = {
    id: string;
    role: 'user' | 'assistant';
    message: string;
    loading?: boolean;
};

const ClientChatPage = () => {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState('');
    const [sending, setSending] = useState(false);

    const bottomRef = useRef<HTMLDivElement>(null);

    // 🔹 Load history khi vào trang
    useEffect(() => {
        const fetchHistory = async () => {
            const res = await callGetChatHistory();
            const data = res?.data ?? [];

            setMessages(
                data.map((m: any) => ({
                    id: crypto.randomUUID(),
                    role: m.role,
                    message: m.content,
                }))
            );
        };
        fetchHistory();
    }, []);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);


    const handleSend = async () => {
        if (!input.trim() || sending) return;

        const userMsg: ChatMessage = {
            id: crypto.randomUUID(),
            role: 'user',
            message: input,
        };

        const aiTempMsg: ChatMessage = {
            id: crypto.randomUUID(),
            role: 'assistant',
            message: '🤖 AI đang suy nghĩ...',
            loading: true,
        };

        setMessages(prev => [...prev, userMsg, aiTempMsg]);
        setInput('');
        setSending(true);

        try {
            const res = await callCareerChatAI(input);
            console.log('CHAT AI RESPONSE:', res.data);

            const reply = res?.data?.reply ?? 'AI không có phản hồi.';

            setMessages(prev =>
                prev.map(m =>
                    m.id === aiTempMsg.id
                        ? { ...m, message: reply, loading: false }
                        : m,
                ),
            );
        } catch {
            setMessages(prev =>
                prev.map(m =>
                    m.id === aiTempMsg.id
                        ? {
                            ...m,
                            message: '⚠️ Có lỗi xảy ra, vui lòng thử lại.',
                            loading: false,
                        }
                        : m,
                ),
            );
        } finally {
            setSending(false);
        }
    };


    return (
        <div className={styles['container']} style={{ marginTop: 20 }}>
            <Row gutter={[20, 20]}>
                <Col span={24}>
                    <div
                        style={{
                            border: '1px solid #eee',
                            borderRadius: 8,
                            padding: 16,
                            minHeight: 500,
                            display: 'flex',
                            flexDirection: 'column',
                        }}
                    >
                        <Text strong style={{ marginBottom: 12 }}>
                            🤖 AI tư vấn nghề nghiệp IT
                        </Text>

                        {/* Chat messages */}
                        <div style={{ flex: 1, overflowY: 'auto', marginBottom: 12 }}>
                            {messages.map(msg => (
                                <div
                                    key={msg.id}
                                    style={{
                                        textAlign: msg.role === 'user' ? 'right' : 'left',
                                        opacity: msg.loading ? 0.6 : 1,
                                    }}
                                >
                                    <div className={msg.role === 'user' ? styles.user : styles.ai}>
                                        {msg.message}
                                        {msg.loading && <Spin size="small" />}
                                    </div>
                                </div>
                            ))}
                            <div ref={bottomRef} />
                        </div>

                        {/* Input */}
                        <div style={{ display: 'flex', gap: 8 }}>
                            <Input
                                value={input}
                                disabled={sending}
                                onChange={e => setInput(e.target.value)}
                                onPressEnter={sending ? undefined : handleSend}
                                placeholder="Hỏi AI về nghề IT, kỹ năng, lộ trình..."
                            />

                            <Button
                                type="primary"
                                onClick={handleSend}
                                disabled={sending}
                            >
                                Gửi
                            </Button>
                        </div>
                    </div>
                </Col>
            </Row>
        </div>
    );
};

export default ClientChatPage;
