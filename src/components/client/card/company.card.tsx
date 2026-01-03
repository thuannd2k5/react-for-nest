import { callFetchCompany } from '@/config/api';
import { callAnalyzeCompanyAI } from '@/config/ai.api';
import { convertSlug } from '@/config/utils';
import { ICompany } from '@/types/backend';
import { Card, Col, Divider, Empty, Pagination, Row, Spin, Modal, Tag } from 'antd';
import { useState, useEffect } from 'react';
import { isMobile } from 'react-device-detect';
import { Link, useNavigate } from 'react-router-dom';
import styles from 'styles/client.module.scss';

interface IProps {
    showPagination?: boolean;
}

type CompanyAIVerification = {
    verdict: 'legitimate' | 'suspicious' | 'likely_fake';
    confidence: number;
    reasons: string[];
    red_flags: string[];
    recommendations: string[];
};

/* ================= CONSTANTS ================= */

const verdictColorMap: Record<CompanyAIVerification['verdict'], string> = {
    legitimate: 'green',
    suspicious: 'orange',
    likely_fake: 'red',
};

const verdictLabelMap: Record<CompanyAIVerification['verdict'], string> = {
    legitimate: 'Đáng tin cậy',
    suspicious: 'Đáng ngờ',
    likely_fake: 'Rủi ro cao',
};

/* ================= COMPONENT ================= */

const CompanyCard = (props: IProps) => {
    const { showPagination = false } = props;

    /* ===== LIST COMPANY STATE ===== */
    const [displayCompany, setDisplayCompany] = useState<ICompany[] | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const [current, setCurrent] = useState(1);
    const [pageSize, setPageSize] = useState(4);
    const [total, setTotal] = useState(0);
    const [filter, setFilter] = useState('');
    const [sortQuery, setSortQuery] = useState('sort=-updatedAt');

    /* ===== AI CHECK STATE ===== */
    const [checkingCompanyId, setCheckingCompanyId] = useState<string | null>(null);
    const [aiLoading, setAiLoading] = useState(false);
    const [aiResult, setAiResult] = useState<CompanyAIVerification | null>(null);

    const navigate = useNavigate();

    /* ================= EFFECT ================= */

    useEffect(() => {
        fetchCompany();
    }, [current, pageSize, filter, sortQuery]);

    /* ================= HANDLERS ================= */

    const fetchCompany = async () => {
        setIsLoading(true);

        let query = `current=${current}&pageSize=${pageSize}`;
        if (filter) query += `&${filter}`;
        if (sortQuery) query += `&${sortQuery}`;

        const res = await callFetchCompany(query);
        if (res && res.data) {
            setDisplayCompany(res.data.result);
            setTotal(res.data.meta.total);
        }

        setIsLoading(false);
    };

    const handleOnchangePage = (pagination: {
        current: number;
        pageSize: number;
    }) => {
        if (pagination.current !== current) setCurrent(pagination.current);
        if (pagination.pageSize !== pageSize) {
            setPageSize(pagination.pageSize);
            setCurrent(1);
        }
    };

    const handleViewDetailCompany = (item: ICompany) => {
        const slug = convertSlug(item.name);
        navigate(`/company/${slug}?id=${item._id}`);
    };

    /* ===== AI CHECK ===== */

    const handleCheckCompanyAI = async (companyId: string) => {
        setCheckingCompanyId(companyId);
        setAiLoading(true);
        setAiResult(null);

        try {
            const res = await callAnalyzeCompanyAI(companyId);
            console.log('AI RAW RESPONSE:', res);

            const aiVerification = res.data.ai_verification;

            if (aiVerification) {
                setAiResult(aiVerification);
            }
        } finally {
            setAiLoading(false);
        }
    };



    const handleCloseModal = () => {
        setCheckingCompanyId(null);
        setAiResult(null);
        setAiLoading(false);
    };

    /* ================= RENDER ================= */

    return (
        <div className={styles['company-section']}>
            <div className={styles['company-content']}>
                <Spin spinning={isLoading} tip="Loading...">
                    <Row gutter={[20, 20]}>
                        <Col span={24}>
                            <div
                                className={isMobile ? styles['dflex-mobile'] : styles['dflex-pc']}
                            >
                                <span className={styles['title']}>
                                    Nhà Tuyển Dụng Hàng Đầu
                                </span>
                                {!showPagination && <Link to="company">Xem tất cả</Link>}
                            </div>
                        </Col>

                        {displayCompany?.map((item) => (
                            <Col span={24} md={6} key={item._id}>
                                <Card
                                    hoverable
                                    style={{ height: 350, position: 'relative' }}
                                    onClick={() => handleViewDetailCompany(item)}
                                    cover={
                                        <div
                                            className={styles['card-customize']}
                                            style={{ position: 'relative' }}
                                        >
                                            <img
                                                alt={item.name}
                                                src={`${import.meta.env.VITE_BACKEND_URL}/images/company/${item.logo}`}
                                                style={{ height: 200, width: 200 }}
                                            />

                                            {/* ===== AI CHECK ICON ===== */}
                                            <div
                                                onClick={(e) => {
                                                    e.stopPropagation(); // RẤT QUAN TRỌNG
                                                    handleCheckCompanyAI(item._id);
                                                }}
                                                title="AI kiểm tra độ tin cậy"
                                                style={{
                                                    position: 'absolute',
                                                    top: 275,
                                                    background: '#fff',
                                                    borderRadius: '20%',
                                                    padding: 1,
                                                    cursor: 'pointer',
                                                    boxShadow: '0 2px 8px rgba(212, 9, 9, 0.15)',
                                                    fontSize: 30,
                                                }}
                                            >
                                                🤖
                                            </div>
                                        </div>
                                    }
                                >
                                    <Divider />
                                    <h3 style={{ textAlign: 'center' }}>{item.name}</h3>
                                </Card>
                            </Col>
                        ))}

                        {(!displayCompany || displayCompany.length === 0) && !isLoading && (
                            <div className={styles['empty']}>
                                <Empty description="Không có dữ liệu" />
                            </div>
                        )}
                    </Row>

                    {showPagination && (
                        <>
                            <div style={{ marginTop: 30 }} />
                            <Row style={{ display: 'flex', justifyContent: 'center' }}>
                                <Pagination
                                    current={current}
                                    total={total}
                                    pageSize={pageSize}
                                    responsive
                                    onChange={(p, s) =>
                                        handleOnchangePage({ current: p, pageSize: s })
                                    }
                                />
                            </Row>
                        </>
                    )}
                </Spin>
            </div>

            {/* ================= AI RESULT MODAL ================= */}
            <Modal
                open={!!checkingCompanyId}
                onCancel={handleCloseModal}
                footer={null}
                title="AI đánh giá độ tin cậy công ty"
                destroyOnClose
            >
                {aiLoading && <Spin />}

                {aiResult && (
                    <>
                        <Tag color={verdictColorMap[aiResult.verdict]}>
                            {verdictLabelMap[aiResult.verdict]}
                        </Tag>

                        <p style={{ marginTop: 10 }}>
                            <b>Độ tin cậy:</b> {Math.min(aiResult.confidence, 95)}%
                        </p>

                        <Divider />

                        <b>Lý do đánh giá:</b>
                        <ul>
                            {aiResult.reasons.map((r, i) => (
                                <li key={i}>{r}</li>
                            ))}
                        </ul>

                        {aiResult.red_flags.length > 0 && (
                            <>
                                <Divider />
                                <b>Dấu hiệu rủi ro:</b>
                                <ul>
                                    {aiResult.red_flags.map((r, i) => (
                                        <li key={i}>⚠ {r}</li>
                                    ))}
                                </ul>
                            </>
                        )}

                        {aiResult.recommendations.length > 0 && (
                            <>
                                <Divider />
                                <b>Khuyến nghị:</b>
                                <ul>
                                    {aiResult.recommendations.map((r, i) => (
                                        <li key={i}>{r}</li>
                                    ))}
                                </ul>
                            </>
                        )}

                        <Divider />
                        <small style={{ color: '#888' }}>
                            * Kết quả do AI phân tích, chỉ mang tính tham khảo.
                        </small>
                    </>
                )}
            </Modal>
        </div>
    );
};

export default CompanyCard;
