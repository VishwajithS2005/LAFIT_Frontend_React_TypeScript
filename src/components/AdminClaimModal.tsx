import { useEffect } from 'react';
import type { ResolutionClaim } from '../types/Claims';
import './Modals.css';

interface AdminClaimModalProps {
    isOpen: boolean;
    claim: ResolutionClaim | null;
    onClose: () => void;
    onAccept: (claimId: string) => Promise<void>;
    onReject: (claimId: string) => Promise<void>;
    onDelete: (claimId: string) => Promise<void>;
}

export default function AdminClaimModal({ isOpen, claim, onClose, onAccept, onReject, onDelete }: AdminClaimModalProps) {

    useEffect(() => {
        if (!isOpen) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                const activeEl = document.activeElement;

                const isInputFocused = activeEl && ['INPUT', 'TEXTAREA', 'SELECT'].includes(activeEl.tagName);

                if (isInputFocused) {
                    (activeEl as HTMLElement).blur();

                    e.preventDefault();
                    e.stopPropagation();
                    e.stopImmediatePropagation();
                } else {
                    onClose();
                }
            }
        };

        document.addEventListener('keydown', handleKeyDown, { capture: true });

        return () => {
            document.removeEventListener('keydown', handleKeyDown, { capture: true });
        };
    }, [isOpen, onClose]);

    if (!isOpen || !claim) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content modal-wide" onClick={e => e.stopPropagation()}>
                <h3>Manage Claim (Admin)</h3>

                <div className="form-group">
                    <div className="modal-body-split">
                        <div className="form-fields claim-details-text">
                            <div className="detail-row"><span className="detail-label">Item Name</span><span className="detail-value">{claim.itemName}</span></div>
                            <div className="detail-row"><span className="detail-label">Description</span><span className="detail-value">{claim.itemDescription || 'N/A'}</span></div>
                            <hr className="detail-divider" />
                            <div className="detail-row">
                                <span className="detail-label">Action Status</span>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                                    <span className="detail-value">{claim.actionType}</span>
                                    <span className={`badge ${claim.status.toLowerCase()}`}>{claim.status}</span>
                                </div>
                            </div>
                            <div className="detail-row"><span className="detail-label">Reported By</span><span className="detail-value">{claim.reportedByUsername}</span></div>
                            <div className="detail-row"><span className="detail-label">Claimant</span><span className="detail-value">{claim.claimantUsername}</span></div>
                        </div>

                        <div className="image-preview-container">
                            {claim.imageLink ? <img src={claim.imageLink} alt="Item" className="image-preview" /> : <span className="image-placeholder">No Image</span>}
                        </div>
                    </div>

                    <div className="button-group">
                        {claim.status === 'PENDING' && (
                            <>
                                <button type="button" onClick={() => onAccept(claim.id)} className="claim-action-btn">Accept Claim</button>
                                <button type="button" onClick={() => onReject(claim.id)} style={{ backgroundColor: '#f97316', color: 'white', border: 'none', borderRadius: '8px', padding: '12px 24px', fontWeight: 600, cursor: 'pointer' }}>Reject Claim</button>
                            </>
                        )}
                        <button type="button" onClick={() => onDelete(claim.id)} className="delete-action-btn">Delete Claim</button>
                        <button type="button" onClick={onClose} className="cancel-btn">Close</button>
                    </div>
                </div>
            </div>
        </div>
    );
}