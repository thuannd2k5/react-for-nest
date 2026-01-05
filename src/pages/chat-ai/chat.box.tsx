import { useEffect, useRef, useState } from 'react';
import { Button, Col, Input, Row, Spin, Typography, Divider } from 'antd';
import styles from 'styles/client.module.scss';
import {
    callCareerChatAI,
    callGetChatHistory,
} from '@/config/ai.api';
import { CareerChatResponse } from '@/types/ai';

const { Text } = Typography;

type ChatMessage = {
    id: string;
    role: 'user' | 'assistant';
    message: string;
    analysis?: string[];
    follow_up_questions?: string[];
    loading?: boolean;
};

const ClientChatPage = () => {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState('');
    const [sending, setSending] = useState(false);

    const bottomRef = useRef<HTMLDivElement>(null);

    /* ===== LOAD HISTORY ===== */
    useEffect(() => {
        const fetchHistory = async () => {
            const res = await callGetChatHistory();
            const data = res?.data ?? [];

            setMessages(
                data.map((m: any) => ({
                    id: crypto.randomUUID(),
                    role: m.role,
                    message: m.content,
                })),
            );
        };
        fetchHistory();
    }, []);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    /* ===== SEND ===== */
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
            message: '🤖 AI đang phân tích và đưa ra lời khuyên...',
            loading: true,
        };

        setMessages(prev => [...prev, userMsg, aiTempMsg]);
        setInput('');
        setSending(true);

        try {
            const res = await callCareerChatAI(input);
            const data: CareerChatResponse = res?.data;

            setMessages(prev =>
                prev.map(m =>
                    m.id === aiTempMsg.id
                        ? {
                            ...m,
                            message: data.reply,
                            analysis: data.analysis,
                            follow_up_questions: data.follow_up_questions,
                            loading: false,
                        }
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
                            minHeight: 520,
                            display: 'flex',
                            flexDirection: 'column',
                        }}
                    >
                        <Text strong style={{ marginBottom: 12 }}>
                            🤖 AI tư vấn nghề nghiệp IT
                        </Text>

                        {/* ===== CHAT ===== */}
                        <div style={{ flex: 1, overflowY: 'auto', marginBottom: 12 }}>
                            {messages.map(msg => (
                                <div
                                    key={msg.id}
                                    style={{
                                        textAlign: msg.role === 'user' ? 'right' : 'left',
                                        marginBottom: 12,
                                    }}
                                >
                                    <div
                                        className={msg.role === 'user' ? styles.user : styles.ai}
                                        style={{ opacity: msg.loading ? 0.6 : 1 }}
                                    >
                                        {msg.message}
                                        {msg.loading && <Spin size="small" />}
                                    </div>

                                    {/* ===== AI ANALYSIS ===== */}
                                    {msg.analysis && msg.analysis.length > 0 && (
                                        <div style={{ marginTop: 6, fontSize: 13, color: '#555' }}>
                                            <b>🔍 Phân tích:</b>
                                            <ul>
                                                {msg.analysis.map((a, i) => (
                                                    <li key={i}>{a}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}

                                    {/* ===== FOLLOW UP ===== */}
                                    {msg.follow_up_questions && msg.follow_up_questions.length > 0 && (
                                        <>
                                            <Divider style={{ margin: '8px 0' }} />
                                            <div style={{ fontSize: 13 }}>
                                                <b>👉 Gợi ý câu hỏi tiếp:</b>
                                                <ul>
                                                    {msg.follow_up_questions.map((q, i) => (
                                                        <li
                                                            key={i}
                                                            style={{ cursor: 'pointer', color: '#1677ff' }}
                                                            onClick={() => setInput(q)}
                                                        >
                                                            {q}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        </>
                                    )}
                                </div>
                            ))}
                            <div ref={bottomRef} />
                        </div>

                        {/* ===== INPUT ===== */}
                        <div style={{ display: 'flex', gap: 8 }}>
                            <Input
                                value={input}
                                disabled={sending}
                                onChange={e => setInput(e.target.value)}
                                onPressEnter={sending ? undefined : handleSend}
                                placeholder="Hỏi AI về nghề IT, kỹ năng, lộ trình..."
                            />

                            <Button type="primary" onClick={handleSend} disabled={sending}>
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
