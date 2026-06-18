import React, { useState, useEffect, useRef } from 'react';
import type { Item, ItemType, ItemRequest } from '../types/Items';
import './Modals.css';

interface AdminItemModalProps {
    isOpen: boolean;
    activeItem: Item | null;
    onClose: () => void;
    onSubmit: (itemData: ItemRequest & { status: string }) => Promise<void>;
    onDelete: (itemId: string) => Promise<void>;
}

export default function AdminItemModal({ isOpen, activeItem, onClose, onSubmit, onDelete }: AdminItemModalProps) {
    const [imageLink, setImageLink] = useState('');
    const descriptionRef = useRef<HTMLTextAreaElement>(null);

    const resizeTextarea = () => {
        if (descriptionRef.current) {
            descriptionRef.current.style.height = '0px';
            descriptionRef.current.style.height = `${descriptionRef.current.scrollHeight + 2}px`;
        }
    };

    useEffect(() => {
        if (isOpen) {
            setImageLink(activeItem?.imageLink || '');
            const timeoutId = setTimeout(() => resizeTextarea(), 50);
            return () => clearTimeout(timeoutId);
        }
    }, [isOpen, activeItem]);

    if (!isOpen) return null;

    const isResolved = activeItem?.status === 'RESOLVED';

    const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (isResolved) return;

        const formData = new FormData(e.currentTarget);
        await onSubmit({
            itemName: formData.get('itemName') as string,
            itemDescription: formData.get('itemDescription') as string,
            imageLink: formData.get('imageLink') as string,
            itemLocation: formData.get('itemLocation') as string,
            type: formData.get('type') as ItemType,
            status: formData.get('status') as string,
        });
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content modal-wide" onClick={e => e.stopPropagation()}>

                {/* Dynamic Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <h3 style={{ margin: 0 }}>{isResolved ? 'Item Details (Locked)' : 'Edit Item (Admin)'}</h3>
                    {isResolved && (
                        <span className="badge resolved" style={{ margin: 0 }}>RESOLVED - LOCKED</span>
                    )}
                </div>

                <form onSubmit={handleSubmit} className="form-group">
                    <div className="modal-body-split">
                        <div className="form-fields">
                            <div className="input-wrapper">
                                <label className="input-label">Item Name</label>
                                <input
                                    name="itemName"
                                    defaultValue={activeItem?.itemName || ''}
                                    required
                                    disabled={isResolved}
                                    className={isResolved ? 'disabled-input' : ''}
                                />
                            </div>

                            <div className="input-wrapper">
                                <label className="input-label">Description</label>
                                <textarea
                                    name="itemDescription"
                                    ref={descriptionRef}
                                    defaultValue={activeItem?.itemDescription || ''}
                                    required
                                    readOnly={isResolved}
                                    onChange={resizeTextarea}
                                    className={`custom-textarea ${isResolved ? 'disabled-input' : ''}`}
                                    rows={1}
                                    style={{ minHeight: '48px', overflow: 'hidden' }}
                                />
                            </div>

                            <div className="input-wrapper">
                                <label className="input-label">Location</label>
                                <input
                                    name="itemLocation"
                                    defaultValue={activeItem?.itemLocation || ''}
                                    required
                                    disabled={isResolved}
                                    className={isResolved ? 'disabled-input' : ''}
                                />
                            </div>

                            <div className="input-wrapper">
                                <label className="input-label">Image Link</label>
                                <input
                                    name="imageLink"
                                    value={imageLink}
                                    onChange={(e) => setImageLink(e.target.value)}
                                    disabled={isResolved}
                                    className={isResolved ? 'disabled-input' : ''}
                                />
                            </div>

                            <div style={{ display: 'flex', gap: '16px' }}>
                                <div className="input-wrapper" style={{ flex: 1 }}>
                                    <label className="input-label">Type</label>
                                    <select
                                        name="type"
                                        defaultValue={activeItem?.type || "LOST"}
                                        disabled={isResolved}
                                        className={`custom-select ${isResolved ? 'disabled-input' : ''}`}
                                    >
                                        <option value="LOST">Lost</option>
                                        <option value="FOUND">Found</option>
                                    </select>
                                </div>
                                <div className="input-wrapper" style={{ flex: 1 }}>
                                    <label className="input-label">Status</label>
                                    <select
                                        name="status"
                                        defaultValue={activeItem?.status || "PENDING"}
                                        disabled={isResolved}
                                        className={`custom-select ${isResolved ? 'disabled-input' : ''}`}
                                    >
                                        {/* If it's already resolved, only show resolved. Otherwise, hide the resolved option completely. */}
                                        {isResolved ? (
                                            <option value="RESOLVED">Resolved</option>
                                        ) : (
                                            <>
                                                <option value="PENDING">Pending</option>
                                                <option value="APPROVED">Approved</option>
                                                <option value="REJECTED">Rejected</option>
                                            </>
                                        )}
                                    </select>
                                </div>
                            </div>

                            {activeItem && (
                                <div className="input-wrapper">
                                    <label className="input-label">Reported By (Fixed)</label>
                                    <input value={`${activeItem.username} (${activeItem.email})`} disabled className="disabled-input" />
                                </div>
                            )}
                        </div>

                        <div className="image-preview-container">
                            {imageLink ? (
                                <img src={imageLink} alt="Preview" className="image-preview" />
                            ) : (
                                <span className="image-placeholder">No Image Available</span>
                            )}
                        </div>
                    </div>

                    <div className="button-group">
                        {!isResolved && <button type="submit">Save Changes</button>}
                        {!isResolved && activeItem && (
                            <button type="button" onClick={() => onDelete(activeItem.id)} className="delete-action-btn">Delete</button>
                        )}
                        <button type="button" onClick={onClose} className="cancel-btn">Close</button>
                    </div>
                </form>
            </div>
        </div>
    );
}