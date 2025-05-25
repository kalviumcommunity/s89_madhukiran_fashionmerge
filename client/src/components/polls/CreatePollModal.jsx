import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { usePollsStore } from '../../pages/pollsStore';
import { toast } from 'react-toastify';
import './CreatePollModal.css';

const CreatePollModal = ({ onClose }) => {
  const { t } = useTranslation();
  const { createPoll, isLoading } = usePollsStore();
  
  // Form state
  const [pollType, setPollType] = useState('text');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('outfits');
  const [options, setOptions] = useState(['', '']);
  const [images, setImages] = useState([null, null]);
  const [imagePreviewUrls, setImagePreviewUrls] = useState([null, null]);
  
  // Get user token
  const token = localStorage.getItem('token');
  
  // Handle poll type change
  const handlePollTypeChange = (type) => {
    setPollType(type);
  };
  
  // Handle option change
  const handleOptionChange = (index, value) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };
  
  // Handle image change
  const handleImageChange = (index, e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Check file type
    if (!file.type.match('image.*')) {
      toast.error(t('polls.errors.invalidImageType'));
      return;
    }
    
    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error(t('polls.errors.imageTooLarge'));
      return;
    }
    
    // Update images array
    const newImages = [...images];
    newImages[index] = file;
    setImages(newImages);
    
    // Create preview URL
    const reader = new FileReader();
    reader.onloadend = () => {
      const newImagePreviewUrls = [...imagePreviewUrls];
      newImagePreviewUrls[index] = reader.result;
      setImagePreviewUrls(newImagePreviewUrls);
    };
    reader.readAsDataURL(file);
  };
  
  // Add option
  const addOption = () => {
    if (options.length >= 10) {
      toast.warning(t('polls.errors.maxOptions'));
      return;
    }
    
    setOptions([...options, '']);
    
    if (pollType === 'visual') {
      setImages([...images, null]);
      setImagePreviewUrls([...imagePreviewUrls, null]);
    }
  };
  
  // Remove option
  const removeOption = (index) => {
    if (options.length <= 2) {
      toast.warning(t('polls.errors.minOptions'));
      return;
    }
    
    const newOptions = [...options];
    newOptions.splice(index, 1);
    setOptions(newOptions);
    
    if (pollType === 'visual') {
      const newImages = [...images];
      newImages.splice(index, 1);
      setImages(newImages);
      
      const newImagePreviewUrls = [...imagePreviewUrls];
      newImagePreviewUrls.splice(index, 1);
      setImagePreviewUrls(newImagePreviewUrls);
    }
  };
  
  // Validate form
  const validateForm = () => {
    if (!title.trim()) {
      toast.error(t('polls.errors.titleRequired'));
      return false;
    }
    
    if (pollType === 'text') {
      // Check if all options have content
      if (options.some(option => !option.trim())) {
        toast.error(t('polls.errors.optionsRequired'));
        return false;
      }
    } else {
      // Check if all options have images
      if (images.some(image => !image)) {
        toast.error(t('polls.errors.imagesRequired'));
        return false;
      }
    }
    
    return true;
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    try {
      const pollData = {
        title,
        description,
        type: pollType,
        category,
        options: pollType === 'text' 
          ? options.map(option => ({ content: option }))
          : options.map((option, index) => ({ content: option || `Option ${index + 1}` })),
        images: pollType === 'visual' ? images : null
      };
      
      await createPoll(pollData, token);
      
      toast.success(t('polls.createSuccess'));
      onClose();
    } catch (error) {
      toast.error(t('polls.errors.createFailed'));
      console.error('Error creating poll:', error);
    }
  };
  
  return (
    <div className="create-poll-modal-overlay">
      <div className="create-poll-modal">
        <div className="create-poll-modal-header">
          <h2>{t('polls.createPoll')}</h2>
          <button 
            className="create-poll-modal-close"
            onClick={onClose}
          >
            ×
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="create-poll-form">
          <div className="create-poll-type-selector">
            <button
              type="button"
              className={`poll-type-button ${pollType === 'text' ? 'active' : ''}`}
              onClick={() => handlePollTypeChange('text')}
            >
              {t('polls.types.text')}
            </button>
            <button
              type="button"
              className={`poll-type-button ${pollType === 'visual' ? 'active' : ''}`}
              onClick={() => handlePollTypeChange('visual')}
            >
              {t('polls.types.visual')}
            </button>
          </div>
          
          <div className="form-group">
            <label htmlFor="poll-title">{t('polls.form.title')}</label>
            <input
              id="poll-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t('polls.form.titlePlaceholder')}
              maxLength={100}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="poll-description">{t('polls.form.description')}</label>
            <textarea
              id="poll-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t('polls.form.descriptionPlaceholder')}
              maxLength={500}
              rows={3}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="poll-category">{t('polls.form.category')}</label>
            <select
              id="poll-category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="outfits">{t('polls.categories.outfits')}</option>
              <option value="trends">{t('polls.categories.trends')}</option>
              <option value="accessories">{t('polls.categories.accessories')}</option>
              <option value="colors">{t('polls.categories.colors')}</option>
              <option value="styles">{t('polls.categories.styles')}</option>
              <option value="other">{t('polls.categories.other')}</option>
            </select>
          </div>
          
          <div className="form-group">
            <label>{t('polls.form.options')}</label>
            
            <div className="poll-options-list">
              {options.map((option, index) => (
                <div key={index} className="poll-option-item">
                  {pollType === 'text' ? (
                    <input
                      type="text"
                      value={option}
                      onChange={(e) => handleOptionChange(index, e.target.value)}
                      placeholder={`${t('polls.form.option')} ${index + 1}`}
                      required
                    />
                  ) : (
                    <div className="poll-image-option">
                      <div className="poll-image-preview">
                        {imagePreviewUrls[index] ? (
                          <img 
                            src={imagePreviewUrls[index]} 
                            alt={`Option ${index + 1}`} 
                          />
                        ) : (
                          <div className="poll-image-placeholder">
                            {t('polls.form.addImage')}
                          </div>
                        )}
                      </div>
                      <input
                        type="file"
                        id={`poll-image-${index}`}
                        accept="image/*"
                        onChange={(e) => handleImageChange(index, e)}
                        className="poll-image-input"
                      />
                      <label 
                        htmlFor={`poll-image-${index}`}
                        className="poll-image-label"
                      >
                        {imagePreviewUrls[index] 
                          ? t('polls.form.changeImage') 
                          : t('polls.form.selectImage')}
                      </label>
                      <input
                        type="text"
                        value={option}
                        onChange={(e) => handleOptionChange(index, e.target.value)}
                        placeholder={`${t('polls.form.caption')} ${index + 1}`}
                        className="poll-image-caption"
                      />
                    </div>
                  )}
                  
                  <button
                    type="button"
                    className="poll-option-remove"
                    onClick={() => removeOption(index)}
                    title={t('common.remove')}
                  >
                    ×
                  </button>
                </div>
              ))}
              
              <button
                type="button"
                className="poll-option-add"
                onClick={addOption}
              >
                + {t('polls.form.addOption')}
              </button>
            </div>
          </div>
          
          <div className="create-poll-actions">
            <button
              type="button"
              className="cancel-button"
              onClick={onClose}
              disabled={isLoading}
            >
              {t('common.cancel')}
            </button>
            <button
              type="submit"
              className="submit-button"
              disabled={isLoading}
            >
              {isLoading ? t('common.creating') : t('common.create')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePollModal;
