// ==================== STEP 15: GLOBAL VARIABLES ====================
const API_URL = "https://phi-lab-server.vercel.app/api/v1/lab";
let allIssues = [];   // Store all fetched issues

// ==================== STEP 16: AUTHENTICATION ====================
function handleLogin() {
    const user = document.getElementById('userInput').value;
    const pass = document.getElementById('passInput').value;

    // Simple hardcoded check
    if (user === 'admin' && pass === 'admin123') {
        document.getElementById('loginPage').classList.add('hidden');
        document.getElementById('dashboardPage').classList.remove('hidden');
        fetchIssues();   // Load issues after successful login
    } else {
        showToast("Invalid Credentials!");
    }
}

// ==================== STEP 17: FETCH ALL ISSUES FROM API ====================
async function fetchIssues() {
    setLoading(true);
    try {
        const response = await fetch(`${API_URL}/issues`);
        const result = await response.json();
        // API returns data inside 'data' property; handle both formats
        allIssues = Array.isArray(result.data) ? result.data : (Array.isArray(result) ? result : []);
        renderIssues(allIssues);
    } catch (error) {
        console.error("Fetch error:", error);
        showToast("Error loading issues. Please try again.");
    } finally {
        setLoading(false);
    }
}

// ==================== STEP 18: SEARCH FUNCTIONALITY ====================
async function handleSearch() {
    const query = document.getElementById('searchInput').value.trim();
    if (!query) {
        renderIssues(allIssues);   // If empty, show all issues
        return;
    }

    setLoading(true);
    try {
        const response = await fetch(`${API_URL}/issues/search?q=${query}`);
        const result = await response.json();
        const searchResults = Array.isArray(result.data) ? result.data : (Array.isArray(result) ? result : []);
        renderIssues(searchResults);
    } catch (error) {
        console.error("Search error:", error);
        showToast("Search failed.");
    } finally {
        setLoading(false);
    }
}

// ==================== STEP 19: RENDER ISSUE CARDS ====================
function renderIssues(issues) {
    const grid = document.getElementById('issueGrid');
    const countDisplay = document.getElementById('issueCount');
    grid.innerHTML = "";
    countDisplay.innerText = issues.length;

    if (!issues || issues.length === 0) {
        grid.innerHTML = `<div class="col-span-full py-20 text-center text-slate-400">No issues found.</div>`;
        return;
    }

    issues.forEach(issue => {
        const status = (issue.status || 'open').toLowerCase();
        const isOpened = status === 'open';
        const borderColor = isOpened ? 'border-t-emerald-500' : 'border-t-purple-500';
        const iconColor = isOpened ? 'text-emerald-500 border-emerald-300' : 'text-purple-500 border-purple-300';

        const card = document.createElement('div');
        card.className = `bg-white p-6 rounded-xl border-t-4 ${borderColor} border-x border-b border-slate-100 issue-card cursor-pointer flex flex-col`;
        card.onclick = () => openModal(issue._id || issue.id);   // Click card to open modal

        // Fill card with issue data
        card.innerHTML = `
                    <div class="flex justify-between items-start mb-4">
                        <div class="w-8 h-8 rounded-full border-2 border-dotted ${iconColor} flex items-center justify-center">
                            <i class="fa-solid fa-circle-notch text-[10px]"></i>
                        </div>
                        <span class="text-[10px] font-extrabold px-3 py-1 bg-rose-50 text-rose-500 rounded-full uppercase tracking-wider">${issue.priority || 'Medium'}</span>
                    </div>
                    <h3 class="font-bold text-[15px] text-slate-800 mb-2 leading-tight line-clamp-2">${issue.title || 'Untitled Issue'}</h3>
                    <p class="text-slate-400 text-xs mb-5 line-clamp-2 leading-relaxed flex-grow">${issue.description || 'No description provided.'}</p>
                    
                    <div class="flex flex-wrap gap-2 mb-6">
                        <span class="text-[10px] px-2.5 py-1 bg-rose-100 text-rose-600 rounded-md font-bold uppercase"># ${issue.label || 'ISSUE'}</span>
                    </div>

                    <div class="pt-4 border-t border-slate-50 flex justify-between items-center mt-auto">
                        <div class="text-[11px] font-medium text-slate-400">
                            #${(issue._id || '00').toString().slice(-2)} by <span class="text-slate-600 font-bold">${issue.author || 'User'}</span>
                        </div>
                        <div class="text-[11px] text-slate-400 font-medium">${formatDate(issue.createdAt)}</div>
                    </div>
                `;
        grid.appendChild(card);
    });
}

// ==================== STEP 20: FILTER BY STATUS (ALL/OPEN/CLOSED) ====================
function filterByStatus(status) {
    // Update active tab styling
    document.querySelectorAll('[id^="tab-"]').forEach(btn => btn.classList.remove('active-tab'));
    document.getElementById(`tab-${status}`).classList.add('active-tab');

    if (status === 'all') {
        renderIssues(allIssues);
    } else {
        const filtered = allIssues.filter(i => (i.status || 'open').toLowerCase() === status);
        renderIssues(filtered);
    }
}

// ==================== STEP 21: OPEN MODAL AND FETCH DETAILS ====================
async function openModal(id) {
    if (!id) return;
    const modal = document.getElementById('issueModal');
    const container = document.getElementById('modalContainer');
    const body = document.getElementById('modalBody');

    modal.classList.remove('hidden');
    setTimeout(() => {
        container.classList.remove('scale-95', 'opacity-0');
    }, 10);

    // Show loading spinner inside modal
    body.innerHTML = `<div class="flex justify-center py-10"><div class="loader rounded-full border-4 border-slate-200 h-10 w-10"></div></div>`;

    try {
        const response = await fetch(`${API_URL}/issue/${id}`);
        const result = await response.json();
        const issue = result.data;

        if (!issue) throw new Error("No data");

        const status = (issue.status || 'open').toLowerCase();
        const isOpened = status === 'open';
        const statusBg = isOpened ? 'bg-emerald-500' : 'bg-purple-500';

        // Render detailed issue information
        body.innerHTML = `
                    <div class="mb-8 text-left">
                        <h2 class="text-2xl md:text-3xl font-bold text-slate-900 mb-4">${issue.title || 'Untitled'}</h2>
                        <div class="flex items-center gap-3 flex-wrap">
                            <span class="${statusBg} text-white text-[12px] font-bold px-4 py-1.5 rounded-full capitalize">${issue.status}</span>
                            <span class="text-slate-400 text-sm">
                                Opened by <span class="text-slate-700 font-bold">${issue.author || 'User'}</span> • ${formatDate(issue.createdAt)}
                            </span>
                        </div>
                    </div>

                    <div class="flex gap-2 mb-10">
                        <span class="text-xs px-3 py-1 bg-rose-100 text-rose-600 rounded font-bold">${issue.label || 'BUG'}</span>
                    </div>

                    <div class="text-slate-600 text-base md:text-lg leading-relaxed mb-12 text-left">
                        ${issue.description || 'No description available for this issue.'}
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div class="bg-slate-50 p-6 rounded-2xl border border-slate-100 text-left">
                            <p class="text-slate-400 text-[11px] font-bold uppercase tracking-widest mb-2">Assignee:</p>
                            <p class="font-bold text-slate-800 text-lg">${issue.author || 'Unassigned'}</p>
                        </div>
                        <div class="bg-slate-50 p-6 rounded-2xl border border-slate-100 text-left">
                            <p class="text-slate-400 text-[11px] font-bold uppercase tracking-widest mb-2">Priority:</p>
                            <span class="bg-rose-500 text-white text-[11px] font-extrabold px-4 py-1.5 rounded-full uppercase tracking-wider">${issue.priority || 'Medium'}</span>
                        </div>
                    </div>
                `;
    } catch (error) {
        console.error("Modal Fetch error:", error);
        body.innerHTML = `<p class="text-center text-rose-500 font-bold py-10">Failed to load issue details. Please check the ID or your connection.</p>`;
    }
}

// ==================== STEP 22: CLOSE MODAL WITH ANIMATION ====================
function closeModal() {
    const modal = document.getElementById('issueModal');
    const container = document.getElementById('modalContainer');
    container.classList.add('scale-95', 'opacity-0');
    setTimeout(() => {
        modal.classList.add('hidden');
    }, 300);
}

// ==================== STEP 23: UTILITY FUNCTIONS ====================
// Show/hide loading spinner
function setLoading(isLoading) {
    document.getElementById('loadingState').classList.toggle('hidden', !isLoading);
    document.getElementById('issueGrid').classList.toggle('hidden', isLoading);
}

// Format date to DD/MM/YYYY
function formatDate(dateStr) {
    if (!dateStr) return "N/A";
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return "N/A";
    return date.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
}

// Simple toast notification
function showToast(msg) {
    const toast = document.createElement('div');
    toast.className = "fixed top-10 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-6 py-3 rounded-xl shadow-2xl z-[100] transition-all transform translate-y-[-20px] opacity-0 font-bold";
    toast.innerText = msg;
    document.body.appendChild(toast);
    setTimeout(() => {
        toast.classList.remove('translate-y-[-20px]', 'opacity-0');
    }, 10);
    setTimeout(() => {
        toast.classList.add('translate-y-[-20px]', 'opacity-0');
        setTimeout(() => toast.remove(), 500);
    }, 3000);
}