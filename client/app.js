// document.getElementById('pay-button').onclick = async () => {
//     const amount = document.getElementById('amount').value;
//     if (!amount) return alert("Enter an amount!");

//     const res = await fetch('http://localhost:3000/create-invoice', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ amount })
//     });

//     const invoice = await res.json();
//     const qrURL = `https://api.qrserver.com/v1/create-qr-code/?data=lightning:${invoice.payment_request}`;

//     document.getElementById('qrcode').innerHTML = `<img src="${qrURL}" alt="Invoice QR Code">`;
// };
// document.getElementById('pay-button').onclick = async () => {
//     const amount = document.getElementById('amount').value;
//     if (!amount) return alert("Enter an amount!");

//     const res = await fetch('http://localhost:3000/create-invoice', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ amount })
//     });

//     const invoice = await res.json();
//     const bolt11 = invoice.payment_request;
//     const qrURL = `https://api.qrserver.com/v1/create-qr-code/?data=lightning:${bolt11}`;

//     document.getElementById('qrcode').innerHTML = `
//         <p><strong>Invoice:</strong></p>
//         <textarea style="width:100%;height:100px;" readonly>${bolt11}</textarea>
//         <p><strong>QR Code:</strong></p>
//         <img src="${qrURL}" alt="Invoice QR Code">
//     `;
// };

const socket = io();
const form = document.getElementById('invoiceForm');
const qrContainer = document.getElementById('qrcode');
const invoiceDetails = document.getElementById('invoiceDetails');
const invoiceAmountEl = document.getElementById('invoiceAmount');
const invoiceText = document.getElementById('invoiceText');
const toggleButton = document.getElementById('toggleTextButton');
const usdAmountEl = document.getElementById('usdAmount');
const timerEl = document.getElementById('timer');

let currentPaymentRequest = '';
let expiryTimer;

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const amount = document.getElementById('amount').value;
  if (!amount) return alert("Enter an amount!");

  qrContainer.innerHTML = '';
  invoiceDetails.style.display = 'none';
  invoiceText.style.display = 'none';
  toggleButton.style.display = 'none';
  usdAmountEl.textContent = '';
  timerEl.textContent = '';

  const res = await fetch('/create-invoice', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ amount })
  });

  const data = await res.json();
  currentPaymentRequest = data.payment_request;
  const createdAt = Date.now();

  invoiceDetails.style.display = 'block';
  invoiceAmountEl.textContent = `💰 Invoice Amount: ${amount} sats`;

  new QRCode(qrContainer, {
    text: currentPaymentRequest,
    width: 256,
    height: 256
  });

  invoiceText.textContent = currentPaymentRequest;
  toggleButton.textContent = 'Show Raw Invoice';
  toggleButton.style.display = 'inline-block';
  invoiceText.style.display = 'none';

  fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd')
    .then(res => res.json())
    .then(data => {
      const price = data.bitcoin.usd;
      const usd = (amount * price / 100000000).toFixed(2);
      usdAmountEl.textContent = `≈ $${usd} USD`;
    });

  clearInterval(expiryTimer);
  let secondsLeft = 3600; // 1 hour expiry
  expiryTimer = setInterval(() => {
    if (secondsLeft <= 0) {
      clearInterval(expiryTimer);
      timerEl.textContent = '⏰ Invoice expired';
      qrContainer.innerHTML = '';
      toggleButton.style.display = 'none';
      invoiceText.textContent = '';
    } else {
      const mins = Math.floor(secondsLeft / 60);
      const secs = secondsLeft % 60;
      timerEl.textContent = `⏳ Expires in: ${mins}:${secs.toString().padStart(2, '0')}`;
      secondsLeft--;
    }
  }, 1000);
});

toggleButton.addEventListener('click', () => {
  const isVisible = invoiceText.style.display === 'block';
  invoiceText.style.display = isVisible ? 'none' : 'block';
  toggleButton.textContent = isVisible ? 'Show Raw Invoice' : 'Hide Raw Invoice';
});

socket.on('invoicePaid', (invoice) => {
  const paidMessage = '✅ PAID!';
  invoiceAmountEl.textContent += ` ${paidMessage}`;
  invoiceAmountEl.classList.add('paidStatus');
  invoiceText.style.display = 'none';
  clearInterval(expiryTimer);
  timerEl.textContent = '';
});

function copyInvoice() {
  if (!currentPaymentRequest) return alert("No invoice to copy!");
  navigator.clipboard.writeText(currentPaymentRequest)
    .then(() => alert("Invoice copied!"))
    .catch(err => alert("Copy failed: " + err));
}


