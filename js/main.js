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

// Timer countdown logic
let timerSecs = 5 * 60; // 5 mins
const timerEl = document.getElementById('offerTimer');
if(timerEl) {
  setInterval(() => {
    if(timerSecs > 0) {
      timerSecs--;
      const m = Math.floor(timerSecs / 60).toString().padStart(2, '0');
      const s = (timerSecs % 60).toString().padStart(2, '0');
      timerEl.textContent = `⏱ ${m}:${s}`;
    }
  }, 1000);
}

function openCheckout() {
  if(offerModal) offerModal.classList.remove('open');
  setTimeout(() => {
    if(mockupModal) mockupModal.classList.add('open');
  }, 300);
}
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
