const API_BASE = "https://phi-lab-server.vercel.app/api/v1/lab";
let allIssues = [];

// 1. Auth Logic
function handleLogin() {
    const user = document.getElementById('username').value;
    const pass = document.getElementById('password').value;

    if (user === 'admin' && pass === 'admin123') {
        document.getElementById('login-page').classList.add('hidden');
        document.getElementById('dashboard').classList.remove('hidden');
        fetchIssues();
    } else {
        alert("Invalid Credentials! Use admin / admin123");
    }
}

// 2. Data Fetching
async function fetchIssues() {
    toggleLoader(true);
    try {
        const res = await fetch(`${API_BASE}/issues`);
        const data = await res.json();
        allIssues = data.data;
        displayIssues(allIssues);
    } catch (err) {
        console.error("Error fetching issues:", err);
    } finally {
        toggleLoader(false);
    }
}

// 3. Display Logic
function displayIssues(issues) {
    const grid = document.getElementById('issueGrid');
    const countEl = document.getElementById('issueCount');
    countEl.innerText = issues.length;
    grid.innerHTML = "";

    issues.forEach(issue => {
        const borderClass = issue.status === 'open' ? 'border-t-emerald-500' : 'border-t-purple-500';
        const card = document.createElement('div');
        card.className = `bg-white p-5 rounded-xl border-t-4 ${borderClass} card-shadow cursor-pointer hover:scale-[1.02] transition transform`;
        card.onclick = () => openModal(issue._id);
        
        card.innerHTML = `
            <div class="flex justify-between items-start mb-4">
                <div class="w-8 h-8 rounded-full border-2 border-dashed border-emerald-400 flex items-center justify-center">
                    <i class="fa-solid fa-rotate text-[10px] text-emerald-500"></i>
                </div>
                <span class="text-[10px] font-bold px-3 py-1 bg-red-50 text-red-500 rounded-full uppercase">${issue.priority}</span>
            </div>
            <h3 class="font-bold text-gray-800 text-sm mb-2 line-clamp-2">${issue.title}</h3>
            <p class="text-gray-400 text-xs mb-4 line-clamp-2">${issue.description}</p>
            <div class="flex flex-wrap gap-2 mb-6">
                <span class="text-[10px] px-2 py-1 bg-red-100 text-red-600 rounded-md font-bold"># BUG</span>
                <span class="text-[10px] px-2 py-1 bg-orange-100 text-orange-600 rounded-md font-bold"># HELP WANTED</span>
            </div>
            <hr class="border-gray-100 mb-4">
            <div class="flex justify-between items-center text-[11px] text-gray-400">
                <span>#${issue._id.slice(-2)} by ${issue.author}</span>
                <span>${new Date(issue.createdAt).toLocaleDateString()}</span>
            </div>
        `;
        grid.appendChild(card);
    });
}

// 4. Filtering & Search
function filterIssues(status) {
    document.querySelectorAll('[id^="tab-"]').forEach(btn => btn.classList.remove('active-tab'));
    document.getElementById(`tab-${status}`).classList.add('active-tab');

    if (status === 'all') displayIssues(allIssues);
    else {
        const filtered = allIssues.filter(i => i.status === status);
        displayIssues(filtered);
    }
}

async function handleSearch() {
    const q = document.getElementById('searchInput').value;
    if (!q) return fetchIssues();
    
    toggleLoader(true);
    const res = await fetch(`${API_BASE}/issues/search?q=${q}`);
    const data = await res.json();
    displayIssues(data.data);
    toggleLoader(false);
}

// 5. Modal Logic
async function openModal(id) {
    const res = await fetch(`${API_BASE}/issue/${id}`);
    const data = await res.json();
    const issue = data.data;

    const modal = document.getElementById('modal');
    const content = document.getElementById('modalContent');
    
    content.innerHTML = `
        <h2 class="text-2xl font-bold text-gray-800 mb-2">${issue.title}</h2>
        <div class="flex gap-2 items-center mb-6">
            <span class="bg-emerald-500 text-white text-xs px-3 py-1 rounded-full capitalize">${issue.status}</span>
            <span class="text-gray-400 text-sm">• Opened by ${issue.author} • ${new Date(issue.createdAt).toLocaleDateString()}</span>
        </div>
        <div class="flex gap-2 mb-8">
             <span class="text-xs px-2 py-1 bg-red-100 text-red-600 rounded-md font-bold">BUG</span>
             <span class="text-xs px-2 py-1 bg-orange-100 text-orange-600 rounded-md font-bold">HELP WANTED</span>
        </div>
        <p class="text-gray-600 leading-relaxed mb-8">${issue.description}</p>
        <div class="grid grid-cols-2 gap-4">
            <div class="bg-gray-50 p-4 rounded-xl">
                <p class="text-gray-400 text-xs mb-1">Assignee:</p>
                <p class="font-bold">${issue.author}</p>
            </div>
            <div class="bg-gray-50 p-4 rounded-xl">
                <p class="text-gray-400 text-xs mb-1">Priority:</p>
                <span class="bg-red-500 text-white text-[10px] px-3 py-1 rounded-full uppercase font-bold">${issue.priority}</span>
            </div>
        </div>
    `;
    modal.classList.remove('hidden');
}

function closeModal() {
    document.getElementById('modal').classList.add('hidden');
}

function toggleLoader(show) {
    document.getElementById('loading').classList.toggle('hidden', !show);
    document.getElementById('issueGrid').classList.toggle('hidden', show);
}