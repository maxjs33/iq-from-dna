document.addEventListener('DOMContentLoaded', function() {
  // FAQ Accordions
  const faqItems = document.querySelectorAll('.faq-item');
  
  if (faqItems.length > 0) {
    faqItems.forEach(item => {
      const title = item.querySelector('h3');
      const content = item.querySelector('p');
      
      // Initially hide all content except the first one
      if (item !== faqItems[0]) {
        content.style.display = 'none';
      }
      
      title.addEventListener('click', () => {
        // Toggle current item
        content.style.display = content.style.display === 'none' ? 'block' : 'none';
        
        // Add animation class
        if (content.style.display === 'block') {
          content.classList.add('fade-in');
          title.classList.add('active');
        } else {
          title.classList.remove('active');
        }
      });
    });
  }
});

// Function for form validation
function validateForm() {
  let isValid = true;
  const requiredFields = document.querySelectorAll('[required]');
  
  requiredFields.forEach(field => {
    if (!field.value) {
      isValid = false;
      field.classList.add('error');
      
      // Add error message if it doesn't exist
      if (!field.nextElementSibling || !field.nextElementSibling.classList.contains('error-message')) {
        const errorMessage = document.createElement('div');
        errorMessage.classList.add('error-message');
        errorMessage.textContent = 'This field is required';
        field.parentNode.insertBefore(errorMessage, field.nextSibling);
      }
    } else {
      field.classList.remove('error');
      
      // Remove error message if it exists
      if (field.nextElementSibling && field.nextElementSibling.classList.contains('error-message')) {
        field.nextElementSibling.remove();
      }
    }
  });
  
  return isValid;
}

// Add percentile calculation to results page if it exists
const resultPage = document.querySelector('.results-container');
if (resultPage) {
  const scoreValue = parseInt(document.querySelector('.score-value').textContent);
  
  // Calculate percentile based on normal distribution (IQ mean=100, SD=15)
  function calculatePercentile(score) {
    // Approximate percentile calculation for IQ scores
    const zScore = (score - 100) / 15;
    
    // Cumulative distribution function for standard normal distribution
    function phi(x) {
      return (1.0 + Math.erf(x / Math.sqrt(2.0))) / 2.0;
    }
    
    return Math.round(phi(zScore) * 100);
  }
  
  const percentile = calculatePercentile(scoreValue);
  
  // Update percentile display
  const percentileValue = document.querySelector('.percentile-value');
  if (percentileValue) {
    percentileValue.textContent = percentile + '%';
  }
  
  // Update percentile bar
  const percentileFill = document.querySelector('.percentile-fill');
  if (percentileFill) {
    percentileFill.style.width = percentile + '%';
  }
}