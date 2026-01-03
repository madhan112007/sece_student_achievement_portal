import React, { useState } from 'react';
import { collection, addDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../../config/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { extractTextFromImage, extractCertificateDetails } from '../../utils/googleAI';

const SubmissionForm = () => {
  const [formData, setFormData] = useState({
    category: '',
    title: '',
    organization: '',
    duration: '',
    description: '',
    file: null
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [aiProcessing, setAiProcessing] = useState(false);
  const { currentUser } = useAuth();

  const categories = [
    { value: 'Certification', icon: '🏆', color: '#667eea' },
    { value: 'Internship', icon: '💼', color: '#764ba2' },
    { value: 'Project', icon: '🚀', color: '#11998e' },
    { value: 'Workshop', icon: '🎯', color: '#38ef7d' },
    { value: 'Hackathon', icon: '⚡', color: '#ff416c' }
  ];

  const handleChange = async (e) => {
    const { name, value, files } = e.target;
    if (files) {
      const file = files[0];
      setFormData(prev => ({ ...prev, [name]: file }));
      await processFileWithAI(file);
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setFormData(prev => ({ ...prev, file }));
      await processFileWithAI(file);
    }
  };

  const processFileWithAI = async (file) => {
    if (!file) return;
    
    setAiProcessing(true);
    try {
      console.log('Processing file:', file.name);
      
      // Try Vision API for images, fallback to filename
      let details = {};
      if (file.type.startsWith('image/')) {
        try {
          const extractedText = await extractTextFromImage(file);
          console.log('Vision API text:', extractedText);
          if (extractedText) {
            // Parse extracted text for details
            const text = extractedText.toLowerCase();
            
            // Organizations
            if (text.includes('google')) details.organization = 'Google';
            else if (text.includes('microsoft')) details.organization = 'Microsoft';
            else if (text.includes('aws') || text.includes('amazon')) details.organization = 'AWS';
            else if (text.includes('codechef')) details.organization = 'CodeChef';
            else if (text.includes('hackerrank')) details.organization = 'HackerRank';
            else if (text.includes('leetcode')) details.organization = 'LeetCode';
            else if (text.includes('coursera')) details.organization = 'Coursera';
            else if (text.includes('udemy')) details.organization = 'Udemy';
            
            // Programming languages and skills
            if (text.includes('python')) {
              details.title = 'Python Programming';
              details.type = 'Certification';
            } else if (text.includes('java')) {
              details.title = 'Java Programming';
              details.type = 'Certification';
            } else if (text.includes('javascript')) {
              details.title = 'JavaScript Programming';
              details.type = 'Certification';
            }
            
            // Test/Quiz/Certificate detection
            if (text.includes('test') || text.includes('quiz')) {
              details.type = 'Certification';
            } else if (text.includes('certificate')) {
              details.type = 'Certification';
            } else if (text.includes('skill')) {
              details.type = 'Certification';
            }
            
            // Year extraction
            const yearMatch = text.match(/20\d{2}/);
            if (yearMatch) details.year = yearMatch[0];
          }
        } catch (visionError) {
          console.log('Vision API failed, using filename:', visionError.message);
          details = extractCertificateDetails(file.name);
        }
      } else {
        details = extractCertificateDetails(file.name);
      }
      
      console.log('Final details:', JSON.stringify(details, null, 2));
      console.log('Details keys:', Object.keys(details));
      console.log('Details values:', Object.values(details));
      
      // Auto-fill form fields
      if (details.organization || details.year || details.type || details.title) {
        console.log('Auto-filling fields with:', details);
        setFormData(prev => {
          const newData = {
            ...prev,
            organization: details.organization || prev.organization,
            title: details.title || prev.title,
            duration: details.year || prev.duration,
            category: details.type || prev.category
          };
          console.log('New form data:', JSON.stringify(newData, null, 2));
          return newData;
        });
        setMessage(`✨ Auto-filled: ${Object.entries(details).map(([k,v]) => `${k}: ${v}`).join(', ')}`);
      } else {
        console.log('No details found to auto-fill');
        setMessage('ℹ️ No details could be extracted');
      }
    } catch (error) {
      console.error('Processing failed:', error);
      setMessage('⚠️ Processing failed: ' + error.message);
    }
    setAiProcessing(false);
  };

  const validateFile = (file) => {
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
    const maxSize = 5 * 1024 * 1024;

    if (!allowedTypes.includes(file.type)) {
      throw new Error('Only PDF, JPG, and PNG files are allowed');
    }
    if (file.size > maxSize) {
      throw new Error('File size must be less than 5MB');
    }
  };

  const uploadFile = async (file) => {
    const fileName = `${Date.now()}_${file.name}`;
    const storageRef = ref(storage, `submissions/${currentUser.uid}/${fileName}`);
    await uploadBytes(storageRef, file);
    return await getDownloadURL(storageRef);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      if (!formData.category || !formData.title || !formData.organization) {
        throw new Error('Please fill in all required fields');
      }

      // Skip file upload for now to avoid CORS issues
      await addDoc(collection(db, 'submissions'), {
        userId: currentUser.uid,
        userEmail: currentUser.email,
        category: formData.category,
        title: formData.title,
        organization: formData.organization,
        duration: formData.duration,
        description: formData.description,
        fileURL: null, // Skip file upload
        fileName: formData.file?.name || null,
        status: 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });

      setMessage('🎉 Submission successful! Your achievement has been recorded.');
      setFormData({
        category: '',
        title: '',
        organization: '',
        duration: '',
        description: '',
        file: null
      });
      if (document.getElementById('file-input')) {
        document.getElementById('file-input').value = '';
      }

    } catch (error) {
      setMessage('❌ Error: ' + error.message);
    }
    setLoading(false);
  };

  const selectedCategory = categories.find(cat => cat.value === formData.category);

  return (
    <div className="card" style={{ maxWidth: '800px', margin: '0 auto', position: 'relative', overflow: 'hidden' }}>
      {/* Animated Background */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '6px',
        background: selectedCategory ? 
          `linear-gradient(90deg, ${selectedCategory.color}, ${selectedCategory.color}aa)` :
          'linear-gradient(90deg, #667eea, #764ba2)',
        transition: 'all 0.5s ease'
      }}></div>

      <div style={{ padding: '10px 0 30px 0' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{
            fontSize: '48px',
            marginBottom: '15px',
            animation: 'bounce 2s infinite'
          }}>
            {selectedCategory?.icon || '📝'}
          </div>
          <h2 style={{
            fontSize: '32px',
            fontWeight: '800',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            marginBottom: '10px'
          }}>
            Submit Your Achievement
          </h2>
          <p style={{ color: '#666', fontSize: '16px' }}>Share your accomplishments with the world</p>
        </div>
        
        {message && (
          <div className={`alert ${message.includes('Error') ? 'alert-error' : 'alert-success'}`}
               style={{ marginBottom: '30px' }}>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Category Selection */}
          <div className="form-group">
            <label>Category *</label>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', 
              gap: '15px',
              marginTop: '10px'
            }}>
              {categories.map(cat => (
                <div
                  key={cat.value}
                  onClick={() => setFormData(prev => ({ ...prev, category: cat.value }))}
                  style={{
                    padding: '20px 15px',
                    borderRadius: '15px',
                    border: formData.category === cat.value ? 
                      `3px solid ${cat.color}` : '2px solid rgba(255,255,255,0.3)',
                    background: formData.category === cat.value ? 
                      `linear-gradient(135deg, ${cat.color}22, ${cat.color}11)` : 'rgba(255,255,255,0.8)',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    textAlign: 'center',
                    transform: formData.category === cat.value ? 'translateY(-5px) scale(1.05)' : 'translateY(0)',
                    boxShadow: formData.category === cat.value ? 
                      `0 10px 25px ${cat.color}33` : '0 5px 15px rgba(0,0,0,0.1)'
                  }}
                >
                  <div style={{ fontSize: '24px', marginBottom: '8px' }}>{cat.icon}</div>
                  <div style={{ fontWeight: '600', fontSize: '14px', color: '#333' }}>{cat.value}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Title */}
          <div className="form-group">
            <label>Achievement Title *</label>
            <input
              type="text"
              name="title"
              required
              value={formData.title}
              onChange={handleChange}
              className="form-control"
              placeholder="e.g., AWS Cloud Practitioner Certification"
              style={{
                fontSize: '18px',
                padding: '18px 24px',
                background: formData.title ? 'rgba(255,255,255,1)' : 'rgba(255,255,255,0.9)'
              }}
            />
          </div>

          {/* Organization */}
          <div className="form-group">
            <label>Organization/Platform *</label>
            <input
              type="text"
              name="organization"
              required
              value={formData.organization}
              onChange={handleChange}
              className="form-control"
              placeholder="e.g., Amazon Web Services, Google, Microsoft"
              style={{
                fontSize: '18px',
                padding: '18px 24px',
                background: formData.organization ? 'rgba(255,255,255,1)' : 'rgba(255,255,255,0.9)'
              }}
            />
          </div>

          {/* Duration */}
          <div className="form-group">
            <label>Duration/Date</label>
            <input
              type="text"
              name="duration"
              value={formData.duration}
              onChange={handleChange}
              className="form-control"
              placeholder="e.g., 3 months, Jan 2024, 2023-2024"
              style={{
                fontSize: '18px',
                padding: '18px 24px',
                background: formData.duration ? 'rgba(255,255,255,1)' : 'rgba(255,255,255,0.9)'
              }}
            />
          </div>

          {/* Description */}
          <div className="form-group">
            <label>Description</label>
            <textarea
              name="description"
              rows="4"
              value={formData.description}
              onChange={handleChange}
              className="form-control"
              placeholder="Tell us about your achievement, what you learned, and its impact..."
              style={{
                fontSize: '16px',
                padding: '18px 24px',
                background: formData.description ? 'rgba(255,255,255,1)' : 'rgba(255,255,255,0.9)',
                resize: 'vertical',
                minHeight: '120px'
              }}
            />
          </div>

          {/* File Upload */}
          <div className="form-group">
            <label>Certificate/Document</label>
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              style={{
                border: dragActive ? '3px dashed #667eea' : '2px dashed rgba(255,255,255,0.5)',
                borderRadius: '20px',
                padding: '40px 20px',
                textAlign: 'center',
                background: dragActive ? 'rgba(102, 126, 234, 0.1)' : 'rgba(255,255,255,0.8)',
                transition: 'all 0.3s ease',
                cursor: 'pointer',
                position: 'relative'
              }}
              onClick={() => document.getElementById('file-input').click()}
            >
              <div style={{ fontSize: '48px', marginBottom: '15px' }}>
                {aiProcessing ? '🤖' : (formData.file ? '📄' : '☁️')}
              </div>
              <div style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px', color: '#333' }}>
                {aiProcessing ? 'AI is analyzing your certificate...' : 
                 formData.file ? formData.file.name : 'Drop your file here or click to browse'}
              </div>
              <div style={{ fontSize: '14px', color: '#666' }}>
                Supported: PDF, JPG, PNG (Max 5MB)
              </div>
              <input
                id="file-input"
                type="file"
                name="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleChange}
                style={{ display: 'none' }}
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
            style={{
              width: '100%',
              padding: '18px',
              fontSize: '18px',
              fontWeight: '700',
              marginTop: '20px',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            {loading ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
                <div className="loading-spinner" style={{ width: '24px', height: '24px', margin: '0' }}></div>
                Processing Your Achievement...
              </div>
            ) : (
              <span>🚀 Submit Achievement</span>
            )}
          </button>
        </form>
      </div>

      <style>{`
        @keyframes bounce {
          0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-10px); }
          60% { transform: translateY(-5px); }
        }
      `}</style>
    </div>
  );
};

export default SubmissionForm;