import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

const InspirationFeed = () => {
  const { t } = useTranslation();
  const [currentInspiration, setCurrentInspiration] = useState(null);
  const [category, setCategory] = useState('quotes');

  const inspirationData = {
    quotes: [
      "The only way to do great work is to love what you do. - Steve Jobs",
      "Innovation distinguishes between a leader and a follower. - Steve Jobs",
      "Your limitation—it's only your imagination.",
      "Push yourself, because no one else is going to do it for you.",
      "Great things never come from comfort zones."
    ],
    stories: [
      "A young artist painted every day for years, never selling a piece. One day, a gallery owner discovered her work and gave her a solo exhibition. Persistence pays off.",
      "A designer was rejected 100 times before landing their dream job. Each rejection taught them something new.",
      "Two friends started a fashion blog from their dorm room. Today, it's a global fashion platform."
    ],
    prompts: [
      "Design an outfit that represents your current mood",
      "Create a color palette inspired by your favorite memory",
      "Sketch a fashion piece that doesn't exist yet but should",
      "Write about a fabric that could change the world"
    ]
  };

  useEffect(() => {
    generateNewInspiration();
  }, [category]);

  const generateNewInspiration = () => {
    const items = inspirationData[category];
    const randomItem = items[Math.floor(Math.random() * items.length)];
    setCurrentInspiration(randomItem);
  };

  return (
    <div style={{ textAlign: 'center', padding: '40px' }}>
      <h2>{t('biosync.inspiration.title')}</h2>

      <div style={{ marginBottom: '30px' }}>
        {['quotes', 'stories', 'prompts'].map((cat) => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            style={{
              margin: '0 10px',
              padding: '10px 20px',
              border: category === cat ? '2px solid #00BCD4' : '1px solid #ddd',
              borderRadius: '25px',
              background: category === cat ? '#00BCD4' : 'white',
              color: category === cat ? 'white' : '#333',
              cursor: 'pointer'
            }}
          >
            {t(`biosync.inspiration.categories.${cat}`)}
          </button>
        ))}
      </div>

      <div style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        padding: '40px',
        borderRadius: '20px',
        margin: '20px 0',
        minHeight: '200px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <p style={{ fontSize: '1.2rem', lineHeight: '1.6', maxWidth: '600px' }}>
          {currentInspiration}
        </p>
      </div>

      <button
        onClick={generateNewInspiration}
        style={{
          background: '#00BCD4',
          color: 'white',
          border: 'none',
          padding: '15px 30px',
          borderRadius: '25px',
          fontSize: '1rem',
          cursor: 'pointer',
          margin: '10px'
        }}
      >
        {t('biosync.inspiration.refresh')}
      </button>
    </div>
  );
};

export default InspirationFeed;
