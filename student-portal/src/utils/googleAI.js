// Google Vision API for certificate text extraction
export const extractTextFromImage = async (imageFile) => {
  const API_KEY = process.env.REACT_APP_GOOGLE_API_KEY;
  
  if (!API_KEY) {
    throw new Error('Google API key not found');
  }

  // Convert file to base64
  const base64 = await new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => {
      const base64String = reader.result.split(',')[1];
      resolve(base64String);
    };
    reader.readAsDataURL(imageFile);
  });

  const response = await fetch(`https://vision.googleapis.com/v1/images:annotate?key=${API_KEY}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      requests: [{
        image: {
          content: base64
        },
        features: [{
          type: 'TEXT_DETECTION',
          maxResults: 1
        }]
      }]
    })
  });

  if (!response.ok) {
    throw new Error(`Vision API error: ${response.status}`);
  }

  const data = await response.json();
  
  if (data.responses && data.responses[0] && data.responses[0].textAnnotations) {
    return data.responses[0].textAnnotations[0].description;
  }
  
  return null;
};

// Simple text extraction from file name and basic pattern matching
export const extractCertificateDetails = (fileName) => {
  if (!fileName) return {};

  const name = fileName.toLowerCase();
  const details = {};

  // Extract organization from filename
  if (name.includes('codechef')) {
    details.organization = 'CodeChef';
    details.type = 'Certification';
  } else if (name.includes('google')) {
    details.organization = 'Google';
  } else if (name.includes('microsoft')) {
    details.organization = 'Microsoft';
  } else if (name.includes('amazon') || name.includes('aws')) {
    details.organization = 'AWS';
  } else if (name.includes('coursera')) {
    details.organization = 'Coursera';
  } else if (name.includes('udemy')) {
    details.organization = 'Udemy';
  } else if (name.includes('tata')) {
    details.organization = 'TATA';
  }

  // Extract programming language/skill
  if (name.includes('python')) {
    details.title = 'Python Programming';
    details.type = 'Certification';
  } else if (name.includes('java')) {
    details.title = 'Java Programming';
    details.type = 'Certification';
  } else if (name.includes('test') || name.includes('quiz')) {
    details.title = 'Online Test';
    details.type = 'Certification';
  }

  // Extract year from filename
  const yearMatch = name.match(/20\d{2}/);
  if (yearMatch) {
    details.year = yearMatch[0];
  }

  // Determine category from filename
  if (name.includes('certificate') || name.includes('cert')) {
    details.type = 'Certification';
  } else if (name.includes('project')) {
    details.type = 'Project';
  } else if (name.includes('internship')) {
    details.type = 'Internship';
  } else if (name.includes('50') && name.includes('days')) {
    details.title = '50 Days Challenge';
    details.type = 'Certification';
  }

  return details;
};