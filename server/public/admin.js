(() => {
    'use strict';

    const API = '';
    let allWallpapers = [];
    let currentFilter = 'all';
    let deleteTargetId = null;

    // ─── DOM refs ──────────────────────────────────────────────
    const $ = (sel) => document.querySelector(sel);
    const uploadZone = $('#uploadZone');
    const fileInput = $('#fileInput');
    const uploadCoins = $('#uploadCoins');
    const uploadProgress = $('#uploadProgress');
    const progressFill = $('#progressFill');
    const progressText = $('#progressText');
    const wallpaperGrid = $('#wallpaperGrid');
    const emptyState = $('#emptyState');
    const totalCount = $('#totalCount');
    const activeCount = $('#activeCount');
    const deleteModal = $('#deleteModal');
    const confirmDeleteBtn = $('#confirmDelete');
    const cancelDeleteBtn = $('#cancelDelete');
    const filterTabs = document.querySelectorAll('.filter-tab');

    // ─── Init ──────────────────────────────────────────────────
    loadWallpapers();

    // ─── Upload Zone Events ────────────────────────────────────
    uploadZone.addEventListener('click', () => fileInput.click());

    uploadZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadZone.classList.add('drag-over');
    });

    uploadZone.addEventListener('dragleave', () => {
        uploadZone.classList.remove('drag-over');
    });

    uploadZone.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadZone.classList.remove('drag-over');
        const files = Array.from(e.dataTransfer.files).filter((f) => f.type.startsWith('image/'));
        if (files.length) uploadFiles(files);
    });

    fileInput.addEventListener('change', () => {
        const files = Array.from(fileInput.files);
        if (files.length) uploadFiles(files);
        fileInput.value = '';
    });

    // ─── Filter Tabs ───────────────────────────────────────────
    filterTabs.forEach((tab) => {
        tab.addEventListener('click', () => {
            filterTabs.forEach((t) => t.classList.remove('active'));
            tab.classList.add('active');
            currentFilter = tab.dataset.filter;
            renderGrid();
        });
    });

    // ─── Delete Modal ──────────────────────────────────────────
    cancelDeleteBtn.addEventListener('click', closeDeleteModal);
    deleteModal.addEventListener('click', (e) => {
        if (e.target === deleteModal) closeDeleteModal();
    });
    confirmDeleteBtn.addEventListener('click', async () => {
        if (!deleteTargetId) return;
        try {
            await fetch(`${API}/api/wallpapers/${deleteTargetId}`, { method: 'DELETE' });
            toast('Wallpaper deleted', 'success');
            closeDeleteModal();
            loadWallpapers();
        } catch (err) {
            toast('Failed to delete', 'error');
        }
    });

    // ─── Upload Files ──────────────────────────────────────────
    async function uploadFiles(files) {
        const coins = parseInt(uploadCoins.value) || 10;
        uploadProgress.hidden = false;
        let uploaded = 0;

        for (const file of files) {
            progressText.textContent = `Uploading ${uploaded + 1}/${files.length}…`;
            progressFill.style.width = `${(uploaded / files.length) * 100}%`;

            const form = new FormData();
            form.append('image', file);
            form.append('coins', coins);

            try {
                await fetch(`${API}/api/wallpapers`, { method: 'POST', body: form });
                uploaded++;
            } catch (err) {
                toast(`Failed to upload ${file.name}`, 'error');
            }
        }

        progressFill.style.width = '100%';
        progressText.textContent = `${uploaded} uploaded`;
        toast(`${uploaded} wallpaper${uploaded > 1 ? 's' : ''} uploaded`, 'success');

        setTimeout(() => {
            uploadProgress.hidden = true;
            progressFill.style.width = '0%';
        }, 1500);

        loadWallpapers();
    }

    // ─── Load Wallpapers ───────────────────────────────────────
    async function loadWallpapers() {
        try {
            const res = await fetch(`${API}/api/wallpapers/all`);
            const data = await res.json();
            allWallpapers = data.wallpapers || [];
            updateStats();
            renderGrid();
        } catch (err) {
            toast('Failed to load wallpapers', 'error');
        }
    }

    // ─── Update Stats ──────────────────────────────────────────
    function updateStats() {
        totalCount.textContent = allWallpapers.length;
        activeCount.textContent = allWallpapers.filter((w) => w.is_active).length;
    }

    // ─── Render Grid ───────────────────────────────────────────
    function renderGrid() {
        let filtered = allWallpapers;
        if (currentFilter === 'active') filtered = filtered.filter((w) => w.is_active);
        if (currentFilter === 'inactive') filtered = filtered.filter((w) => !w.is_active);

        if (filtered.length === 0) {
            wallpaperGrid.innerHTML = '';
            emptyState.hidden = false;
            return;
        }

        emptyState.hidden = true;
        wallpaperGrid.innerHTML = filtered
            .map(
                (w, i) => `
      <div class="wallpaper-card ${w.is_active ? '' : 'inactive'}" style="animation-delay: ${i * 0.04}s" data-id="${w.id}">
        <div class="card-image-wrap">
          <img class="card-image" src="${w.image_url}" alt="${esc(w.original_name)}" loading="lazy" />
          <div class="card-badge">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><text x="12" y="16" text-anchor="middle" font-size="11" fill="currentColor" font-weight="700">$</text></svg>
            <span class="coin-value" data-id="${w.id}">${w.coins}</span>
          </div>
          <div class="card-status ${w.is_active ? '' : 'inactive'}"></div>
        </div>
        <div class="card-body">
          <span class="card-name" title="${esc(w.original_name)}">${esc(w.original_name || 'Untitled')}</span>
          <div class="card-actions">
            <button class="card-btn toggle-btn" data-id="${w.id}" data-active="${w.is_active}" title="${w.is_active ? 'Deactivate' : 'Activate'}">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
                ${w.is_active ? '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12z"/><circle cx="12" cy="12" r="3"/>' : '<path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/>'}
              </svg>
            </button>
            <button class="card-btn delete" data-id="${w.id}" title="Delete">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
            </button>
          </div>
        </div>
      </div>
    `
            )
            .join('');

        // Bind events
        wallpaperGrid.querySelectorAll('.toggle-btn').forEach((btn) => {
            btn.addEventListener('click', () => toggleActive(btn.dataset.id, btn.dataset.active === 'true'));
        });

        wallpaperGrid.querySelectorAll('.card-btn.delete').forEach((btn) => {
            btn.addEventListener('click', () => openDeleteModal(btn.dataset.id));
        });

        wallpaperGrid.querySelectorAll('.coin-value').forEach((el) => {
            el.addEventListener('click', (e) => {
                e.stopPropagation();
                startCoinEdit(el);
            });
        });
    }

    // ─── Toggle Active ─────────────────────────────────────────
    async function toggleActive(id, currentlyActive) {
        try {
            await fetch(`${API}/api/wallpapers/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ is_active: !currentlyActive }),
            });
            toast(currentlyActive ? 'Wallpaper deactivated' : 'Wallpaper activated', 'success');
            loadWallpapers();
        } catch (err) {
            toast('Failed to update', 'error');
        }
    }

    // ─── Inline Coin Edit ──────────────────────────────────────
    function startCoinEdit(el) {
        const id = el.dataset.id;
        const currentCoins = el.textContent;
        const input = document.createElement('input');
        input.type = 'number';
        input.className = 'coin-edit-input';
        input.value = currentCoins;
        input.min = 1;
        input.max = 9999;

        el.replaceWith(input);
        input.focus();
        input.select();

        const commit = async () => {
            const newCoins = parseInt(input.value) || parseInt(currentCoins);
            if (newCoins !== parseInt(currentCoins)) {
                try {
                    await fetch(`${API}/api/wallpapers/${id}`, {
                        method: 'PATCH',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ coins: newCoins }),
                    });
                    toast(`Coins updated to ${newCoins}`, 'success');
                } catch (err) {
                    toast('Failed to update coins', 'error');
                }
            }
            loadWallpapers();
        };

        input.addEventListener('blur', commit);
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') input.blur();
            if (e.key === 'Escape') {
                input.removeEventListener('blur', commit);
                loadWallpapers();
            }
        });
    }

    // ─── Delete Modal ──────────────────────────────────────────
    function openDeleteModal(id) {
        deleteTargetId = id;
        deleteModal.hidden = false;
    }

    function closeDeleteModal() {
        deleteTargetId = null;
        deleteModal.hidden = true;
    }

    // ─── Toast ─────────────────────────────────────────────────
    function toast(msg, type = '') {
        const container = $('#toastContainer');
        const el = document.createElement('div');
        el.className = `toast ${type}`;
        el.innerHTML = `${type === 'success' ? '✓' : type === 'error' ? '✕' : 'ℹ'} ${esc(msg)}`;
        container.appendChild(el);
        setTimeout(() => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(8px)';
            el.style.transition = '0.3s ease';
            setTimeout(() => el.remove(), 300);
        }, 3000);
    }

    // ─── Util ──────────────────────────────────────────────────
    function esc(str) {
        const d = document.createElement('div');
        d.textContent = str || '';
        return d.innerHTML;
    }
})();
