window.alert = function(msg) {
  // Pehle se ek hai toh remove karo
  const existing = document.getElementById('custom-alert');
  if (existing) existing.remove();

  const overlay = document.createElement('div');
  overlay.id = 'custom-alert';
  overlay.style.cssText = `
    position: fixed;
    top: 0; left: 0;
    width: 100%; height: 100%;
    background: rgba(0,0,0,0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 99999;
  `;

  const box = document.createElement('div');
  box.style.cssText = `
    background: white;
    padding: 30px 40px;
    border-radius: 10px;
    box-shadow: 0 10px 30px rgba(0,0,0,0.3);
    text-align: center;
    min-width: 280px;
    font-family: Arial, sans-serif;
  `;

  const message = document.createElement('p');
  message.textContent = msg;
  message.style.cssText = `
    margin: 0 0 20px 0;
    font-size: 15px;
    color: #333;
  `;

  const btn = document.createElement('button');
  btn.textContent = 'OK';
  btn.style.cssText = `
    background: #4f46e5;
    color: white;
    border: none;
    padding: 10px 30px;
    border-radius: 6px;
    font-size: 14px;
    cursor: pointer;
  `;

  btn.onclick = () => overlay.remove();

  box.appendChild(message);
  box.appendChild(btn);
  overlay.appendChild(box);
  document.body.appendChild(overlay);

  // ✅ OK button pe focus — Enter se bhi band ho
  setTimeout(() => btn.focus(), 50);
};