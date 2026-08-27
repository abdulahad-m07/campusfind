import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { fetchItemById, claimItem } from '../services/api'
import { useAuth } from '../context/AuthContext'

function ItemDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user, isAuthenticated } = useAuth()
  const [item, setItem] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [claiming, setClaiming] = useState(false)
  const [claimError, setClaimError] = useState(null)
  const [showThanks, setShowThanks] = useState(false)

  useEffect(() => {
    fetchItemById(id)
      .then(setItem)
      .catch(() => setError('Item not found.'))
      .finally(() => setLoading(false))
  }, [id])

  const isLost = item ? item.type === 'lost' : false

  const canClaim =
    isAuthenticated &&
    !!item &&
    (item.reporterId === user._id || user.role === 'faculty')

  const handleClaim = async () => {
    if (!window.confirm('Confirm that the owner has received this item? It will be removed from the listings.')) {
      return
    }
    setClaiming(true)
    setClaimError(null)
    try {
      const updated = await claimItem(id)
      setItem(updated)
      setShowThanks(true)
    } catch {
      setClaimError('Could not claim the item. Please try again.')
    } finally {
      setClaiming(false)
    }
  }

  if (loading) return <p className="loading-text">Loading item...</p>
  if (error) return <p className="error-text">{error}</p>
  if (!item) return null

  if (item.claimed) {
    return (
      <div className="item-details">
        <Link to="/browse" className="back-link">← Back to Browse</Link>
        <div className="detail-card">
          <div className="detail-info">
            <span className="type-badge type-found">Claimed</span>
            <h1>{item.itemName}</h1>
            <p className="detail-description">
              This item has been claimed by its owner and has been removed from the listings.
            </p>
          </div>
        </div>
        {showThanks && (
          <div className="popup-overlay">
            <div className="popup-card">
              <div className="popup-icon">✓</div>
              <h2>Thank you!</h2>
              <p>The item has been claimed successfully.</p>
              <button
                type="button"
                className="popup-btn"
                onClick={() => navigate('/')}
              >
                OK
              </button>
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="item-details">
      <Link to="/browse" className="back-link">← Back to Browse</Link>

      <div className="detail-card">
        {item.imageUrl && (
          <img src={item.imageUrl} alt={item.itemName} className="detail-image" />
        )}
        <div className="detail-info">
          <span className={`type-badge ${isLost ? 'type-lost' : 'type-found'}`}>
            {isLost ? 'Lost' : 'Found'}
          </span>
          <h1>{item.itemName}</h1>
          <p className="detail-description">{item.description}</p>

          <div className="detail-meta">
            <div className="meta-item">
              <strong>Location:</strong> {item.location}
            </div>
            <div className="meta-item">
              <strong>Date:</strong> {new Date(item.date).toLocaleDateString()}
            </div>
            <div className="meta-item">
              <strong>Contact:</strong> {item.contact}
            </div>
          </div>

          {claimError && <div className="form-error">{claimError}</div>}

          {canClaim ? (
            <button
              type="button"
              className="claim-btn"
              onClick={handleClaim}
              disabled={claiming}
            >
              {claiming ? 'Claiming...' : '✓ Claim — Owner received it'}
            </button>
          ) : (
            <p className="claim-note">
              Reported by {item.reporterName || 'a member'}. Only the reporter or faculty can mark this as claimed.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

export default ItemDetails
