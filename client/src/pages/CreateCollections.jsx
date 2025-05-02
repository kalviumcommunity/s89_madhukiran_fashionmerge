import React, { useState } from 'react';
import './CreateCollections.css';

const CreateCollections = () => {
  const [collectionName, setCollectionName] = useState('');
  const [items, setItems] = useState([]);

  const handleAddItem = () => {
    setItems([...items, { name: '', description: '' }]);
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = value;
    setItems(newItems);
  };

  const handleSubmit = () => {
    // Logic to submit the collection
    console.log('Collection submitted:', collectionName, items);
  };

  return (
    <section className="create-collections-section">
      <div className="create-collections-container">
        <h1 className="create-collections-title">Create Your Fashion Collection</h1>
        <input
          type="text"
          placeholder="Collection Name"
          value={collectionName}
          onChange={(e) => setCollectionName(e.target.value)}
          className="collection-name-input"
        />
        <div className="items-container">
          {items.map((item, index) => (
            <div key={index} className="item">
              <input
                type="text"
                placeholder="Item Name"
                value={item.name}
                onChange={(e) => handleItemChange(index, 'name', e.target.value)}
                className="item-name-input"
              />
              <textarea
                placeholder="Item Description"
                value={item.description}
                onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                className="item-description-input"
              ></textarea>
            </div>
          ))}
        </div>
        <button onClick={handleAddItem} className="add-item-btn">Add Item</button>
        <button onClick={handleSubmit} className="submit-collection-btn">Submit Collection</button>
      </div>
    </section>
  );
};

export default CreateCollections;