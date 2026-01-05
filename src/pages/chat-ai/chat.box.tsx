import { useEffect, useRef, useState } from 'react';
import { Button, Input, Spin, Avatar, Tooltip } from 'antd';
import {
    SendOutlined,
    RobotOutlined,
    UserOutlined,
    BulbOutlined,
    BulbFilled,
    CopyOutlined
} from '@ant-design/icons';
import {
    callCareerChatAI,
    callGetChatHistory,
} from '@/config/ai.api';
import styles from 'styles/messenger-chat.module.scss';

type ChatMessage = {
    id: string;
    role: 'user' | 'assistant';
    message: string;
    loading?: boolean;
    timestamp?: Date;
};

const ClientChatPage = () => {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState('');
    const [sending, setSending] = useState(false);
    const [darkMode, setDarkMode] = useState(false);

    const bottomRef = useRef<HTMLDivElement>(null);

    // 🔹 Load history khi vào trang
    useEffect(() => {
        const fetchHistory = async () => {
            const res = await callGetChatHistory();
            const data = res?.data ?? [];

            if (data.length > 0) {
                setMessages(
                    data.map((m: any) => ({
                        id: crypto.randomUUID(),
                        role: m.role,
                        message: m.content,
                        timestamp: new Date(m.timestamp || Date.now()),
                    }))
                );
            } else {
                // Welcome message nếu chưa có lịch sử
                const welcomeMsg: ChatMessage = {
                    id: crypto.randomUUID(),
                    role: 'assistant',
                    message: 'Xin chào! 👋 Tôi là AI tư vấn nghề nghiệp IT. Bạn có thể hỏi tôi về:\n• Lộ trình học IT\n• Kỹ năng cần thiết\n• Lựa chọn ngôn ngữ lập trình\n• Cơ hội nghề nghiệp',
                    timestamp: new Date(),
                };
                setMessages([welcomeMsg]);
            }
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
            timestamp: new Date(),
        };

        const aiTempMsg: ChatMessage = {
            id: crypto.randomUUID(),
            role: 'assistant',
            message: '',
            loading: true,
            timestamp: new Date(),
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
        } catch (error) {
            console.error('Chat error:', error);
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

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
    };

    const formatTime = (date: Date) => {
        return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div className={`${styles.chatContainer} ${darkMode ? styles.dark : styles.light}`}>
            <div className={`${styles.chatBox} ${darkMode ? styles.dark : styles.light}`}>
                {/* Header */}
                <div className={`${styles.chatHeader} ${darkMode ? styles.dark : styles.light}`}>
                    <div className={styles.headerInfo}>
                        <Avatar
                            size={45}
                            icon={<RobotOutlined />}
                            className={styles.headerAvatar}
                        />
                        <div>
                            <div className={styles.headerTitle}>
                                AI Career Advisor
                            </div>
                            <div className={styles.headerStatus}>
                                🟢 Đang hoạt động
                            </div>
                        </div>
                    </div>

                    <Button
                        type="text"
                        icon={darkMode ? <BulbOutlined /> : <BulbFilled />}
                        onClick={() => setDarkMode(!darkMode)}
                        className={styles.themeToggle}
                    />
                </div>

                {/* Messages */}
                <div className={`${styles.messagesArea} ${darkMode ? styles.dark : styles.light}`}>
                    {messages.map((msg) => (
                        <div
                            key={msg.id}
                            className={`${styles.messageRow} ${msg.role === 'user' ? styles.user : styles.assistant}`}
                        >
                            {msg.role === 'assistant' && (
                                <Avatar
                                    size={36}
                                    icon={<RobotOutlined />}
                                    className={`${styles.messageAvatar} ${styles.ai}`}
                                />
                            )}

                            <div className={styles.messageBubbleWrapper}>
                                <div
                                    className={`${styles.messageBubble} ${msg.role === 'user'
                                            ? styles.user
                                            : darkMode
                                                ? `${styles.assistant} ${styles.dark}`
                                                : `${styles.assistant} ${styles.light}`
                                        }`}
                                >
                                    {msg.loading ? (
                                        <div className={styles.loadingMessage}>
                                            <Spin size="small" />
                                            <span>AI đang suy nghĩ...</span>
                                        </div>
                                    ) : (
                                        <>
                                            {msg.message}
                                            {msg.role === 'assistant' && !msg.loading && (
                                                <Tooltip title="Copy">
                                                    <Button
                                                        type="text"
                                                        size="small"
                                                        icon={<CopyOutlined />}
                                                        onClick={() => copyToClipboard(msg.message)}
                                                        className={`${styles.copyButton} ${darkMode ? styles.dark : styles.light}`}
                                                    />
                                                </Tooltip>
                                            )}
                                        </>
                                    )}
                                </div>
                                {msg.timestamp && (
                                    <div className={`${styles.timestamp} ${msg.role === 'user' ? styles.user : styles.assistant
                                        } ${darkMode ? styles.dark : styles.light}`}>
                                        {formatTime(msg.timestamp)}
                                    </div>
                                )}
                            </div>

                            {msg.role === 'user' && (
                                <Avatar
                                    size={36}
                                    icon={<UserOutlined />}
                                    className={`${styles.messageAvatar} ${styles.user}`}
                                />
                            )}
                        </div>
                    ))}
                    <div ref={bottomRef} />
                </div>

                {/* Input */}
                <div className={`${styles.inputArea} ${darkMode ? styles.dark : styles.light}`}>
                    <div className={styles.inputWrapper}>
                        <Input.TextArea
                            value={input}
                            disabled={sending}
                            onChange={e => setInput(e.target.value)}
                            onPressEnter={(e) => {
                                if (!e.shiftKey && !sending) {
                                    e.preventDefault();
                                    handleSend();
                                }
                            }}
                            placeholder="Aa"
                            autoSize={{ minRows: 1, maxRows: 4 }}
                            className={`${styles.inputTextarea} ${darkMode ? styles.dark : styles.light}`}
                        />

                        <Button
                            type="primary"
                            shape="circle"
                            size="large"
                            icon={<SendOutlined />}
                            onClick={handleSend}
                            disabled={sending || !input.trim()}
                            className={styles.sendButton}
                        />
                    </div>
                    <div className={`${styles.inputHint} ${darkMode ? styles.dark : styles.light}`}>
                        Nhấn Enter để gửi, Shift + Enter để xuống dòng
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ClientChatPage;