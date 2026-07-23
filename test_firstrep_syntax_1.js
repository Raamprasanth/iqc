
        window.viewHistory = function(partNo) {
            if (!partNo) {
                alert('No Part No found for this component.');
                return;
            }
            document.getElementById('historyModal').classList.add('show');
            document.getElementById('historyLoading').style.display = 'block';
            document.getElementById('historyTimeline').style.display = 'none';

            fetch('/api/history/' + encodeURIComponent(partNo))
                .then(res => res.json())
                .then(data => {
                    document.getElementById('historyLoading').style.display = 'none';
                    const timeline = document.getElementById('historyTimeline');
                    timeline.style.display = 'block';
                    
                    if (data.error || data.length === 0) {
                        timeline.innerHTML = '<p style="color:var(--steel); font-size:0.85rem;">No history available.</p>';
                        return;
                    }

                    let html = '';
                    data.forEach(item => {
                        let badgeColor = 'var(--steel)';
                        if (item.status.includes('Accepted') || item.status.includes('Moved') || item.status.includes('Inspected')) badgeColor = 'var(--green)';
                        if (item.status.includes('Rejected')) badgeColor = 'var(--red)';

                        html += `
                            <div class="timeline-item">
                                <div class="timeline-dot" style="background:${badgeColor}; box-shadow: 0 0 0 2px ${badgeColor};"></div>
                                <div class="timeline-line"></div>
                                <div class="timeline-content">
                                    <div class="timeline-date">${new Date(item.date).toLocaleString()}</div>
                                    <div class="timeline-stage">${item.stage} <span style="font-size:0.75rem; padding:2px 6px; border-radius:12px; background:rgba(0,0,0,0.05); color:${badgeColor}; border:1px solid ${badgeColor};">${item.status}</span></div>
                                    <p class="timeline-desc">${item.desc}</p>
                                    ${item.remarks ? `<p style="margin:4px 0 0 0; font-size:0.8rem; color:var(--amber);"><strong>Remarks:</strong> ${item.remarks}</p>` : ''}
                                </div>
                            </div>
                        `;
                    });
                    timeline.innerHTML = html;
                })
                .catch(err => {
                    console.error('Error fetching history:', err);
                    document.getElementById('historyLoading').innerHTML = 'Error loading history.';
                });
        };

        window.closeHistoryModal = function() {
            document.getElementById('historyModal').classList.remove('show');
        };
    