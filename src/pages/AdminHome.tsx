import { useEffect, useState, useMemo, useRef } from 'react';
import { useItemStore } from '../stores/ItemStore';
import { useClaimStore } from '../stores/ClaimStore';
import { useUserStore } from '../stores/UserStore';
import { useAuthStore } from '../stores/AuthStore';
import type { Item, ItemRequest } from '../types/Items';
import type { ResolutionClaim } from '../types/Claims';
import AdminItemModal from '../components/AdminItemModal';
import AdminClaimModal from '../components/AdminClaimModal';
import ToastContainer from '../components/ToastContainer';
import './UserHome.css';
import { FiMenu, FiChevronDown, FiChevronRight, FiFilter, FiList, FiUsers } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

type ViewState = 'dashboard' | 'regular-users' | 'admin-users' | 'all-items' | 'all-claims';

export default function AdminHome() {
    const { logout, user } = useAuthStore();
    const navigate = useNavigate();

    const { yourItems: allItems, fetchYourItems: fetchAllItems, editItem, deleteItem } = useItemStore();
    const { yourClaims: allClaims, fetchYourClaims: fetchAllClaims, editClaimStatus, deleteClaim } = useClaimStore();
    const { users, fetchAllUsers, changeRole, deleteUser } = useUserStore();

    const [currentView, setCurrentView] = useState<ViewState>('dashboard');
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    const [isUsersOpen, setIsUsersOpen] = useState(true);
    const [isItemsOpen, setIsItemsOpen] = useState(true);
    const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false);
    const [isSortMenuOpen, setIsSortMenuOpen] = useState(false);

    const [itemModalOpen, setItemModalOpen] = useState<{ isOpen: boolean; item: Item | null }>({ isOpen: false, item: null });
    const [claimModalOpen, setClaimModalOpen] = useState<{ isOpen: boolean; claim: ResolutionClaim | null }>({ isOpen: false, claim: null });

    const [searchQuery, setSearchQuery] = useState("");
    const [filterType, setFilterType] = useState<string>('all');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [sortPrimary, setSortPrimary] = useState<'none' | 'asc' | 'desc'>('none');

    const filterMenuRef = useRef<HTMLDivElement>(null);
    const sortMenuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (filterMenuRef.current && !filterMenuRef.current.contains(e.target as Node)) setIsFilterMenuOpen(false);
            if (sortMenuRef.current && !sortMenuRef.current.contains(e.target as Node)) setIsSortMenuOpen(false);
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        fetchAllItems();
        fetchAllClaims();
        fetchAllUsers();
    }, [currentView]);

    useEffect(() => {
        setSortPrimary('none');
        setFilterType('all');
        setStatusFilter('all');
    }, [currentView, searchQuery]);

    const handleItemSubmit = async (itemData: ItemRequest & { status: string }) => {
        if (itemModalOpen.item) {
            await editItem(itemModalOpen.item.id, itemData);
        }
        setItemModalOpen({ isOpen: false, item: null });
    };

    const handleDeleteItem = async (itemId: string) => {
        await deleteItem(itemId);
        setItemModalOpen({ isOpen: false, item: null });
    };

    const handleDeleteClaim = async (claimId: string) => {
        await deleteClaim(claimId);
        setClaimModalOpen({ isOpen: false, claim: null });
    };

    const { processedData } = useMemo(() => {
        let baseData: any[] = [];
        const isUserView = currentView.includes('users');
        const isItemView = currentView === 'all-items';

        if (currentView === 'regular-users') {
            baseData = users.filter(u => u.role === 'USER');
        } else if (currentView === 'admin-users') {
            // SAFETY FIX: Filter out the currently logged-in user so they can't demote themselves
            baseData = users.filter(u => u.role === 'ADMIN' && u.id !== user?.id);
        } else if (currentView === 'all-items') {
            baseData = [...allItems];
        } else if (currentView === 'all-claims') {
            baseData = [...allClaims];
        }

        if (searchQuery.trim() !== '') {
            const query = searchQuery.toLowerCase();
            baseData = baseData.filter((entry) => {
                if (isUserView) return (entry.username?.toLowerCase().includes(query) || entry.email?.toLowerCase().includes(query));
                if (isItemView) return (entry.itemName?.toLowerCase().includes(query) || entry.username?.toLowerCase().includes(query));
                return (entry.itemName?.toLowerCase().includes(query) || entry.claimantUsername?.toLowerCase().includes(query));
            });
        }

        if (filterType !== 'all') {
            baseData = baseData.filter(e => isItemView ? e.type === filterType : e.actionType === filterType);
        }

        if (statusFilter !== 'all') {
            baseData = baseData.filter(e => e.status === statusFilter);
        }

        if (sortPrimary !== 'none') {
            baseData.sort((a, b) => {
                const valA = isUserView ? a.username : a.itemName;
                const valB = isUserView ? b.username : b.itemName;
                const cmp = (valA || '').localeCompare(valB || '');
                return sortPrimary === 'asc' ? cmp : -cmp;
            });
        }

        return { processedData: baseData };
    }, [currentView, allItems, allClaims, users, searchQuery, filterType, statusFilter, sortPrimary, user?.id]);

    return (
        <div className="dashboard-layout">
            <aside className={`sidebar ${!isSidebarOpen ? 'closed' : ''}`}>
                <h2>LAFIT ADMIN</h2>
                <nav>
                    <button className={`nav-btn ${currentView === 'dashboard' ? 'active' : ''}`} onClick={() => setCurrentView('dashboard')}>Dashboard</button>

                    <div className="nav-dropdown">
                        <button className="dropdown-toggle" onClick={() => setIsUsersOpen(!isUsersOpen)}>
                            <span>Users</span>{isUsersOpen ? <FiChevronDown size={18} /> : <FiChevronRight size={18} />}
                        </button>
                        {isUsersOpen && (
                            <div className="dropdown-menu">
                                <button className={currentView === 'regular-users' ? 'active' : ''} onClick={() => setCurrentView('regular-users')}>Regular Users</button>
                                <button className={currentView === 'admin-users' ? 'active' : ''} onClick={() => setCurrentView('admin-users')}>Administrators</button>
                            </div>
                        )}
                    </div>

                    <div className="nav-dropdown">
                        <button className="dropdown-toggle" onClick={() => setIsItemsOpen(!isItemsOpen)}>
                            <span>Data</span>{isItemsOpen ? <FiChevronDown size={18} /> : <FiChevronRight size={18} />}
                        </button>
                        {isItemsOpen && (
                            <div className="dropdown-menu">
                                <button className={currentView === 'all-items' ? 'active' : ''} onClick={() => setCurrentView('all-items')}>All Items</button>
                                <button className={currentView === 'all-claims' ? 'active' : ''} onClick={() => setCurrentView('all-claims')}>All Claims</button>
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
                        <div className="card"><h3>Total Users</h3><p className="count">{users.length}</p></div>
                        <div className="card"><h3>Total Items</h3><p className="count">{allItems.length}</p></div>
                        <div className="card"><h3>Total Claims</h3><p className="count">{allClaims.length}</p></div>
                    </div>
                )}

                {currentView !== 'dashboard' && (
                    <div className="list-view">
                        <div className="header-row"><h2 className="view-title">{currentView.replace('-', ' ').toUpperCase()}</h2></div>

                        <div className="toolbar">
                            <div className="search-group">
                                <input type="text" placeholder="Search Database..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="search-input" />
                            </div>

                            <div className="toolbar-actions">
                                {!currentView.includes('users') && (
                                    <>
                                        <div className="toolbar-group relative-container" ref={filterMenuRef}>
                                            <button className="custom-dropdown-btn" onClick={() => setIsFilterMenuOpen(!isFilterMenuOpen)}>
                                                <FiFilter className="toolbar-icon" size={18} /><span>Filters</span><FiChevronDown size={14} />
                                            </button>
                                            {isFilterMenuOpen && (
                                                <div className="custom-dropdown-menu">
                                                    <div className="filter-section">
                                                        <h4 className="filter-heading">Type</h4>
                                                        <label className="radio-label"><input type="radio" name="type" value="all" checked={filterType === 'all'} onChange={(e) => setFilterType(e.target.value)} /> All Types</label>
                                                        {currentView === 'all-items' ? (
                                                            <>
                                                                <label className="radio-label"><input type="radio" name="type" value="LOST" checked={filterType === 'LOST'} onChange={(e) => setFilterType(e.target.value)} /> Lost</label>
                                                                <label className="radio-label"><input type="radio" name="type" value="FOUND" checked={filterType === 'FOUND'} onChange={(e) => setFilterType(e.target.value)} /> Found</label>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <label className="radio-label"><input type="radio" name="type" value="CLAIMING_FOUND_ITEM" checked={filterType === 'CLAIMING_FOUND_ITEM'} onChange={(e) => setFilterType(e.target.value)} /> Claiming Found</label>
                                                                <label className="radio-label"><input type="radio" name="type" value="RETURNING_LOST_ITEM" checked={filterType === 'RETURNING_LOST_ITEM'} onChange={(e) => setFilterType(e.target.value)} /> Returning Lost</label>
                                                            </>
                                                        )}
                                                    </div>
                                                    <hr className="filter-divider" />
                                                    <div className="filter-section">
                                                        <h4 className="filter-heading">Status</h4>
                                                        <label className="radio-label"><input type="radio" name="status" value="all" checked={statusFilter === 'all'} onChange={(e) => setStatusFilter(e.target.value)} /> All Statuses</label>
                                                        <label className="radio-label"><input type="radio" name="status" value="PENDING" checked={statusFilter === 'PENDING'} onChange={(e) => setStatusFilter(e.target.value)} /> Pending</label>
                                                        <label className="radio-label"><input type="radio" name="status" value="APPROVED" checked={statusFilter === 'APPROVED'} onChange={(e) => setStatusFilter(e.target.value)} /> Approved</label>
                                                        <label className="radio-label"><input type="radio" name="status" value="REJECTED" checked={statusFilter === 'REJECTED'} onChange={(e) => setStatusFilter(e.target.value)} /> Rejected</label>
                                                        {currentView === 'all-items' && (
                                                            <label className="radio-label"><input type="radio" name="status" value="RESOLVED" checked={statusFilter === 'RESOLVED'} onChange={(e) => setStatusFilter(e.target.value)} /> Resolved</label>
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </>
                                )}

                                <div className="toolbar-group relative-container" ref={sortMenuRef}>
                                    <button className="custom-dropdown-btn" onClick={() => setIsSortMenuOpen(!isSortMenuOpen)}>
                                        <FiList className="toolbar-icon" size={18} /><span>Sort Primary</span><FiChevronDown size={14} />
                                    </button>
                                    {isSortMenuOpen && (
                                        <div className="custom-dropdown-menu">
                                            <div className="filter-section">
                                                <label className="radio-label"><input type="radio" name="sort" value="none" checked={sortPrimary === 'none'} onChange={(e) => setSortPrimary(e.target.value as any)} /> Default</label>
                                                <label className="radio-label"><input type="radio" name="sort" value="asc" checked={sortPrimary === 'asc'} onChange={(e) => setSortPrimary(e.target.value as any)} /> A - Z</label>
                                                <label className="radio-label"><input type="radio" name="sort" value="desc" checked={sortPrimary === 'desc'} onChange={(e) => setSortPrimary(e.target.value as any)} /> Z - A</label>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="grid-container">
                            {processedData.length === 0 ? <p className="no-results">No results found.</p> : (
                                processedData.map(entry => {
                                    if (currentView.includes('users')) {
                                        return (
                                            <div key={entry.id} className="grid-card" style={{ cursor: 'default', display: 'flex', flexDirection: 'column' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                                                    <FiUsers size={32} color="var(--primary-blue)" />
                                                    <div style={{ overflow: 'hidden' }}>
                                                        <h4 style={{ margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{entry.username}</h4>
                                                        <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{entry.email}</span>
                                                    </div>
                                                </div>

                                                {/* Updated Button Group inside User Card */}
                                                <div style={{ display: 'flex', gap: '8px', marginTop: 'auto', width: '100%' }}>
                                                    <button
                                                        style={{ flex: 1, background: 'var(--bg-input)', border: '1px solid var(--border-color)', color: 'var(--text-main)', padding: '8px', borderRadius: '6px', cursor: 'pointer', transition: 'background 0.2s', fontSize: '13px' }}
                                                        onMouseOver={(e) => e.currentTarget.style.background = 'var(--primary-blue)'}
                                                        onMouseOut={(e) => e.currentTarget.style.background = 'var(--bg-input)'}
                                                        onClick={() => changeRole(entry.id, entry.role === 'ADMIN' ? 'USER' : 'ADMIN')}
                                                    >
                                                        {entry.role === 'ADMIN' ? 'Demote' : 'Promote'}
                                                    </button>

                                                    <button
                                                        style={{ flex: 1, background: '#ef4444', border: 'none', color: 'white', padding: '8px', borderRadius: '6px', cursor: 'pointer', transition: 'background 0.2s', fontSize: '13px', fontWeight: 'bold' }}
                                                        onMouseOver={(e) => e.currentTarget.style.background = '#dc2626'}
                                                        onMouseOut={(e) => e.currentTarget.style.background = '#ef4444'}
                                                        onClick={() => {
                                                            if (window.confirm(`Are you sure you want to permanently delete user ${entry.username}?`)) {
                                                                deleteUser(entry.id);
                                                            }
                                                        }}
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    }

                                    const isClaim = currentView === 'all-claims';
                                    return (
                                        <div key={entry.id} className="grid-card" onClick={() => isClaim ? setClaimModalOpen({ isOpen: true, claim: entry }) : setItemModalOpen({ isOpen: true, item: entry })}>
                                            {entry.imageLink ? <img src={entry.imageLink} alt="Preview" className="card-image" /> : <div className="card-image-placeholder">No Image</div>}
                                            <h4>{isClaim ? `Claim: ${entry.itemName}` : entry.itemName}</h4>
                                            <p className="card-subtext">By: {isClaim ? entry.claimantUsername : entry.username}</p>
                                            <span className={`badge ${entry.status.toLowerCase()}`}>{entry.status}</span>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>
                )}
            </main>

            <AdminItemModal
                isOpen={itemModalOpen.isOpen}
                activeItem={itemModalOpen.item}
                onClose={() => setItemModalOpen({ isOpen: false, item: null })}
                onSubmit={handleItemSubmit}
                onDelete={handleDeleteItem}
            />

            <AdminClaimModal
                isOpen={claimModalOpen.isOpen}
                claim={claimModalOpen.claim}
                onClose={() => setClaimModalOpen({ isOpen: false, claim: null })}
                onAccept={async (id) => { await editClaimStatus(id, 'APPROVED'); setClaimModalOpen({ isOpen: false, claim: null }); }}
                onReject={async (id) => { await editClaimStatus(id, 'REJECTED'); setClaimModalOpen({ isOpen: false, claim: null }); }}
                onDelete={handleDeleteClaim}
            />

            <ToastContainer />
        </div>
    );
}