import { useState, useEffect } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import { Plus, Search, Pencil, Trash2, X, LogOut, Package, AlertTriangle, Clock, CheckCircle } from 'lucide-react'

const API = 'https://medvault-sfgv.onrender.com/api/medicines'

function getStatus(medicine) {
  const today = new Date()
  const expiry = new Date(medicine.expiry_date)
  const in30 = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
  if (expiry < today) return 'expired'
  if (expiry < in30) return 'expiring_soon'
  if (medicine.quantity < (medicine.low_stock_threshold || 10)) return 'low_stock'
  return 'good'
}

const STATUS_CONFIG = {
  expired:       { label: 'Expired',       color: '#f87171', bg: '#fee2e2', dot: '#ef4444' },
  expiring_soon: { label: 'Expiring Soon', color: '#fb923c', bg: '#ffedd5', dot: '#f97316' },
  low_stock:     { label: 'Low Stock',     color: '#fbbf24', bg: '#fef3c7', dot: '#f59e0b' },
  good:          { label: 'Good',          color: '#34d399', bg: '#d1fae5', dot: '#10b981' },
}

const EMPTY_FORM = { name: '', category: '', quantity: '', expiry_date: '', low_stock_threshold: '10', manufacturer: '' }

export default function Dashboard() {
  const navigate = useNavigate()
  const token = localStorage.getItem('authToken')

  const [medicines, setMedicines] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [showModal, setShowModal] = useState(false)
  const [editItem, setEditItem] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [formErrors, setFormErrors] = useState({})
  const [saving, setSaving] = useState(false)
  const [deleteId, setDeleteId] = useState(null)
  const [toast, setToast] = useState(null)

  useEffect(() => {
    if (!token) { navigate('/signin'); return }
    fetchMedicines()
  }, [])

  const authHeader = { headers: { Authorization: `Bearer ${token}` } }

  const fetchMedicines = async () => {
    setLoading(true)
    try {
      const res = await axios.get(API, authHeader)
      setMedicines(res.data.medicines || res.data)
    } catch {
      showToast('Failed to load medicines', 'error')
    } finally {
      setLoading(false)
    }
  }

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  const openAdd = () => {
    setEditItem(null)
    setForm(EMPTY_FORM)
    setFormErrors({})
    setShowModal(true)
  }

  const openEdit = (med) => {
    setEditItem(med)
    setForm({
      name: med.name,
      category: med.category,
      quantity: med.quantity,
      expiry_date: med.expiry_date?.slice(0, 10),
      low_stock_threshold: med.low_stock_threshold || 10,
      manufacturer: med.manufacturer || '',
    })
    setFormErrors({})
    setShowModal(true)
  }

  const validateForm = () => {
    const errs = {}
    if (!form.name.trim()) errs.name = 'Required'
    if (!form.category.trim()) errs.category = 'Required'
    if (!form.quantity) errs.quantity = 'Required'
    else if (Number(form.quantity) < 0) errs.quantity = 'Cannot be negative'
    if (!form.expiry_date) errs.expiry_date = 'Required'
    setFormErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSave = async () => {
    if (!validateForm()) return
    setSaving(true)
    try {
      if (editItem) {
        await axios.put(`${API}/${editItem._id}`, form, authHeader)
        showToast('Medicine updated!')
      } else {
        await axios.post(API, form, authHeader)
        showToast('Medicine added!')
      }
      setShowModal(false)
      fetchMedicines()
    } catch {
      showToast('Something went wrong', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API}/${id}`, authHeader)
      showToast('Medicine deleted!')
      setDeleteId(null)
      fetchMedicines()
    } catch {
      showToast('Delete failed', 'error')
    }
  }

  const handleDeleteExpired = async () => {
    try {
      await axios.delete(`${API}/expired/all`, authHeader)
      showToast('All expired medicines removed!')
      fetchMedicines()
    } catch {
      showToast('Failed to remove expired', 'error')
    }
  }

  const filtered = medicines
    .map(m => ({ ...m, status: getStatus(m) }))
    .filter(m => {
      const matchSearch = m.name.toLowerCase().includes(search.toLowerCase()) ||
        m.category.toLowerCase().includes(search.toLowerCase())
      const matchFilter = filterStatus === 'all' || m.status === filterStatus
      return matchSearch && matchFilter
    })

  // Stats
  const stats = {
    total: medicines.length,
    expired: medicines.filter(m => getStatus(m) === 'expired').length,
    expiring: medicines.filter(m => getStatus(m) === 'expiring_soon').length,
    low: medicines.filter(m => getStatus(m) === 'low_stock').length,
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:wght@300;400;500;600&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'DM Sans', sans-serif; background: #f0ede8; }

        .dash-root { min-height: 100vh; background: #f0ede8; }

        /* NAVBAR */
        .navbar {
          background: #0d1f1a;
          padding: 0 32px;
          height: 60px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          position: sticky;
          top: 0;
          z-index: 100;
        }
        .nav-brand {
          font-family: 'Playfair Display', serif;
          font-size: 22px;
          font-weight: 900;
          color: #f0ede8;
          letter-spacing: -0.5px;
        }
        .nav-brand span { color: #52b788; }
        .nav-right { display: flex; align-items: center; gap: 12px; }
        .logout-btn {
          display: flex; align-items: center; gap: 6px;
          background: #1a3a2e; border: 1px solid #2d6a4f55;
          color: #74c69d; padding: 7px 14px; border-radius: 8px;
          font-size: 13px; font-weight: 500; cursor: pointer;
          font-family: 'DM Sans', sans-serif;
          transition: background 0.2s;
        }
        .logout-btn:hover { background: #2d6a4f; }

        /* MAIN */
        .main { padding: 32px; max-width: 1200px; margin: 0 auto; }

        /* STATS */
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
          margin-bottom: 28px;
        }
        .stat-card {
          background: #fff;
          border-radius: 14px;
          padding: 20px 24px;
          border: 1px solid #e8e2da;
          display: flex;
          align-items: center;
          gap: 16px;
          transition: box-shadow 0.2s;
        }
        .stat-card:hover { box-shadow: 0 4px 20px #0d1f1a12; }
        .stat-icon {
          width: 44px; height: 44px;
          border-radius: 12px;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }
        .stat-num {
          font-family: 'Playfair Display', serif;
          font-size: 28px;
          font-weight: 700;
          color: #0d1f1a;
          line-height: 1;
        }
        .stat-label { font-size: 12px; color: #8a9e96; margin-top: 3px; font-weight: 500; }

        /* TOOLBAR */
        .toolbar {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 20px;
          flex-wrap: wrap;
        }
        .search-wrap {
          position: relative;
          flex: 1;
          min-width: 200px;
        }
        .search-icon {
          position: absolute;
          left: 14px;
          top: 50%;
          transform: translateY(-50%);
          color: #8a9e96;
        }
        .search-input {
          width: 100%;
          padding: 11px 16px 11px 42px;
          background: #fff;
          border: 1.5px solid #d8d2c8;
          border-radius: 10px;
          font-size: 14px;
          font-family: 'DM Sans', sans-serif;
          color: #0d1f1a;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .search-input:focus { border-color: #52b788; box-shadow: 0 0 0 3px #52b78818; }
        .search-input::placeholder { color: #b0a898; }

        .filter-select {
          padding: 11px 16px;
          background: #fff;
          border: 1.5px solid #d8d2c8;
          border-radius: 10px;
          font-size: 13px;
          font-family: 'DM Sans', sans-serif;
          color: #0d1f1a;
          outline: none;
          cursor: pointer;
          transition: border-color 0.2s;
        }
        .filter-select:focus { border-color: #52b788; }

        .add-btn {
          display: flex; align-items: center; gap: 8px;
          background: #0d1f1a; color: #f0ede8;
          padding: 11px 20px; border-radius: 10px;
          font-size: 14px; font-weight: 600;
          font-family: 'DM Sans', sans-serif;
          border: none; cursor: pointer;
          transition: background 0.2s, box-shadow 0.2s;
          white-space: nowrap;
        }
        .add-btn:hover { background: #1a3a2e; box-shadow: 0 4px 16px #0d1f1a22; }

        .del-expired-btn {
          display: flex; align-items: center; gap: 8px;
          background: #fee2e2; color: #b91c1c;
          padding: 11px 16px; border-radius: 10px;
          font-size: 13px; font-weight: 600;
          font-family: 'DM Sans', sans-serif;
          border: 1px solid #fecaca; cursor: pointer;
          transition: background 0.2s;
          white-space: nowrap;
        }
        .del-expired-btn:hover { background: #fecaca; }

        /* TABLE */
        .table-card {
          background: #fff;
          border-radius: 16px;
          border: 1px solid #e8e2da;
          overflow: hidden;
        }
        table { width: 100%; border-collapse: collapse; }
        thead { background: #f8f5f0; }
        th {
          padding: 14px 20px;
          text-align: left;
          font-size: 11px;
          font-weight: 700;
          color: #8a9e96;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          border-bottom: 1px solid #e8e2da;
        }
        td {
          padding: 16px 20px;
          font-size: 14px;
          color: #1a2e28;
          border-bottom: 1px solid #f0ede8;
          vertical-align: middle;
        }
        tr:last-child td { border-bottom: none; }
        tr:hover td { background: #faf8f5; }

        .med-name { font-weight: 600; color: #0d1f1a; }
        .med-category {
          display: inline-block;
          background: #f0ede8;
          color: #5a6a64;
          padding: 3px 10px;
          border-radius: 100px;
          font-size: 12px;
          font-weight: 500;
        }

        .status-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 4px 12px;
          border-radius: 100px;
          font-size: 12px;
          font-weight: 600;
        }
        .status-dot { width: 6px; height: 6px; border-radius: 50%; }

        .action-btn {
          width: 32px; height: 32px;
          border-radius: 8px;
          border: none;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          transition: background 0.15s, transform 0.1s;
        }
        .action-btn:active { transform: scale(0.92); }
        .edit-btn { background: #f0ede8; color: #1a3a2e; margin-right: 6px; }
        .edit-btn:hover { background: #d8f3dc; }
        .del-btn { background: #fee2e2; color: #b91c1c; }
        .del-btn:hover { background: #fecaca; }

        /* EMPTY */
        .empty-state {
          text-align: center;
          padding: 64px 24px;
          color: #8a9e96;
        }
        .empty-icon { font-size: 48px; margin-bottom: 12px; }
        .empty-text { font-size: 16px; font-weight: 500; color: #5a6a64; }
        .empty-sub { font-size: 13px; margin-top: 4px; }

        /* MODAL OVERLAY */
        .overlay {
          position: fixed; inset: 0;
          background: #0d1f1a88;
          backdrop-filter: blur(4px);
          z-index: 200;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
          animation: fadeIn 0.2s;
        }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

        .modal {
          background: #fff;
          border-radius: 20px;
          width: 100%;
          max-width: 480px;
          padding: 32px;
          animation: slideUp 0.3s cubic-bezier(.22,1,.36,1);
          max-height: 90vh;
          overflow-y: auto;
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .modal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 24px;
        }
        .modal-title {
          font-family: 'Playfair Display', serif;
          font-size: 24px;
          font-weight: 700;
          color: #0d1f1a;
        }
        .close-btn {
          width: 36px; height: 36px;
          border-radius: 10px;
          background: #f0ede8;
          border: none;
          cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          color: #5a6a64;
          transition: background 0.15s;
        }
        .close-btn:hover { background: #e8e2da; }

        .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }

        .field { margin-bottom: 18px; }
        .field-label {
          display: block;
          font-size: 12px;
          font-weight: 600;
          color: #1a2e28;
          margin-bottom: 7px;
          letter-spacing: 0.04em;
          text-transform: uppercase;
        }
        .field-input {
          width: 100%;
          padding: 12px 14px;
          background: #f8f5f0;
          border: 1.5px solid #e8e2da;
          border-radius: 10px;
          font-size: 14px;
          font-family: 'DM Sans', sans-serif;
          color: #0d1f1a;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
        }
        .field-input:focus {
          border-color: #52b788;
          background: #fff;
          box-shadow: 0 0 0 3px #52b78818;
        }
        .field-input.err { border-color: #f87171; background: #fff5f5; }
        .field-error { font-size: 11px; color: #ef4444; margin-top: 5px; font-weight: 500; }

        .modal-footer { display: flex; gap: 12px; margin-top: 8px; }
        .cancel-btn {
          flex: 1; padding: 13px;
          background: #f0ede8; color: #5a6a64;
          border: 1px solid #e8e2da; border-radius: 10px;
          font-size: 14px; font-weight: 600;
          font-family: 'DM Sans', sans-serif;
          cursor: pointer; transition: background 0.15s;
        }
        .cancel-btn:hover { background: #e8e2da; }
        .save-btn {
          flex: 2; padding: 13px;
          background: #0d1f1a; color: #f0ede8;
          border: none; border-radius: 10px;
          font-size: 14px; font-weight: 600;
          font-family: 'DM Sans', sans-serif;
          cursor: pointer; transition: background 0.2s;
          display: flex; align-items: center; justify-content: center; gap: 8px;
        }
        .save-btn:hover:not(:disabled) { background: #1a3a2e; }
        .save-btn:disabled { background: #2d6a4f88; cursor: not-allowed; }
        .spinner {
          width: 16px; height: 16px;
          border: 2px solid #f0ede855;
          border-top-color: #f0ede8;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        /* CONFIRM DELETE MODAL */
        .confirm-modal {
          background: #fff;
          border-radius: 20px;
          width: 100%;
          max-width: 360px;
          padding: 32px;
          text-align: center;
          animation: slideUp 0.3s cubic-bezier(.22,1,.36,1);
        }
        .confirm-icon { font-size: 40px; margin-bottom: 12px; }
        .confirm-title {
          font-family: 'Playfair Display', serif;
          font-size: 22px; font-weight: 700;
          color: #0d1f1a; margin-bottom: 8px;
        }
        .confirm-sub { font-size: 14px; color: #8a9e96; margin-bottom: 24px; }
        .confirm-btns { display: flex; gap: 12px; }
        .confirm-no {
          flex: 1; padding: 12px;
          background: #f0ede8; color: #5a6a64;
          border: 1px solid #e8e2da; border-radius: 10px;
          font-size: 14px; font-weight: 600;
          font-family: 'DM Sans', sans-serif; cursor: pointer;
        }
        .confirm-yes {
          flex: 1; padding: 12px;
          background: #ef4444; color: #fff;
          border: none; border-radius: 10px;
          font-size: 14px; font-weight: 600;
          font-family: 'DM Sans', sans-serif; cursor: pointer;
          transition: background 0.15s;
        }
        .confirm-yes:hover { background: #dc2626; }

        /* TOAST */
        .toast {
          position: fixed;
          bottom: 28px; right: 28px;
          padding: 14px 20px;
          border-radius: 12px;
          font-size: 14px; font-weight: 500;
          display: flex; align-items: center; gap: 10px;
          z-index: 999;
          animation: slideUp 0.3s cubic-bezier(.22,1,.36,1);
          box-shadow: 0 8px 32px #0d1f1a22;
        }
        .toast-success { background: #0d1f1a; color: #f0ede8; }
        .toast-error   { background: #fee2e2; color: #b91c1c; border: 1px solid #fecaca; }

        /* LOADING */
        .loading-wrap {
          display: flex; align-items: center; justify-content: center;
          padding: 80px; flex-direction: column; gap: 16px;
        }
        .loading-spinner {
          width: 40px; height: 40px;
          border: 3px solid #e8e2da;
          border-top-color: #52b788;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        @media (max-width: 768px) {
          .stats-grid { grid-template-columns: repeat(2, 1fr); }
          .main { padding: 16px; }
          .form-row { grid-template-columns: 1fr; }
          th, td { padding: 12px 14px; }
        }
      `}</style>

      <div className="dash-root">
        {/* NAVBAR */}
        <nav className="navbar">
          <div className="nav-brand">Medi<span>Track</span></div>
          <div className="nav-right">
            <button className="logout-btn" onClick={() => { localStorage.removeItem('authToken'); navigate('/signin') }}>
              <LogOut size={15} /> Sign out
            </button>
          </div>
        </nav>

        <div className="main">
          {/* STATS */}
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon" style={{ background: '#d1fae5' }}>
                <Package size={20} color="#10b981" />
              </div>
              <div>
                <div className="stat-num">{stats.total}</div>
                <div className="stat-label">Total Medicines</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon" style={{ background: '#fee2e2' }}>
                <X size={20} color="#ef4444" />
              </div>
              <div>
                <div className="stat-num" style={{ color: stats.expired > 0 ? '#ef4444' : '#0d1f1a' }}>{stats.expired}</div>
                <div className="stat-label">Expired</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon" style={{ background: '#ffedd5' }}>
                <Clock size={20} color="#f97316" />
              </div>
              <div>
                <div className="stat-num" style={{ color: stats.expiring > 0 ? '#f97316' : '#0d1f1a' }}>{stats.expiring}</div>
                <div className="stat-label">Expiring Soon</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon" style={{ background: '#fef3c7' }}>
                <AlertTriangle size={20} color="#f59e0b" />
              </div>
              <div>
                <div className="stat-num" style={{ color: stats.low > 0 ? '#f59e0b' : '#0d1f1a' }}>{stats.low}</div>
                <div className="stat-label">Low Stock</div>
              </div>
            </div>
          </div>

          {/* TOOLBAR */}
          <div className="toolbar">
            <div className="search-wrap">
              <Search size={16} className="search-icon" />
              <input
                className="search-input"
                placeholder="Search by name or category..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <select className="filter-select" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
              <option value="all">All Status</option>
              <option value="good">✅ Good</option>
              <option value="expiring_soon">🟠 Expiring Soon</option>
              <option value="low_stock">⚠️ Low Stock</option>
              <option value="expired">🔴 Expired</option>
            </select>
            {stats.expired > 0 && (
              <button className="del-expired-btn" onClick={handleDeleteExpired}>
                <Trash2 size={15} /> Remove Expired ({stats.expired})
              </button>
            )}
            <button className="add-btn" onClick={openAdd}>
              <Plus size={16} /> Add Medicine
            </button>
          </div>

          {/* TABLE */}
          <div className="table-card">
            {loading ? (
              <div className="loading-wrap">
                <div className="loading-spinner" />
                <span style={{ color: '#8a9e96', fontSize: 14 }}>Loading medicines...</span>
              </div>
            ) : filtered.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">💊</div>
                <div className="empty-text">{medicines.length === 0 ? 'No medicines yet' : 'No results found'}</div>
                <div className="empty-sub">{medicines.length === 0 ? 'Click "Add Medicine" to get started' : 'Try a different search or filter'}</div>
              </div>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Category</th>
                    <th>Qty</th>
                    <th>Expiry Date</th>
                    <th>Manufacturer</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(m => {
                    const cfg = STATUS_CONFIG[m.status]
                    return (
                      <tr key={m._id}>
                        <td><div className="med-name">{m.name}</div></td>
                        <td><span className="med-category">{m.category}</span></td>
                        <td style={{ fontWeight: 600 }}>{m.quantity}</td>
                        <td>{new Date(m.expiry_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                        <td style={{ color: '#8a9e96' }}>{m.manufacturer || '—'}</td>
                        <td>
                          <span className="status-badge" style={{ background: cfg.bg, color: cfg.color }}>
                            <span className="status-dot" style={{ background: cfg.dot }} />
                            {cfg.label}
                          </span>
                        </td>
                        <td>
                          <button className="action-btn edit-btn" onClick={() => openEdit(m)} title="Edit">
                            <Pencil size={14} />
                          </button>
                          <button className="action-btn del-btn" onClick={() => setDeleteId(m._id)} title="Delete">
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {/* ADD/EDIT MODAL */}
      {showModal && (
        <div className="overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <div className="modal-title">{editItem ? 'Edit Medicine' : 'Add Medicine'}</div>
              <button className="close-btn" onClick={() => setShowModal(false)}><X size={18} /></button>
            </div>

            <div className="form-row">
              <div className="field">
                <label className="field-label">Name *</label>
                <input className={`field-input${formErrors.name ? ' err' : ''}`} placeholder="e.g. Paracetamol"
                  value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
                {formErrors.name && <div className="field-error">✕ {formErrors.name}</div>}
              </div>
              <div className="field">
                <label className="field-label">Category *</label>
                <input className={`field-input${formErrors.category ? ' err' : ''}`} placeholder="e.g. Painkiller"
                  value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} />
                {formErrors.category && <div className="field-error">✕ {formErrors.category}</div>}
              </div>
            </div>

            <div className="form-row">
              <div className="field">
                <label className="field-label">Quantity *</label>
                <input type="number" className={`field-input${formErrors.quantity ? ' err' : ''}`} placeholder="50"
                  value={form.quantity} onChange={e => setForm({ ...form, quantity: e.target.value })} />
                {formErrors.quantity && <div className="field-error">✕ {formErrors.quantity}</div>}
              </div>
              <div className="field">
                <label className="field-label">Expiry Date *</label>
                <input type="date" className={`field-input${formErrors.expiry_date ? ' err' : ''}`}
                  value={form.expiry_date} onChange={e => setForm({ ...form, expiry_date: e.target.value })} />
                {formErrors.expiry_date && <div className="field-error">✕ {formErrors.expiry_date}</div>}
              </div>
            </div>

            <div className="form-row">
              <div className="field">
                <label className="field-label">Low Stock Threshold</label>
                <input type="number" className="field-input" placeholder="10"
                  value={form.low_stock_threshold} onChange={e => setForm({ ...form, low_stock_threshold: e.target.value })} />
              </div>
              <div className="field">
                <label className="field-label">Manufacturer</label>
                <input className="field-input" placeholder="e.g. Cipla"
                  value={form.manufacturer} onChange={e => setForm({ ...form, manufacturer: e.target.value })} />
              </div>
            </div>

            <div className="modal-footer">
              <button className="cancel-btn" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="save-btn" onClick={handleSave} disabled={saving}>
                {saving ? <><div className="spinner" /> Saving...</> : (editItem ? 'Update Medicine' : 'Add Medicine')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRM DELETE */}
      {deleteId && (
        <div className="overlay" onClick={e => e.target === e.currentTarget && setDeleteId(null)}>
          <div className="confirm-modal">
            <div className="confirm-icon">🗑️</div>
            <div className="confirm-title">Delete Medicine?</div>
            <div className="confirm-sub">This action cannot be undone.</div>
            <div className="confirm-btns">
              <button className="confirm-no" onClick={() => setDeleteId(null)}>Cancel</button>
              <button className="confirm-yes" onClick={() => handleDelete(deleteId)}>Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* TOAST */}
      {toast && (
        <div className={`toast toast-${toast.type}`}>
          {toast.type === 'success' ? <CheckCircle size={16} /> : <AlertTriangle size={16} />}
          {toast.msg}
        </div>
      )}
    </>
  )
}
