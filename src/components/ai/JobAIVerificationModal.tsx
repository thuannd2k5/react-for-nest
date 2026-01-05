import { Modal, Spin, Tag, Divider } from 'antd';
import { JobAIVerification } from '@/types/ai';

interface Props {
    open: boolean;
    loading: boolean;
    data?: JobAIVerification | null;
    onClose: () => void;
}

const JobAIVerificationModal = ({
    open,
    loading,
    data,
    onClose,
}: Props) => {
    return (
        <Modal
            open={open}
            onCancel={onClose}
            footer={null}
            title="AI đánh giá tin tuyển dụng"
            destroyOnClose
        >
            {loading && <Spin />}

            {!loading && data && (
                <>
                    <Tag
                        color={
                            data.job_legitimacy === 'hợp lý'
                                ? 'green'
                                : data.job_legitimacy === 'đáng ngờ'
                                    ? 'orange'
                                    : 'red'
                        }
                    >
                        {data.job_legitimacy}
                    </Tag>

                    <p style={{ marginTop: 10 }}>
                        <b>Độ tin cậy:</b>{' '}
                        {typeof data.confidence === 'number'
                            ? Math.min(data.confidence, 95)
                            : 'Không xác định'}
                        %
                    </p>

                    <Divider />

                    <b>Dấu hiệu rủi ro:</b>
                    <ul>
                        {data.risk_reasons.map((r, i) => (
                            <li key={i}>⚠ {r}</li>
                        ))}
                    </ul>

                    <Divider />

                    <b>Phù hợp với:</b>
                    <ul>
                        {data.suitable_for.map((r, i) => (
                            <li key={i}>{r}</li>
                        ))}
                    </ul>

                    <Divider />

                    <b>Kỹ năng cần có:</b>

                    <b>• Kỹ năng chuyên môn:</b>
                    <ul>
                        {data.required_skills.hard_skills.map((r, i) => (
                            <li key={`hard-${i}`}>{r}</li>
                        ))}
                    </ul>

                    <b>• Kỹ năng mềm:</b>
                    <ul>
                        {data.required_skills.soft_skills.map((r, i) => (
                            <li key={`soft-${i}`}>{r}</li>
                        ))}
                    </ul>

                    <Divider />

                    <b>Yêu cầu ngoại ngữ:</b>{' '}
                    {data.language_requirement.required
                        ? data.language_requirement.languages.join(', ')
                        : 'Không yêu cầu'}

                    <Divider />

                    <b>Khuyến nghị:</b>
                    <ul>
                        {data.recommendations.map((r, i) => (
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
    );
};

export default JobAIVerificationModal;
