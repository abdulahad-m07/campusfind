import { useState, useEffect } from 'react'
import { fetchItems } from '../services/api'
import SearchBar from '../components/SearchBar'
import ItemCard from '../components/ItemCard'

function Browse() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  const loadItems = (searchQuery = '') => {
    setLoading(true)
    fetchItems(searchQuery)
      .then(setItems)
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchItems()
      .then(setItems)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const handleSearch = (query) => {
    loadItems(query)
  }

  const filteredItems = filter === 'all'
    ? items
    : items.filter(item => item.type === filter)

  return (
    <div className="browse-page">
      <h1>Browse Items</h1>
      <SearchBar onSearch={handleSearch} />

      <div className="filter-buttons">
        <button
          className={filter === 'all' ? 'filter-btn active' : 'filter-btn'}
          onClick={() => setFilter('all')}
        >
          All
        </button>
        <button
          className={filter === 'lost' ? 'filter-btn active' : 'filter-btn'}
          onClick={() => setFilter('lost')}
        >
          Lost
        </button>
        <button
          className={filter === 'found' ? 'filter-btn active' : 'filter-btn'}
          onClick={() => setFilter('found')}
        >
          Found
        </button>
      </div>

      {loading && <p className="loading-text">Loading items...</p>}
      {!loading && filteredItems.length === 0 && (
        <p className="empty-text">No items found.</p>
      )}
      <div className="items-grid">
        {filteredItems.map(item => (
          <ItemCard key={item._id || item.id} item={item} />
        ))}
      </div>
    </div>
  )
}

export default Browse
