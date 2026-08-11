// marquee content
const baseItems = ["YOUR BUSINESS","YOUR WEBSITE","YOUR BRAND","YOUR CUSTOMERS"];
const items = [...baseItems, ...baseItems, ...baseItems, ...baseItems]; // ensures it spans ultra-wide screens
const track = document.getElementById('marqueeTrack');
const html = items.map(t => `<span><b>●</b> ${t}</span>`).join('');
track.innerHTML = html + html;

// mobile nav
const navToggle = document.getElementById('navToggle');
navToggle.addEventListener('click', () => {
  const open = document.body.classList.toggle('nav-open');
  navToggle.setAttribute('aria-expanded', open);
});
document.querySelectorAll('.mobile-panel a').forEach(a=>{
  a.addEventListener('click', ()=> document.body.classList.remove('nav-open'));
});

// faq accordion
document.querySelectorAll('.faq-item').forEach(item=>{
  const q = item.querySelector('.faq-q');
  const a = item.querySelector('.faq-a');
  q.addEventListener('click', ()=>{
    const isOpen = item.classList.contains('open');
    document.querySelectorAll('.faq-item.open').forEach(o=>{
      o.classList.remove('open');
      o.querySelector('.faq-a').style.maxHeight = null;
    });
    if(!isOpen){
      item.classList.add('open');
      a.style.maxHeight = a.scrollHeight + 'px';
    }
  });
});

// ====== CHATBOT LOGIC ======
const fabBtn = document.getElementById('fabBtn');
const chatWidget = document.getElementById('chatWidget');
const chatClose = document.getElementById('chatClose');

// ====== POPUP & CHECKOUT LOGIC ======
const offerModal = document.getElementById('offerModal');
const mockupModal = document.getElementById('mockupModal');

// Show offer after 3 seconds
setTimeout(() => {
  if(!sessionStorage.getItem('offerSeen')) {
    if(offerModal) offerModal.classList.add('open');
    sessionStorage.setItem('offerSeen', 'true');
  }
}, 3000);

function openCheckout() {
  if(offerModal) offerModal.classList.remove('open');
  setTimeout(() => {
    if(mockupModal) mockupModal.classList.add('open');
  }, 300);
}

// ====== FORMSPREE AJAX SUBMISSION ======
const forms = document.querySelectorAll('form[action^="https://formspree.io"]');

forms.forEach(form => {
  // Ensure form is relative to contain the overlay
  form.style.position = 'relative';
  
  // Create overlay
  const overlay = document.createElement('div');
  overlay.style.cssText = 'position:absolute; top:0; left:0; width:100%; height:100%; background:rgba(255,255,255,0.95); z-index:10; display:flex; flex-direction:column; align-items:center; justify-content:center; opacity:0; pointer-events:none; transition:opacity 0.3s; border-radius:inherit;';
  
  const spinner = document.createElement('div');
  spinner.innerHTML = '<div style="width:40px;height:40px;border:4px solid #f3f3f3;border-top:4px solid var(--blue);border-radius:50%;animation:spin 1s linear infinite; margin:0 auto;"></div><p style="margin-top:16px;font-weight:600;color:var(--ink);">Sending securely...</p>';
  spinner.style.textAlign = 'center';
  
  const success = document.createElement('div');
  success.style.display = 'none';
  success.innerHTML = '<div style="background:#10B981;color:#fff;width:64px;height:64px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:32px;margin:0 auto 16px;">✓</div><h3 style="color:var(--ink);margin-bottom:8px;font-size:1.4rem;">Sent Successfully!</h3><p style="color:var(--ink-soft);text-align:center;">We will contact you soon.</p>';
  
  overlay.appendChild(spinner);
  overlay.appendChild(success);
  form.appendChild(overlay);

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Show loading overlay
    overlay.style.opacity = '1';
    overlay.style.pointerEvents = 'auto';
    spinner.style.display = 'block';
    success.style.display = 'none';

    try {
      const formData = new FormData(form);
      const response = await fetch(form.action, {
        method: form.method,
        body: formData,
        headers: { 'Accept': 'application/json' }
      });
      
      if (response.ok) {
        // Show success state
        spinner.style.display = 'none';
        success.style.display = 'block';
        success.style.textAlign = 'center';
        form.reset();
        
        // Hide overlay after 4 seconds and close modal if inside one
        setTimeout(() => {
          overlay.style.opacity = '0';
          overlay.style.pointerEvents = 'none';
          const modal = form.closest('.modal');
          if(modal) {
            modal.classList.remove('open');
            // reset overlay for next time
            setTimeout(() => { spinner.style.display = 'block'; success.style.display = 'none'; }, 500);
          }
        }, 4000);
      } else {
        spinner.innerHTML = '<p style="color:#E23E3E;font-weight:600;">Error. Please try again.</p>';
        setTimeout(() => { overlay.style.opacity = '0'; overlay.style.pointerEvents = 'none'; }, 3000);
      }
    } catch (err) {
      spinner.innerHTML = '<p style="color:#E23E3E;font-weight:600;">Network Error. Please try again.</p>';
      setTimeout(() => { overlay.style.opacity = '0'; overlay.style.pointerEvents = 'none'; }, 3000);
    }
  });
});

const chatBody = document.getElementById('chatBody');
const chatInput = document.getElementById('chatInput');
const chatSend = document.getElementById('chatSend');
const chatOptions = document.getElementById('chatOptions');
const chatInputArea = document.getElementById('chatInputArea');

let chatState = 'INIT';
let userData = { name: '', phone: '', project: '' };

// Toggle chat
fabBtn.addEventListener('click', (e) => {
  e.preventDefault();
  chatWidget.classList.add('open');
  if(chatState === 'INIT') {
    chatState = 'ASK_NAME';
    setTimeout(() => {
      addMessage('bot', "Hi there! I'm the TECKNISIAN assistant. 👋");
      setTimeout(() => {
        addMessage('bot', "What's your name?");
      }, 600);
    }, 300);
  }
});

chatClose.addEventListener('click', () => {
  chatWidget.classList.remove('open');
});

function addMessage(sender, text) {
  const div = document.createElement('div');
  div.className = `msg ${sender}`;
  div.innerHTML = text;
  chatBody.appendChild(div);
  chatBody.scrollTop = chatBody.scrollHeight;
}

function showOptions(options) {
  chatOptions.innerHTML = '';
  chatInputArea.style.display = 'none';
  options.forEach(opt => {
    const btn = document.createElement('button');
    btn.className = 'chat-opt-btn';
    btn.textContent = opt.label;
    btn.onclick = () => {
      addMessage('user', opt.label);
      chatOptions.innerHTML = '';
      chatInputArea.style.display = 'flex';
      opt.callback();
    };
    chatOptions.appendChild(btn);
  });
}

function handleSend() {
  const text = chatInput.value.trim();
  if(!text) return;
  chatInput.value = '';
  addMessage('user', text);
  
  if (chatState === 'ASK_NAME') {
    userData.name = text;
    chatState = 'ASK_PHONE';
    setTimeout(() => {
      addMessage('bot', `Nice to meet you, ${userData.name}! What's your phone or WhatsApp number so we can reach you?`);
    }, 600);
  } else if (chatState === 'ASK_PHONE') {
    userData.phone = text;
    chatState = 'ASK_PROJECT';
    setTimeout(() => {
      addMessage('bot', "Got it. What are you looking to build?");
      showOptions([
        { label: "Starter Website", callback: () => handleProjectSelection("Starter Website", "Our starter websites begin at just ₹1,000.") },
        { label: "Restaurant Website", callback: () => handleProjectSelection("Restaurant Website", "Restaurant websites with menus and WhatsApp ordering start at ₹1,500.") },
        { label: "Business Web App", callback: () => handleProjectSelection("Business Web App", "Web apps require a custom quote based on your exact needs, but our team will give you an exact number when they call.") },
        { label: "Something else", callback: () => handleProjectSelection("Something else", "We can definitely help with that.") }
      ]);
    }, 600);
  }
}

function handleProjectSelection(project, priceText) {
  userData.project = project;
  chatState = 'DONE';
  setTimeout(() => {
    addMessage('bot', `Great! ${priceText}`);
    setTimeout(() => {
      addMessage('bot', `Thanks for reaching out. We have noted your details and will call you back at ${userData.phone} very soon!`);
      
      // Send Transcript to backend/email
      fetch('https://formspree.io/f/xbgrgwkg', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({
           "Lead Name": userData.name,
           "Phone / WhatsApp": userData.phone,
           "Project Requirement": userData.project,
           "Source": "AI Chatbot"
        })
      }).catch(err => console.log('Formspree Error:', err));
      
      // Fallback manual whatsapp button
      setTimeout(() => {
         const waText = `Hi, I'm ${userData.name}. My number is ${userData.phone}. I am looking for: ${userData.project}.`;
         const waUrl = `https://wa.me/919739161304?text=${encodeURIComponent(waText)}`;
         addMessage('bot', `If you don't want to wait, you can also <a href="${waUrl}" target="_blank" style="color:var(--blue);font-weight:bold;text-decoration:underline;">click here to send this to our WhatsApp directly</a>.`);
      }, 1500);
    }, 1200);
  }, 600);
}

chatSend.addEventListener('click', handleSend);
chatInput.addEventListener('keypress', (e) => {
  if(e.key === 'Enter') handleSend();
});
