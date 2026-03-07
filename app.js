const issueContainer = document.getElementById('issueContainer');
const loader = document.getElementById('loader');
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
                        # ${l}
                    </span>`;
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
    } finally {
        if(loader) loader.classList.add('hidden');
    }
}

function handleSearch() {
    const query = document.getElementById('searchInput').value.toLowerCase().trim();
    if (!query) {
        const activeTab = document.querySelector('.tab-btn.bg-[#4F46E5]').dataset.status;
        applyFilter(activeTab);
        return;
    }
    const filteredResults = allIssues.filter(issue => 
        issue.title.toLowerCase().includes(query)
    );

    issueCountText.innerText = `${filteredResults.length} Search Results`;
    renderCards(filteredResults);
}

document.getElementById('searchBtn').addEventListener('click', handleSearch);
document.getElementById('searchInput').addEventListener('input', handleSearch);