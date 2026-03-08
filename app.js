const issueContainer = document.getElementById('issueContainer');
const loader = document.getElementById('tabLoader');
const issueCountText = document.getElementById('issueCount');
const tabs = document.querySelectorAll('.tab-btn');

let allIssues = [];

function renderCards(issues) {
    if (!issues || issues.length === 0) {
        issueContainer.innerHTML = `<p class="col-span-full text-center text-gray-400 py-10 font-medium">No issues found.</p>`;
        return;
    }
    issueContainer.innerHTML = issues.map(issue => {
        const isOpen = issue.status.toLowerCase() === 'open';
        const borderColor = isOpen ? 'border-green-500' : 'border-purple-500';
        const statusIcon = isOpen ? 'assets/Open-Status.png' : 'assets/Closed.png';
        const labelBadges = (issue.labels || []).map(l => {
            let colors = "bg-orange-50 text-orange-600 border-orange-100";
            if (l.toLowerCase() === 'bug') colors = "bg-red-50 text-red-600 border-red-100";
            if (l.toLowerCase() === 'enhancement') colors = "bg-green-50 text-green-600 border-green-100";
            if (l.toLowerCase().includes('help')) colors = "bg-yellow-50 text-yellow-600 border-yellow-100";
            
            return `<span class="${colors} text-[10px] px-2 py-0.5 rounded-md border font-bold uppercase flex items-center gap-1">
                        <img src="assets/${l.replace(' ', '')}.png" class="w-2.5 h-2.5" onerror="this.style.display='none'"> 
                        ${l}</span>`;
                    }).join('');

        return `
            <div class="bg-white p-5 rounded-xl border border-gray-100 border-t-4 ${borderColor} shadow-sm hover:shadow-md transition cursor-pointer flex flex-col h-full" onclick="openModal('${issue.id}')">
                <div class="flex justify-between items-start mb-4">
                    <img src="${statusIcon}" class="w-6 h-6" alt="${issue.status}">
                    
                    <span class="text-[10px] font-black px-2 py-0.5 rounded border uppercase ${issue.priority === 'high' ? 'text-red-500 border-red-100' : 'text-orange-500 border-orange-100'}">
                        ${issue.priority}
                    </span>
                </div>
                
                <h3 class="font-bold text-gray-800 text-[14px] mb-2 leading-tight line-clamp-2">${issue.title}</h3>
                <p class="text-gray-400 text-[12px] mb-4 line-clamp-2 leading-relaxed flex-grow">${issue.description}</p>
                
                <div class="flex flex-wrap gap-2 mb-5">
                    ${labelBadges}
                </div>

                <div class="flex justify-between items-center pt-3 border-t border-gray-50 text-[10px] text-gray-400 mt-auto">
                    <span class="font-medium">By <b class="text-gray-600">${issue.author}</b></span>
                    <span class="font-medium">${new Date(issue.createdAt).toLocaleDateString()}</span>
                </div>
            </div>
        `;
    }).join('');
}

async function fetchIssues() {
    issueContainer.innerHTML = '';
    if(loader) loader.classList.remove('hidden');

    const url = 'https://phi-lab-server.vercel.app/api/v1/lab/issues';

    try {
        const res = await fetch(url);
        const result = await res.json();
        
        allIssues = Array.isArray(result) ? result : (result.data || []);

        applyFilter('all');
    } catch (err) {
        console.error("Fetch Error:", err);
        issueCountText.innerText = "Error loading data";
        
        if(loader) loader.classList.add('hidden');
    }
}

function handleSearch() {
    const query = document.getElementById('searchInput').value.toLowerCase().trim();
    if (!query) {
        const activeTab = document.querySelector('.tab-btn.bg-\\[\\#4F46E5\\]');
        const status = activeTab ? activeTab.dataset.status : 'all';
        applyFilter(status);
        return;
    }
    const filteredResults = allIssues.filter(issue => 
        issue.title.toLowerCase().includes(query)
    );

    issueCountText.innerText = `${filteredResults.length} Search Results`;
    renderCards(filteredResults);
}

function applyFilter(statusType) {
    const tabLoader = document.getElementById('tabLoader');
    const issueContainer = document.getElementById('issueContainer');

    issueContainer.classList.add('hidden');
    tabLoader.classList.remove('hidden');

    setTimeout(() => {
        const filtered = statusType === 'all' ? allIssues : allIssues.filter(issue => issue.status.toLowerCase() === statusType.toLowerCase());
        
        issueCountText.innerText = `${filtered.length} Issues`;
        renderCards(filtered);

        tabLoader.classList.add('hidden');
        issueContainer.classList.remove('hidden');
    }, 300);
}

tabs.forEach(tab => {
    tab.addEventListener('click', (e) => {
        const clickedTab = e.currentTarget;
        if (clickedTab.classList.contains('bg-[#4F46E5]')) return;

        tabs.forEach(t => {
            t.classList.remove('bg-[#4F46E5]', 'text-white');
            t.classList.add('bg-white', 'text-gray-500', 'border-gray-200');
        });
        clickedTab.classList.add('bg-[#4F46E5]', 'text-white');
        clickedTab.classList.remove('bg-white', 'text-gray-500', 'border-gray-200');
        applyFilter(clickedTab.dataset.status);
    });
});

async function openModal(id) {
    const res = await fetch(`https://phi-lab-server.vercel.app/api/v1/lab/issue/${id}`);
    const result = await res.json();
    const issue = Array.isArray(result) ? result[0] : (result.data || result);

    const labelsHtml = (issue.labels || []).map(l => 
        `<span class="bg-gray-100 text-gray-600 px-2 py-1 rounded text-[10px] font-bold border"># ${l}</span>`
    ).join(' ');

    document.getElementById('modalBody').innerHTML = `
        <div class="mb-4">
            <div class="flex items-center gap-2 mb-1">
                <span class="bg-green-100 text-green-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">${issue.status}</span>
                <span class="text-gray-400 text-[10px]">Opened by <b>${issue.author}</b> • ${new Date(issue.createdAt).toLocaleDateString()}</span>
            </div>
            <h2 class="text-xl font-bold text-gray-900">${issue.title}</h2>
        </div>

        <div class="mb-6">
            <p class="text-[10px] font-bold text-gray-300 uppercase mb-2">Label</p>
            <div class="flex gap-2">${labelsHtml}</div>
        </div>

        <div class="mb-8">
            <p class="text-sm text-gray-600 leading-relaxed">${issue.description}</p>
        </div>

        <div class="flex gap-10 border-t pt-4">
            <div>
                <p class="text-[9px] text-gray-300 uppercase font-bold">Assignee</p>
                <p class="text-xs font-bold text-gray-800">${issue.author}</p>
            </div>
            <div>
                <p class="text-[9px] text-gray-300 uppercase font-bold">Priority</p>
                <p class="text-xs font-bold text-red-500 uppercase">${issue.priority}</p>
            </div>
        </div>`;
    document.getElementById('modalOverlay').classList.remove('hidden');
}

function closeModal() { document.getElementById('modalOverlay').classList.add('hidden'); }

document.getElementById('searchBtn').addEventListener('click', handleSearch);

fetchIssues();