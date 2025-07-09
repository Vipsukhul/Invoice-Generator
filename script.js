document.addEventListener('DOMContentLoaded', function() {
    // Set current date
    const now = new Date();
    document.getElementById('invoiceDate').textContent = formatDate(now);
    
    // Initialize invoice items
    const itemsTable = document.getElementById('itemsTable');
    const addItemBtn = document.getElementById('addItemBtn');
    const generateBtn = document.getElementById('generateBtn');
    const printBtn = document.getElementById('printBtn');
    const saveBtn = document.getElementById('saveBtn');
    
    // Add event listeners
    addItemBtn.addEventListener('click', addNewItem);
    generateBtn.addEventListener('click', calculateTotals);
    printBtn.addEventListener('click', printInvoice);
    saveBtn.addEventListener('click', saveInvoice);
    
    // Calculate totals when quantity or rate changes
    itemsTable.addEventListener('input', function(e) {
        if (e.target.classList.contains('qty') || e.target.classList.contains('rate')) {
            updateRowTotal(e.target.closest('tr'));
            calculateTotals();
        }
    });
    
    // Remove item when remove button is clicked
    itemsTable.addEventListener('click', function(e) {
        if (e.target.classList.contains('remove-btn')) {
            e.target.closest('tr').remove();
            updateSerialNumbers();
            calculateTotals();
        }
    });
    
    // Initialize calculations
    calculateTotals();
    
    function formatDate(date) {
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        
        return `${day}/${month}/${year} ${hours}:${minutes}`;
    }
    
    function addNewItem() {
        const newRow = document.createElement('tr');
        const rowCount = itemsTable.querySelectorAll('tr').length + 1;
        
        newRow.innerHTML = `
            <td>${rowCount}</td>
            <td><input type="text" placeholder="Item description"></td>
            <td><input type="number" class="qty" value="1" min="1"></td>
            <td><input type="number" class="rate" value="0" min="0" step="0.01"></td>
            <td class="total">0</td>
            <td><button class="remove-btn">×</button></td>
        `;
        
        itemsTable.appendChild(newRow);
    }
    
    function updateRowTotal(row) {
        const qty = parseFloat(row.querySelector('.qty').value) || 0;
        const rate = parseFloat(row.querySelector('.rate').value) || 0;
        const totalCell = row.querySelector('.total');
        
        totalCell.textContent = (qty * rate).toFixed(2);
    }
    
    function updateSerialNumbers() {
        const rows = itemsTable.querySelectorAll('tr');
        rows.forEach((row, index) => {
            row.cells[0].textContent = index + 1;
        });
    }
    
    function calculateTotals() {
        const rows = itemsTable.querySelectorAll('tr');
        let subtotal = 0;
        
        rows.forEach(row => {
            const total = parseFloat(row.querySelector('.total').textContent) || 0;
            subtotal += total;
        });
        
        const gst = subtotal * 0.18;
        const discount = parseFloat(document.getElementById('discount').value) || 0;
        const grandTotal = subtotal + gst - discount;
        
        document.getElementById('subtotal').textContent = subtotal.toFixed(2);
        document.getElementById('gst').textContent = gst.toFixed(2);
        document.getElementById('grandTotal').textContent = grandTotal.toFixed(2);
        
        // Update amount in words
        updateAmountInWords(grandTotal);
    }
    
    function updateAmountInWords(amount) {
        const words = numberToWords(amount);
        document.getElementById('amountWords').value = words + ' Only';
    }
    
    function numberToWords(num) {
        // Simplified number to words conversion
        // For a complete solution, consider using a library
        const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
        const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
        const tens = ['', 'Ten', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
        
        num = Math.floor(num);
        
        if (num === 0) return 'Zero';
        if (num < 10) return ones[num];
        if (num < 20) return teens[num - 10];
        if (num < 100) return tens[Math.floor(num / 10)] + (num % 10 !== 0 ? ' ' + ones[num % 10] : '');
        
        return 'Amount in words';
    }
    
    function printInvoice() {
        calculateTotals();
        window.print();
    }
    
  // Add this to your existing script.js
async function saveInvoice() {
    calculateTotals();
    
    const invoiceData = {
        invoiceNo: document.getElementById('invoiceNo').value,
        date: document.getElementById('invoiceDate').textContent,
        customerTitle: document.getElementById('customerTitle').value,
        customerName: document.getElementById('customerName').value,
        customerAddress: document.getElementById('customerAddress').value,
        customerMobile: document.getElementById('customerMobile').value,
        items: [],
        subtotal: document.getElementById('subtotal').textContent,
        gst: document.getElementById('gst').textContent,
        discount: document.getElementById('discount').value,
        grandTotal: document.getElementById('grandTotal').textContent,
        amountWords: document.getElementById('amountWords').value
    };
    
    const rows = itemsTable.querySelectorAll('tr');
    rows.forEach(row => {
        invoiceData.items.push({
            description: row.querySelector('td:nth-child(2) input').value,
            qty: row.querySelector('.qty').value,
            rate: row.querySelector('.rate').value,
            total: row.querySelector('.total').textContent
        });
    });
    
    try {
        const response = await fetch('save_invoice.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(invoiceData)
        });
        
        const result = await response.json();
        
        if (result.success) {
            alert(`Invoice saved successfully! Invoice ID: ${result.invoice_id}`);
            // Optionally redirect or clear form
        } else {
            alert(`Error saving invoice: ${result.message}`);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Failed to save invoice. Please check console for details.');
    }
}
