import { useEffect, useState, useMemo } from 'react';
import { useItemStore } from '../stores/ItemStore';
import { useClaimStore } from '../stores/ClaimStore';
import { useAuthStore } from '../stores/AuthStore';
import type { Item, ItemRequest } from '../types/Items';
import type { ResolutionClaim, ActionType } from '../types/Claims';
import ItemModal from '../components/ItemModal';
import ClaimModal from '../components/ClaimModal';
import './UserHome.css';
import ToastContainer from '../components/ToastContainer';
import { FiMenu, FiChevronDown, FiChevronRight } from 'react-icons/fi';

type ViewState = 'dashboard' | 'your-items' | 'approved-items' | 'resolved-items' | 'your-claims' | 'approved-claims';

interface ItemModalState {
    isOpen: boolean;
    mode: 'add' | 'edit' | 'view';
    activeItem: Item | null;
}

export default function UserHome() {
    const { logout, user } = useAuthStore();
    const { yourItems, approvedItems, resolvedItems, fetchYourItems, fetchApprovedItems, fetchResolvedItems, addItem, editItem, deleteItem } = useItemStore();
    const { yourClaims, approvedClaims, fetchYourClaims, fetchApprovedClaims, addClaim, deleteClaim } = useClaimStore();
    
    const [currentView, setCurrentView] = useState<ViewState>('dashboard');
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    
    // Dropdown States
    const [isItemsOpen, setIsItemsOpen] = useState(true);
    const [isClaimsOpen, setIsClaimsOpen] = useState(true);
    
    const [itemModalState, setItemModalState] = useState<ItemModalState>({ isOpen: false, mode: 'add', activeItem: null });
    const [claimModalState, setClaimModalState] = useState<{ isOpen: boolean; claim: ResolutionClaim | null }>({ isOpen: false, claim: null });

    const [searchQuery, setSearchQuery] = useState("");
    const [searchField, setSearchField] = useState<'all' | 'itemName' | 'username'>('all');
    const [sortBy, setSortBy] = useState<string>('none');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;

    useEffect(() => {
        fetchYourItems();
        fetchApprovedItems();
        fetchResolvedItems();
        fetchYourClaims();
        fetchApprovedClaims();
    }, [currentView]);

    useEffect(() => {
        setCurrentPage(1);
        setSortBy('none');
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

        if (sortBy !== 'none') {
            baseData.sort((a, b) => {
                if (sortBy === 'item-asc') return (a.itemName || '').localeCompare(b.itemName || '');
                if (sortBy === 'item-desc') return (b.itemName || '').localeCompare(a.itemName || '');
                
                if (sortBy === 'user-asc') return (a.username || '').localeCompare(b.username || '');
                if (sortBy === 'user-desc') return (b.username || '').localeCompare(a.username || '');
                
                if (sortBy === 'claimant-asc') return (a.claimantUsername || '').localeCompare(b.claimantUsername || '');
                if (sortBy === 'claimant-desc') return (b.claimantUsername || '').localeCompare(a.claimantUsername || '');

                if (sortBy === 'reporter-asc') return (a.reportedByUsername || '').localeCompare(b.reportedByUsername || '');
                if (sortBy === 'reporter-desc') return (b.reportedByUsername || '').localeCompare(a.reportedByUsername || '');

                return 0;
            });
        }

        const tPages = Math.ceil(baseData.length / itemsPerPage) || 1;
        const pData = baseData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

        return { paginatedData: pData, totalPages: tPages };
    }, [currentView, yourItems, approvedItems, resolvedItems, yourClaims, approvedClaims, searchQuery, searchField, sortBy, currentPage]);

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
                <button className="logout-btn" onClick={logout}>Logout</button>
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
                            <div className="sort-group">
                                <span className="sort-label">Sort By:</span>
                                <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="toolbar-select">
                                    <option value="none">Default</option>
                                    <option value="item-asc">Item Name (A-Z)</option>
                                    <option value="item-desc">Item Name (Z-A)</option>

                                    {!currentView.includes('claims') && (
                                        <>
                                            <option value="user-asc">Username (A-Z)</option>
                                            <option value="user-desc">Username (Z-A)</option>
                                        </>
                                    )}

                                    {currentView === 'approved-claims' && (
                                        <>
                                            <option value="claimant-asc">Claimant Username (A-Z)</option>
                                            <option value="claimant-desc">Claimant Username (Z-A)</option>
                                            <option value="reporter-asc">Reported By Username (A-Z)</option>
                                            <option value="reporter-desc">Reported By Username (Z-A)</option>
                                        </>
                                    )}

                                    {currentView === 'your-claims' && (
                                        <>
                                            <option value="reporter-asc">Reported By Username (A-Z)</option>
                                            <option value="reporter-desc">Reported By Username (Z-A)</option>
                                        </>
                                    )}
                                </select>
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