import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { fetchItems } from '../services/api'
import SearchBar from '../components/SearchBar'
import ItemCard from '../components/ItemCard'

function Home() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchItems()
      .then(setItems)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const recentItems = items.slice(0, 6)

  return (
    <div className="home">
      <section className="hero-section">
        <h1>CampusFind</h1>
        <p className="hero-subtitle">Lost something? Found something? Help your fellow students.</p>
        <SearchBar />
        <Link to="/report" className="hero-report-btn">+ Report an Item</Link>
      </section>

      <section className="recent-section">
        <h2>Recent Items</h2>
        {loading && <p className="loading-text">Loading items...</p>}
        {!loading && recentItems.length === 0 && (
          <p className="empty-text">No items yet. Be the first to report one!</p>
        )}
        <div className="items-grid">
          {recentItems.map(item => (
            <ItemCard key={item._id || item.id} item={item} />
          ))}
        </div>
        {recentItems.length > 0 && (
          <Link to="/browse" className="view-all-link">View all items →</Link>
        )}
      </section>
    </div>
  )
}

export default Home
