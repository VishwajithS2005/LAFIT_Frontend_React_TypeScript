import type { ResolutionClaim } from '../types/Claims';
import './Modals.css';

interface ClaimModalProps {
    isOpen: boolean;
    claim: ResolutionClaim | null;
    canDelete?: boolean;
    onClose: () => void;
    onDelete?: (claimId: string) => Promise<void>;
}

export default function ClaimModal({ isOpen, claim, canDelete, onClose, onDelete }: ClaimModalProps) {
    if (!isOpen || !claim) return null;

    const isDeletable = canDelete && (claim.status === 'PENDING' || claim.status === 'REJECTED');

    const handleDelete = async () => {
        if (onDelete && claim) {
            await onDelete(claim.id);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content modal-wide" onClick={e => e.stopPropagation()}>
                <h3>Claim Details</h3>
                
                <div className="form-group">
                    <div className="modal-body-split">
                        
                        <div className="form-fields claim-details-text">
                            <div className="detail-row">
                                <span className="detail-label">Item Name</span>
                                <span className="detail-value">{claim.itemName}</span>
                            </div>
                            <div className="detail-row">
                                <span className="detail-label">Description</span>
                                <span className="detail-value">{claim.itemDescription || 'N/A'}</span>
                            </div>
                            <div className="detail-row">
                                <span className="detail-label">Location</span>
                                <span className="detail-value">{claim.itemLocation || 'N/A'}</span>
                            </div>
                            
                            <hr className="detail-divider" />
                            
                            <div className="detail-row">
                                <span className="detail-label">Action Status</span>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                                    <span className="detail-value">{claim.actionType}</span>
                                    <span className={`badge ${claim.status.toLowerCase()}`}>{claim.status}</span>
                                </div>
                            </div>
                            <div className="detail-row">
                                <span className="detail-label">Reported By</span>
                                <span className="detail-value">{claim.reportedByUsername} ({claim.reportedByEmail})</span>
                            </div>
                            <div className="detail-row">
                                <span className="detail-label">Claimant</span>
                                <span className="detail-value">{claim.claimantUsername} ({claim.claimantEmail})</span>
                            </div>
                        </div>

                        <div className="image-preview-container">
                            {claim.imageLink ? (
                                <img src={claim.imageLink} alt="Item" className="image-preview" />
                            ) : (
                                <span className="image-placeholder">No Image Available</span>
                            )}
                        </div>
                    </div>

                    <div className="button-group">
                        {isDeletable && (
                            <button type="button" onClick={handleDelete} className="delete-action-btn">
                                Delete Claim
                            </button>
                        )}
                        <button type="button" onClick={onClose} className="cancel-btn">Close</button>
                    </div>
                </div>
            </div>
        </div>
    );
}