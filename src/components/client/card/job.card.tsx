import { callFetchJob } from '@/config/api';
import { callAnalyzeJobAI } from '@/config/ai.api';
import { convertSlug, getLocationName } from '@/config/utils';
import { IJob } from '@/types/backend';
import { JobAIVerification } from '@/types/ai';
import { EnvironmentOutlined, ThunderboltOutlined } from '@ant-design/icons';
import { Card, Col, Empty, Pagination, Row, Spin, Modal, Tag, Divider } from 'antd';
import { useState, useEffect } from 'react';
import { isMobile } from 'react-device-detect';
import { Link, useNavigate } from 'react-router-dom';
import styles from 'styles/client.module.scss';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

interface IProps {
    showPagination?: boolean;
}

const JobCard = (props: IProps) => {
    const { showPagination = false } = props;

    /* ===== LIST JOB STATE ===== */
    const [displayJob, setDisplayJob] = useState<IJob[] | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const [current, setCurrent] = useState(1);
    const [pageSize, setPageSize] = useState(5);
    const [total, setTotal] = useState(0);
    const [filter, setFilter] = useState('');
    const [sortQuery, setSortQuery] = useState('sort=-updatedAt');

    /* ===== AI CHECK STATE ===== */
    const [checkingJobId, setCheckingJobId] = useState<string | null>(null);
    const [aiLoading, setAiLoading] = useState(false);
    const [aiResult, setAiResult] = useState<JobAIVerification | null>(null);

    const navigate = useNavigate();

    useEffect(() => {
        fetchJob();
    }, [current, pageSize, filter, sortQuery]);

    const fetchJob = async () => {
        setIsLoading(true);

        let query = `current=${current}&pageSize=${pageSize}`;
        if (filter) query += `&${filter}`;
        if (sortQuery) query += `&${sortQuery}`;

        const res = await callFetchJob(query);
        if (res && res.data) {
            setDisplayJob(res.data.result);
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

    const handleViewDetailJob = (item: IJob) => {
        const slug = convertSlug(item.name);
        navigate(`/job/${slug}?id=${item._id}`);
    };

    /* ===== AI CHECK JOB ===== */
    const handleCheckJobAI = async (jobId: string) => {
        setCheckingJobId(jobId);
        setAiLoading(true);
        setAiResult(null);

        try {
            const res = await callAnalyzeJobAI(jobId);

            // axios-customize đã unwrap 1 lần
            const aiAnalysis = res?.data?.ai_analysis;

            if (aiAnalysis) {
                setAiResult(aiAnalysis);
            }
        } finally {
            setAiLoading(false);
        }
    };

    const handleCloseModal = () => {
        setCheckingJobId(null);
        setAiResult(null);
        setAiLoading(false);
    };

    return (
        <div className={styles['card-job-section']}>
            <div className={styles['job-content']}>
                <Spin spinning={isLoading} tip="Loading...">
                    <Row gutter={[20, 20]}>
                        <Col span={24}>
                            <div className={isMobile ? styles['dflex-mobile'] : styles['dflex-pc']}>
                                <span className={styles['title']}>Công Việc Mới Nhất</span>
                                {!showPagination && <Link to="job">Xem tất cả</Link>}
                            </div>
                        </Col>

                        {displayJob?.map((item: any) => (
                            <Col span={24} md={12} key={item._id}>
                                <Card
                                    size="small"
                                    hoverable
                                    style={{ position: 'relative' }}
                                    onClick={() => handleViewDetailJob(item)}
                                >
                                    {/* ===== AI CHECK ICON ===== */}
                                    <div
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleCheckJobAI(item._id);
                                        }}
                                        title="AI kiểm tra tin tuyển dụng"
                                        style={{
                                            position: 'absolute',
                                            top: 10,
                                            right: 10,
                                            background: '#fff',
                                            borderRadius: '50%',
                                            padding: 6,
                                            cursor: 'pointer',
                                            boxShadow: '0 2px 8px rgba(0,0,0,.15)',
                                            fontSize: 16,
                                            zIndex: 2,
                                        }}
                                    >
                                        🤖
                                    </div>

                                    <div className={styles['card-job-content']}>
                                        <div className={styles['card-job-left']}>
                                            <img
                                                alt={item.name}
                                                src={`${import.meta.env.VITE_BACKEND_URL}/images/company/${item?.company?.logo}`}
                                            />
                                        </div>

                                        <div className={styles['card-job-right']}>
                                            <div className={styles['job-title']}>{item.name}</div>
                                            <div className={styles['job-location']}>
                                                <EnvironmentOutlined style={{ color: '#58aaab' }} />
                                                &nbsp;{getLocationName(item.location)}
                                            </div>
                                            <div>
                                                <ThunderboltOutlined style={{ color: 'orange' }} />
                                                &nbsp;
                                                {(item.salary + '').replace(/\B(?=(\d{3})+(?!\d))/g, ',')} đ
                                            </div>
                                            <div className={styles['job-updatedAt']}>
                                                {dayjs(item.updatedAt).fromNow()}
                                            </div>
                                        </div>
                                    </div>
                                </Card>
                            </Col>
                        ))}

                        {(!displayJob || displayJob.length === 0) && !isLoading && (
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

            {/* ===== AI RESULT MODAL ===== */}
            <Modal
                open={!!checkingJobId}
                onCancel={handleCloseModal}
                footer={null}
                title="AI đánh giá tin tuyển dụng"
                destroyOnClose
            >
                {aiLoading && <Spin />}

                {aiResult && (
                    <>
                        <Tag
                            color={
                                aiResult.job_legitimacy === 'hợp lý'
                                    ? 'green'
                                    : aiResult.job_legitimacy === 'đáng ngờ'
                                        ? 'orange'
                                        : 'red'
                            }
                        >
                            {aiResult.job_legitimacy}
                        </Tag>

                        <p style={{ marginTop: 10 }}>
                            <b>Độ tin cậy:</b> {Math.min(aiResult.confidence, 95)}%
                        </p>

                        <Divider />

                        <b>Dấu hiệu rủi ro:</b>
                        <ul>
                            {aiResult.risk_reasons.map((r, i) => (
                                <li key={i}>⚠ {r}</li>
                            ))}
                        </ul>

                        <Divider />

                        <b>Phù hợp với:</b>
                        <ul>
                            {aiResult.suitable_for.map((r, i) => (
                                <li key={i}>{r}</li>
                            ))}
                        </ul>

                        <Divider />

                        <b>Kỹ năng cần có:</b>
                        <ul>
                            {aiResult.required_skills.map((r, i) => (
                                <li key={i}>{r}</li>
                            ))}
                        </ul>

                        <Divider />

                        <b>Yêu cầu ngoại ngữ:</b>{' '}
                        {aiResult.language_requirement.required
                            ? aiResult.language_requirement.languages.join(', ')
                            : 'Không yêu cầu'}

                        <Divider />

                        <b>Khuyến nghị:</b>
                        <ul>
                            {aiResult.recommendations.map((r, i) => (
                                <li key={i}>{r}</li>
                            ))}
                        </ul>

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

export default JobCard;
