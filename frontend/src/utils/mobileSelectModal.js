// Mobile Select Modal Utility
class MobileSelectModal {
  constructor() {
    this.isMobile = window.innerWidth <= 768;
    this.init();
  }

  init() {
    if (!this.isMobile) return;
    
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.convertSelects());
    } else {
      this.convertSelects();
    }

    // Re-convert on route changes
    this.observeChanges();
  }

  convertSelects() {
    const selects = document.querySelectorAll('select');
    selects.forEach(select => this.convertToModal(select));
  }

  convertToModal(select) {
    if (select.dataset.converted) return;
    
    const wrapper = document.createElement('div');
    wrapper.className = 'mobile-select-wrapper';
    wrapper.innerHTML = `
      <div class="mobile-select-trigger" data-select-id="${select.id || Math.random()}">
        <span class="selected-text">${select.options[select.selectedIndex]?.text || 'Select an option'}</span>
        <span class="dropdown-arrow">▼</span>
      </div>
    `;

    select.style.display = 'none';
    select.dataset.converted = 'true';
    select.parentNode.insertBefore(wrapper, select);

    wrapper.querySelector('.mobile-select-trigger').addEventListener('click', () => {
      this.showModal(select);
    });
  }

  showModal(select) {
    const modal = document.createElement('div');
    modal.className = 'mobile-select-modal';
    modal.innerHTML = `
      <div class="modal-backdrop"></div>
      <div class="modal-content">
        <div class="modal-header">
          <h3>Select ${select.previousElementSibling?.querySelector('label')?.textContent || 'Option'}</h3>
          <button class="modal-close">×</button>
        </div>
        <div class="modal-options">
          ${Array.from(select.options).map(option => `
            <div class="modal-option ${option.selected ? 'selected' : ''}" data-value="${option.value}">
              ${option.text}
            </div>
          `).join('')}
        </div>
      </div>
    `;

    document.body.appendChild(modal);
    document.body.style.overflow = 'hidden';

    // Event listeners
    modal.querySelector('.modal-close').addEventListener('click', () => this.closeModal(modal));
    modal.querySelector('.modal-backdrop').addEventListener('click', () => this.closeModal(modal));
    
    modal.querySelectorAll('.modal-option').forEach(option => {
      option.addEventListener('click', () => {
        const value = option.dataset.value;
        select.value = value;
        select.dispatchEvent(new Event('change', { bubbles: true }));
        
        // Update trigger text
        const trigger = select.parentNode.querySelector('.selected-text');
        if (trigger) trigger.textContent = option.textContent;
        
        this.closeModal(modal);
      });
    });

    // Animate in
    setTimeout(() => modal.classList.add('show'), 10);
  }

  closeModal(modal) {
    modal.classList.remove('show');
    setTimeout(() => {
      document.body.removeChild(modal);
      document.body.style.overflow = '';
    }, 300);
  }

  observeChanges() {
    const observer = new MutationObserver(() => {
      if (this.isMobile) {
        setTimeout(() => this.convertSelects(), 100);
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }
}

// Initialize on mobile devices
if (window.innerWidth <= 768) {
  new MobileSelectModal();
}

// Re-initialize on resize
window.addEventListener('resize', () => {
  if (window.innerWidth <= 768 && !window.mobileSelectModal) {
    window.mobileSelectModal = new MobileSelectModal();
  }
});