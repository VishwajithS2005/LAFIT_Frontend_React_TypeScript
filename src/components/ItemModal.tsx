import React, { useState, useEffect, useRef } from 'react';
import type { Item, ItemType, ItemRequest } from '../types/Items';
import type { ActionType } from '../types/Claims';
import './Modals.css';

interface ItemModalProps {
    isOpen: boolean;
    mode: 'add' | 'edit' | 'view';
    activeItem: Item | null;
    currentUserUsername?: string;
    onClose: () => void;
    onSubmit: (itemData: ItemRequest) => Promise<void>;
    onClaim?: (itemId: string, actionType: ActionType) => Promise<void>;
    onDelete?: (itemId: string) => Promise<void>;
}

export default function ItemModal({ isOpen, mode, activeItem, currentUserUsername, onClose, onSubmit, onClaim, onDelete }: ItemModalProps) {
    const [imageLink, setImageLink] = useState('');
    const descriptionRef = useRef<HTMLTextAreaElement>(null);

    const resizeTextarea = () => {
        const el = descriptionRef.current;
        if (el) {
            el.style.height = '0px';
            el.style.height = `${el.scrollHeight + 2}px`;
        }
    };

    useEffect(() => {
        if (isOpen) {
            setImageLink(activeItem?.imageLink || '');

            const timeoutId = setTimeout(() => {
                resizeTextarea();
            }, 50);

            return () => clearTimeout(timeoutId);
        }
    }, [isOpen, activeItem]);

    if (!isOpen) return null;

    const isReadOnly = mode === 'view' || activeItem?.status === 'RESOLVED';
    const title = mode === 'add' ? 'Add New Item' : (isReadOnly ? 'Item Details' : 'Edit Item');
    const canClaim = isReadOnly && activeItem && currentUserUsername !== activeItem.username && activeItem.status !== 'RESOLVED';

    const canDelete = mode === 'edit' && activeItem && (activeItem.status === 'PENDING' || activeItem.status === 'REJECTED');

    const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);

        const itemData: ItemRequest = {
            itemName: formData.get('itemName') as string,
            itemDescription: formData.get('itemDescription') as string,
            imageLink: formData.get('imageLink') as string,
            itemLocation: formData.get('itemLocation') as string,
            type: formData.get('type') as ItemType,
        };

        await onSubmit(itemData);
    };

    const handleClaimClick = () => {
        if (!activeItem || !onClaim) return;
        const actionType: ActionType = activeItem.type === 'FOUND' ? 'CLAIMING_FOUND_ITEM' : 'RETURNING_LOST_ITEM';
        onClaim(activeItem.id, actionType);
    };

    const handleDeleteClick = async () => {
        if (activeItem && onDelete) {
            await onDelete(activeItem.id);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content modal-wide" onClick={e => e.stopPropagation()}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3>{title}</h3>
                    {activeItem?.status === 'RESOLVED' && (
                        <span className="badge resolved" style={{ marginTop: 0 }}>RESOLVED - LOCKED</span>
                    )}
                </div>

                <form onSubmit={handleSubmit} className="form-group">
                    <div className="modal-body-split">

                        <div className="form-fields">
                            <div className="input-wrapper">
                                <input
                                    name="itemName"
                                    defaultValue={activeItem?.itemName || ''}
                                    placeholder="Item Name"
                                    required
                                    disabled={isReadOnly}
                                    className={isReadOnly ? 'disabled-input' : ''}
                                />
                            </div>

                            <div className="input-wrapper">
                                <textarea
                                    name="itemDescription"
                                    ref={descriptionRef}
                                    defaultValue={activeItem?.itemDescription || ''}
                                    placeholder="Description"
                                    required
                                    readOnly={isReadOnly}
                                    onChange={resizeTextarea}
                                    className={`custom-textarea ${isReadOnly ? 'disabled-input' : ''}`}
                                    rows={1}
                                    style={{ minHeight: '48px', overflow: 'hidden' }}
                                />
                            </div>

                            <div className="input-wrapper">
                                <input
                                    name="itemLocation"
                                    defaultValue={activeItem?.itemLocation || ''}
                                    placeholder="Location"
                                    required
                                    disabled={isReadOnly}
                                    className={isReadOnly ? 'disabled-input' : ''}
                                />
                            </div>
                            <div className="input-wrapper">
                                <input
                                    name="imageLink"
                                    value={imageLink}
                                    onChange={(e) => setImageLink(e.target.value)}
                                    placeholder="Image Link (URL)"
                                    disabled={isReadOnly}
                                    className={isReadOnly ? 'disabled-input' : ''}
                                />
                            </div>
                            <div className="input-wrapper">
                                <select
                                    name="type"
                                    defaultValue={activeItem?.type || "LOST"}
                                    disabled={isReadOnly}
                                    className={`custom-select ${isReadOnly ? 'disabled-input' : ''}`}
                                >
                                    <option value="LOST">Lost</option>
                                    <option value="FOUND">Found</option>
                                </select>
                            </div>

                            {activeItem && (
                                <>
                                    <div className="input-wrapper">
                                        <input value={activeItem.username} title="Username (Fixed)" disabled className="disabled-input" />
                                    </div>
                                    <div className="input-wrapper">
                                        <input value={activeItem.email} title="Email (Fixed)" disabled className="disabled-input" />
                                    </div>
                                </>
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
                        {!isReadOnly && <button type="submit">Save</button>}

                        {canClaim && (
                            <button type="button" onClick={handleClaimClick} className="claim-action-btn">
                                {activeItem.type === 'FOUND' ? 'Claim Found Item' : 'Return Lost Item'}
                            </button>
                        )}

                        {canDelete && (
                            <button type="button" onClick={handleDeleteClick} className="delete-action-btn">
                                Delete Item
                            </button>
                        )}

                        <button type="button" onClick={onClose} className="cancel-btn">Close</button>
                    </div>
                </form>
            </div>
        </div>
    );
}