import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function SearchBar({ onSearch }) {
  const [query, setQuery] = useState('')
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!isAuthenticated) {
      navigate('/login')
      return
    }
    if (onSearch) {
      onSearch(query)
    } else {
      navigate(`/browse?q=${encodeURIComponent(query)}`)
    }
  }

  return (
    <form className="search-bar" onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Search for lost or found items..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="search-input"
      />
      <button type="submit" className="search-btn">Search</button>
    </form>
  )
}

export default SearchBar
