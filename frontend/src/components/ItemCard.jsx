import { Link } from 'react-router-dom'

function ItemCard({ item }) {
  const isLost = item.type === 'lost'
  const itemId = item._id || item.id

  return (
    <Link to={`/item/${itemId}`} className="item-card">
      {item.imageUrl ? (
        <img src={item.imageUrl} alt={item.itemName} className="item-card-image" />
      ) : (
        <div className="item-card-image item-card-image-placeholder">
          <span>No photo</span>
        </div>
      )}
      <div className="item-card-body">
        <span className={`type-badge ${isLost ? 'type-lost' : 'type-found'}`}>
          {isLost ? 'Lost' : 'Found'}
        </span>
        <h3 className="item-card-title">{item.itemName}</h3>
        <p className="item-card-location">{item.location}</p>
        <p className="item-card-date">{new Date(item.date).toLocaleDateString()}</p>
      </div>
    </Link>
  )
}

export default ItemCard
