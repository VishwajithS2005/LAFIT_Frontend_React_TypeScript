import { useEffect, useState, useMemo, useRef } from 'react';
import { useItemStore } from '../stores/ItemStore';
import { useClaimStore } from '../stores/ClaimStore';
import { useAuthStore } from '../stores/AuthStore';
import type { Item, ItemRequest } from '../types/Items';
import type { ResolutionClaim, ActionType } from '../types/Claims';
import ItemModal from '../components/ItemModal';
import ClaimModal from '../components/ClaimModal';
import './UserHome.css';
import ToastContainer from '../components/ToastContainer';

import { FiMenu, FiChevronDown, FiChevronRight, FiFilter, FiList } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

type ViewState = 'dashboard' | 'your-items' | 'approved-items' | 'resolved-items' | 'your-claims' | 'approved-claims';

interface ItemModalState {
    isOpen: boolean;
    mode: 'add' | 'edit' | 'view';
    activeItem: Item | null;
}

export default function UserHome() {
    const navigate = useNavigate();
    const { logout, user } = useAuthStore();
    const { yourItems, approvedItems, resolvedItems, fetchYourItems, fetchApprovedItems, fetchResolvedItems, addItem, editItem, deleteItem } = useItemStore();
    const { yourClaims, approvedClaims, fetchYourClaims, fetchApprovedClaims, addClaim, deleteClaim } = useClaimStore();

    const [currentView, setCurrentView] = useState<ViewState>('dashboard');
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    const [isItemsOpen, setIsItemsOpen] = useState(true);
    const [isClaimsOpen, setIsClaimsOpen] = useState(true);

    const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false);
    const [isSortMenuOpen, setIsSortMenuOpen] = useState(false);

    const [itemModalState, setItemModalState] = useState<ItemModalState>({ isOpen: false, mode: 'add', activeItem: null });
    const [claimModalState, setClaimModalState] = useState<{ isOpen: boolean; claim: ResolutionClaim | null }>({ isOpen: false, claim: null });

    const [searchQuery, setSearchQuery] = useState("");
    const [searchField, setSearchField] = useState<'all' | 'itemName' | 'username'>('all');
    const [filterType, setFilterType] = useState<string>('all');
    const [statusFilter, setStatusFilter] = useState<string>('all');

    const [sortItemName, setSortItemName] = useState<'none' | 'asc' | 'desc'>('none');
    const [sortUsername, setSortUsername] = useState<'none' | 'asc' | 'desc'>('none');
    const [sortReporter, setSortReporter] = useState<'none' | 'asc' | 'desc'>('none');
    const [sortClaimant, setSortClaimant] = useState<'none' | 'asc' | 'desc'>('none');

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;

    const filterMenuRef = useRef<HTMLDivElement>(null);
    const sortMenuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (filterMenuRef.current && !filterMenuRef.current.contains(event.target as Node)) {
                setIsFilterMenuOpen(false);
            }
            if (sortMenuRef.current && !sortMenuRef.current.contains(event.target as Node)) {
                setIsSortMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        fetchYourItems();
        fetchApprovedItems();
        fetchResolvedItems();
        fetchYourClaims();
        fetchApprovedClaims();
    }, [currentView]);

    useEffect(() => {
        setCurrentPage(1);
        setFilterType('all');
        setStatusFilter('all');
        setSortItemName('none');
        setSortUsername('none');
        setSortReporter('none');
        setSortClaimant('none');
        setIsFilterMenuOpen(false);
        setIsSortMenuOpen(false);
    }, [currentView, searchQuery, searchField]);

    const openItemModal = (item: Item | null, mode: 'add' | 'edit' | 'view') => {
        setItemModalState({ isOpen: true, mode, activeItem: item });
    };

    const handleItemSubmit = async (itemData: ItemRequest) => {
        if (itemModalState.mode === 'edit' && itemModalState.activeItem) {
            await editItem(itemModalState.activeItem.id, itemData);
        } else {
            await addItem(itemData);
        }
        setItemModalState({ isOpen: false, mode: 'add', activeItem: null });
    };

    const handleDeleteItem = async (itemId: string) => {
        await deleteItem(itemId);
        setItemModalState({ isOpen: false, mode: 'add', activeItem: null });
    };

    const handleCreateClaim = async (itemId: string, actionType: ActionType) => {
        await addClaim({ itemId, actionType });
        setItemModalState({ isOpen: false, mode: 'add', activeItem: null });
        setCurrentView('your-claims');
    };

    const handleDeleteClaim = async (claimId: string) => {
        await deleteClaim(claimId);
        setClaimModalState({ isOpen: false, claim: null });
    };

    const isSortingActive = sortItemName !== 'none' || sortUsername !== 'none' || sortReporter !== 'none' || sortClaimant !== 'none';

    const { paginatedData, totalPages } = useMemo(() => {
        let baseData: any[] = [];
        const isClaimView = currentView.includes('claims');

        if (currentView === 'your-items') baseData = [...yourItems];
        else if (currentView === 'approved-items') baseData = [...approvedItems];
        else if (currentView === 'resolved-items') baseData = [...resolvedItems];
        else if (currentView === 'your-claims') baseData = [...yourClaims];
        else if (currentView === 'approved-claims') baseData = [...approvedClaims];

        if (currentView === 'dashboard') return { paginatedData: [], totalPages: 0 };

        if (searchQuery.trim() !== '') {
            const query = searchQuery.toLowerCase();
            baseData = baseData.filter((entry) => {
                const itemNameStr = (entry.itemName || '').toLowerCase();
                let usernameStr = isClaimView
                    ? `${entry.reportedByUsername || ''} ${entry.claimantUsername || ''}`.toLowerCase()
                    : (entry.username || '').toLowerCase();

                if (searchField === 'itemName') return itemNameStr.includes(query);
                if (searchField === 'username') return usernameStr.includes(query);
                return itemNameStr.includes(query) || usernameStr.includes(query);
            });
        }

        if (filterType !== 'all') {
            baseData = baseData.filter((entry) => {
                if (isClaimView) return entry.actionType === filterType;
                return entry.type === filterType;
            });
        }

        if (statusFilter !== 'all') {
            baseData = baseData.filter((entry) => entry.status === statusFilter);
        }

        if (isSortingActive) {
            baseData.sort((a, b) => {
                if (sortItemName !== 'none') {
                    const cmp = (a.itemName || '').localeCompare(b.itemName || '');
                    if (cmp !== 0) return sortItemName === 'asc' ? cmp : -cmp;
                }

                if (!isClaimView && sortUsername !== 'none') {
                    const cmp = (a.username || '').localeCompare(b.username || '');
                    if (cmp !== 0) return sortUsername === 'asc' ? cmp : -cmp;
                }

                if (isClaimView && sortReporter !== 'none') {
                    const cmp = (a.reportedByUsername || '').localeCompare(b.reportedByUsername || '');
                    if (cmp !== 0) return sortReporter === 'asc' ? cmp : -cmp;
                }

                if (currentView === 'approved-claims' && sortClaimant !== 'none') {
                    const cmp = (a.claimantUsername || '').localeCompare(b.claimantUsername || '');
                    if (cmp !== 0) return sortClaimant === 'asc' ? cmp : -cmp;
                }

                return 0;
            });
        }

        const tPages = Math.ceil(baseData.length / itemsPerPage) || 1;
        const pData = baseData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

        return { paginatedData: pData, totalPages: tPages };
    }, [currentView, yourItems, approvedItems, resolvedItems, yourClaims, approvedClaims, searchQuery, searchField, filterType, statusFilter, sortItemName, sortUsername, sortReporter, sortClaimant, currentPage]);

    return (
        <div className="dashboard-layout">
            <aside className={`sidebar ${!isSidebarOpen ? 'closed' : ''}`}>
                <h2>LAFIT</h2>
                <nav>
                    <button className={`nav-btn ${currentView === 'dashboard' ? 'active' : ''}`} onClick={() => setCurrentView('dashboard')}>Dashboard</button>

                    <div className="nav-dropdown">
                        <button className="dropdown-toggle" onClick={() => setIsItemsOpen(!isItemsOpen)}>
                            <span>Items</span>
                            {isItemsOpen ? <FiChevronDown size={18} /> : <FiChevronRight size={18} />}
                        </button>
                        {isItemsOpen && (
                            <div className="dropdown-menu">
                                <button className={currentView === 'your-items' ? 'active' : ''} onClick={() => setCurrentView('your-items')}>Your Items</button>
                                <button className={currentView === 'approved-items' ? 'active' : ''} onClick={() => setCurrentView('approved-items')}>Approved Items</button>
                                <button className={currentView === 'resolved-items' ? 'active' : ''} onClick={() => setCurrentView('resolved-items')}>Resolved Items</button>
                            </div>
                        )}
                    </div>

                    <div className="nav-dropdown">
                        <button className="dropdown-toggle" onClick={() => setIsClaimsOpen(!isClaimsOpen)}>
                            <span>Claims</span>
                            {isClaimsOpen ? <FiChevronDown size={18} /> : <FiChevronRight size={18} />}
                        </button>
                        {isClaimsOpen && (
                            <div className="dropdown-menu">
                                <button className={currentView === 'your-claims' ? 'active' : ''} onClick={() => setCurrentView('your-claims')}>Your Claims</button>
                                <button className={currentView === 'approved-claims' ? 'active' : ''} onClick={() => setCurrentView('approved-claims')}>Approved Claims</button>
                            </div>
                        )}
                    </div>
                </nav>
                <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <button className="nav-btn" onClick={() => navigate('/settings')} style={{ background: 'var(--bg-input)' }}>⚙ Settings</button>
                    <button className="logout-btn" onClick={logout}>Logout</button>
                </div>
            </aside>

            <main className={`dashboard-content ${!isSidebarOpen ? 'expanded' : ''}`}>

                <div className="main-header">
                    <button className="toggle-sidebar-btn" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
                        <FiMenu size={20} /> {isSidebarOpen ? 'Hide Menu' : 'Menu'}
                    </button>
                </div>

                {currentView === 'dashboard' && (
                    <div className="summary-cards">
                        <div className="card">
                            <h3>Total Items Submitted</h3>
                            <p className="count">{yourItems.length}</p>
                        </div>
                        <div className="card">
                            <h3>Total Claims Made</h3>
                            <p className="count">{yourClaims.length}</p>
                        </div>
                    </div>
                )}

                {currentView !== 'dashboard' && (
                    <div className="list-view">
                        <div className="header-row">
                            <h2 className="view-title">{currentView.replace('-', ' ').toUpperCase()}</h2>
                            {currentView === 'your-items' && (
                                <button className="add-btn" onClick={() => openItemModal(null, 'add')}>+ Add New Item</button>
                            )}
                        </div>

                        <div className="toolbar">
                            <div className="search-group">
                                <input
                                    type="text"
                                    placeholder="Search..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="search-input"
                                />
                                <select value={searchField} onChange={(e) => setSearchField(e.target.value as any)} className="toolbar-select">
                                    <option value="all">Search All</option>
                                    <option value="itemName">Item Name Only</option>
                                    <option value="username">Username Only</option>
                                </select>
                            </div>

                            <div className="toolbar-actions">
                                <div className="toolbar-group relative-container" ref={filterMenuRef}>
                                    <button
                                        className="custom-dropdown-btn"
                                        onClick={() => setIsFilterMenuOpen(!isFilterMenuOpen)}
                                    >
                                        <FiFilter className="toolbar-icon" size={18} />
                                        <span>Filters {(filterType !== 'all' || statusFilter !== 'all') && "•"}</span>
                                        <FiChevronDown size={14} />
                                    </button>

                                    {isFilterMenuOpen && (
                                        <div className="custom-dropdown-menu">
                                            <div className="filter-section">
                                                <h4 className="filter-heading">Type</h4>
                                                <label className="radio-label">
                                                    <input type="radio" name="type" value="all" checked={filterType === 'all'} onChange={(e) => setFilterType(e.target.value)} />
                                                    All Types
                                                </label>
                                                {!currentView.includes('claims') ? (
                                                    <>
                                                        <label className="radio-label">
                                                            <input type="radio" name="type" value="LOST" checked={filterType === 'LOST'} onChange={(e) => setFilterType(e.target.value)} />
                                                            Lost
                                                        </label>
                                                        <label className="radio-label">
                                                            <input type="radio" name="type" value="FOUND" checked={filterType === 'FOUND'} onChange={(e) => setFilterType(e.target.value)} />
                                                            Found
                                                        </label>
                                                    </>
                                                ) : (
                                                    <>
                                                        <label className="radio-label">
                                                            <input type="radio" name="type" value="CLAIMING_FOUND_ITEM" checked={filterType === 'CLAIMING_FOUND_ITEM'} onChange={(e) => setFilterType(e.target.value)} />
                                                            Claiming Found
                                                        </label>
                                                        <label className="radio-label">
                                                            <input type="radio" name="type" value="RETURNING_LOST_ITEM" checked={filterType === 'RETURNING_LOST_ITEM'} onChange={(e) => setFilterType(e.target.value)} />
                                                            Returning Lost
                                                        </label>
                                                    </>
                                                )}
                                            </div>

                                            <hr className="filter-divider" />

                                            <div className="filter-section">
                                                <h4 className="filter-heading">Status</h4>
                                                <label className="radio-label">
                                                    <input type="radio" name="status" value="all" checked={statusFilter === 'all'} onChange={(e) => setStatusFilter(e.target.value)} />
                                                    All Statuses
                                                </label>
                                                <label className="radio-label">
                                                    <input type="radio" name="status" value="PENDING" checked={statusFilter === 'PENDING'} onChange={(e) => setStatusFilter(e.target.value)} />
                                                    Pending
                                                </label>
                                                <label className="radio-label">
                                                    <input type="radio" name="status" value="APPROVED" checked={statusFilter === 'APPROVED'} onChange={(e) => setStatusFilter(e.target.value)} />
                                                    Approved
                                                </label>
                                                <label className="radio-label">
                                                    <input type="radio" name="status" value="REJECTED" checked={statusFilter === 'REJECTED'} onChange={(e) => setStatusFilter(e.target.value)} />
                                                    Rejected
                                                </label>
                                                {!currentView.includes('claims') && (
                                                    <label className="radio-label">
                                                        <input type="radio" name="status" value="RESOLVED" checked={statusFilter === 'RESOLVED'} onChange={(e) => setStatusFilter(e.target.value)} />
                                                        Resolved
                                                    </label>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="toolbar-group relative-container" ref={sortMenuRef}>
                                    <button
                                        className="custom-dropdown-btn"
                                        onClick={() => setIsSortMenuOpen(!isSortMenuOpen)}
                                    >
                                        <FiList className="toolbar-icon" size={18} />
                                        <span>Sort {isSortingActive && "•"}</span>
                                        <FiChevronDown size={14} />
                                    </button>

                                    {isSortMenuOpen && (
                                        <div className="custom-dropdown-menu">

                                            <div className="filter-section">
                                                <h4 className="filter-heading">Item Name</h4>
                                                <label className="radio-label">
                                                    <input type="radio" name="sort-item" value="none" checked={sortItemName === 'none'} onChange={(e) => setSortItemName(e.target.value as any)} />
                                                    Default
                                                </label>
                                                <label className="radio-label">
                                                    <input type="radio" name="sort-item" value="asc" checked={sortItemName === 'asc'} onChange={(e) => setSortItemName(e.target.value as any)} />
                                                    Ascending (A-Z)
                                                </label>
                                                <label className="radio-label">
                                                    <input type="radio" name="sort-item" value="desc" checked={sortItemName === 'desc'} onChange={(e) => setSortItemName(e.target.value as any)} />
                                                    Descending (Z-A)
                                                </label>
                                            </div>

                                            {!currentView.includes('claims') && (
                                                <>
                                                    <hr className="filter-divider" />
                                                    <div className="filter-section">
                                                        <h4 className="filter-heading">Username</h4>
                                                        <label className="radio-label">
                                                            <input type="radio" name="sort-user" value="none" checked={sortUsername === 'none'} onChange={(e) => setSortUsername(e.target.value as any)} />
                                                            Default
                                                        </label>
                                                        <label className="radio-label">
                                                            <input type="radio" name="sort-user" value="asc" checked={sortUsername === 'asc'} onChange={(e) => setSortUsername(e.target.value as any)} />
                                                            Ascending (A-Z)
                                                        </label>
                                                        <label className="radio-label">
                                                            <input type="radio" name="sort-user" value="desc" checked={sortUsername === 'desc'} onChange={(e) => setSortUsername(e.target.value as any)} />
                                                            Descending (Z-A)
                                                        </label>
                                                    </div>
                                                </>
                                            )}

                                            {currentView.includes('claims') && (
                                                <>
                                                    <hr className="filter-divider" />
                                                    <div className="filter-section">
                                                        <h4 className="filter-heading">Reported By Username</h4>
                                                        <label className="radio-label">
                                                            <input type="radio" name="sort-reporter" value="none" checked={sortReporter === 'none'} onChange={(e) => setSortReporter(e.target.value as any)} />
                                                            Default
                                                        </label>
                                                        <label className="radio-label">
                                                            <input type="radio" name="sort-reporter" value="asc" checked={sortReporter === 'asc'} onChange={(e) => setSortReporter(e.target.value as any)} />
                                                            Ascending (A-Z)
                                                        </label>
                                                        <label className="radio-label">
                                                            <input type="radio" name="sort-reporter" value="desc" checked={sortReporter === 'desc'} onChange={(e) => setSortReporter(e.target.value as any)} />
                                                            Descending (Z-A)
                                                        </label>
                                                    </div>
                                                </>
                                            )}

                                            {currentView === 'approved-claims' && (
                                                <>
                                                    <hr className="filter-divider" />
                                                    <div className="filter-section">
                                                        <h4 className="filter-heading">Claimant Username</h4>
                                                        <label className="radio-label">
                                                            <input type="radio" name="sort-claimant" value="none" checked={sortClaimant === 'none'} onChange={(e) => setSortClaimant(e.target.value as any)} />
                                                            Default
                                                        </label>
                                                        <label className="radio-label">
                                                            <input type="radio" name="sort-claimant" value="asc" checked={sortClaimant === 'asc'} onChange={(e) => setSortClaimant(e.target.value as any)} />
                                                            Ascending (A-Z)
                                                        </label>
                                                        <label className="radio-label">
                                                            <input type="radio" name="sort-claimant" value="desc" checked={sortClaimant === 'desc'} onChange={(e) => setSortClaimant(e.target.value as any)} />
                                                            Descending (Z-A)
                                                        </label>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="grid-container">
                            {paginatedData.length === 0 ? (
                                <p className="no-results">No results found.</p>
                            ) : (
                                paginatedData.map(entry => {
                                    const isClaim = currentView.includes('claims');
                                    return (
                                        <div
                                            key={entry.id}
                                            className="grid-card"
                                            onClick={() => isClaim ? setClaimModalState({ isOpen: true, claim: entry }) : openItemModal(entry, currentView === 'your-items' ? 'edit' : 'view')}
                                        >
                                            {entry.imageLink ? (
                                                <img src={entry.imageLink} alt={entry.itemName} className="card-image" />
                                            ) : (
                                                <div className="card-image-placeholder">No Image</div>
                                            )}
                                            <h4>{isClaim ? `Claim for: ${entry.itemName}` : entry.itemName}</h4>

                                            <p className="card-subtext">
                                                User: {isClaim ? (entry.claimantUsername || entry.reportedByUsername) : entry.username}
                                            </p>

                                            <span className={`badge ${entry.status.toLowerCase()}`}>{entry.status}</span>
                                        </div>
                                    );
                                })
                            )}
                        </div>

                        {totalPages > 1 && (
                            <div className="pagination-controls">
                                <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}>Prev</button>
                                <span>Page {currentPage} of {totalPages}</span>
                                <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)}>Next</button>
                            </div>
                        )}
                    </div>
                )}
            </main>

            <ItemModal
                isOpen={itemModalState.isOpen}
                mode={itemModalState.mode}
                activeItem={itemModalState.activeItem}
                currentUserUsername={user?.username}
                onClose={() => setItemModalState({ isOpen: false, mode: 'add', activeItem: null })}
                onSubmit={handleItemSubmit}
                onClaim={handleCreateClaim}
                onDelete={handleDeleteItem}
            />

            <ClaimModal
                isOpen={claimModalState.isOpen}
                claim={claimModalState.claim}
                canDelete={currentView === 'your-claims'}
                onClose={() => setClaimModalState({ isOpen: false, claim: null })}
                onDelete={handleDeleteClaim}
            />

            <ToastContainer />
        </div>
    );
}