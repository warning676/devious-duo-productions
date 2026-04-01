class Renderer {
    constructor(state) {
        this.s = state;
    }

    fixImagePath(path) {
        if (!path) return path;
        if (path.startsWith('http') || path.startsWith('data:')) {
            if (path.includes('drive.google.com')) {
                if (!path.includes('thumbnail?')) {
                    const fileIdMatch = path.match(/\/d\/([a-zA-Z0-9_-]+)/) || path.match(/[?&]id=([a-zA-Z0-9_-]+)/);
                    if (fileIdMatch) {
                        return `https://drive.google.com/thumbnail?id=${fileIdMatch[1]}&sz=w1200`;
                    }
                }
            }
            return path;
        }
        if (path.startsWith('../')) return encodeURI(path);
        return '../' + encodeURI(path);
    }

    showSkeletons(container, count) {
        if (!container) return;
        const isPortfolioGrid = container.id === 'portfolio-grid' || container.id === 'recent-work-grid' || container.id === 'festival-awards-container';
        const isSkillsGrid = container.id === 'skills-list';
        container.style.visibility = 'visible';
        container.style.display = isPortfolioGrid ? 'grid' : 'block';
        if (isSkillsGrid) {
            container.innerHTML = '';
            const table = document.createElement('table');
            table.className = 'skills-table';
            const thead = document.createElement('thead');
            thead.innerHTML = '<tr><th>Name</th><th>Category</th></tr>';
            table.appendChild(thead);
            const tbody = document.createElement('tbody');
            tbody.className = 'skills-table-body';
            for (let i = 0; i < count; i++) {
                const tr = document.createElement('tr');
                tr.className = 'skeleton-row';
                for (let j = 0; j < 2; j++) {
                    const td = document.createElement('td');
                    const div = document.createElement('div');
                    div.className = 'skeleton-element';
                    div.style.height = '14px';
                    div.style.borderRadius = '999px';
                    div.style.width = j === 0 ? '120px' : '90px';
                    td.appendChild(div);
                    tr.appendChild(td);
                }
                tbody.appendChild(tr);
            }
            table.appendChild(tbody);
            const shell = document.createElement('div');
            shell.className = 'skills-table-shell';
            shell.appendChild(table);
            container.appendChild(shell);
            return;
        }
        if (isPortfolioGrid) {
            container.innerHTML = '';
            for (let i = 0; i < count; i++) {
                const card = document.createElement('div');
                card.className = 'portfolio-card skeleton-item';
                const thumb = document.createElement('div');
                thumb.className = 'card-thumb';
                const thumbSkel = document.createElement('div');
                thumbSkel.className = 'skeleton-element';
                thumbSkel.style.width = '100%';
                thumbSkel.style.height = '100%';
                thumb.appendChild(thumbSkel);
                card.appendChild(thumb);
                const content = document.createElement('div');
                content.className = 'card-content';
                const info = document.createElement('div');
                info.className = 'card-info';
                for (let j = 0; j < 3; j++) {
                    const infoSkel = document.createElement('div');
                    infoSkel.className = 'skeleton-element';
                    infoSkel.style.borderRadius = '999px';
                    infoSkel.style.marginBottom = j === 2 ? '0' : (j === 1 ? '10px' : '8px');
                    infoSkel.style.height = j === 1 ? '18px' : (j === 2 ? '14px' : '11px');
                    infoSkel.style.width = j === 0 ? '38%' : (j === 1 ? '78%' : '42%');
                    info.appendChild(infoSkel);
                }
                content.appendChild(info);
                const awards = document.createElement('div');
                awards.className = 'card-awards';
                const awardsSkel = document.createElement('div');
                awardsSkel.className = 'skeleton-element';
                awardsSkel.style.width = '108px';
                awardsSkel.style.height = '14px';
                awardsSkel.style.borderRadius = '999px';
                awardsSkel.style.marginTop = '2px';
                awards.appendChild(awardsSkel);
                content.appendChild(awards);
                card.appendChild(content);
                container.appendChild(card);
            }
        } else {
            container.innerHTML = '';
        }
    }

    renderProjects(projects, targetContainer = null, isSecondary = false) {
        const s = this.s;
        const container = targetContainer || s.portfolioGrid;
        if (!container || !projects) return;
        
        const skeletons = Array.from(container.querySelectorAll('.skeleton-item'));
        const hasInitialSkeletons = skeletons.length > 0;

        const projectPromises = projects.map((project, index) => {
            return new Promise((resolve) => {
                try {
                    const card = document.createElement('div');
                    card.className = 'portfolio-card';
                    card.style.display = 'none';
                    card.setAttribute('data-name', project.name || '');
                    card.setAttribute('data-date', project.date || '');
                    card.setAttribute('data-info', project.info || '');
                    card.setAttribute('data-tools', project.tools || '');
                    card.setAttribute('data-youtube', project.youtube || '');
                    card.setAttribute('data-type', project.badge || '');
                    card.setAttribute('data-badge', project.badge || '');
                    card.setAttribute('data-gallery', project.gallery ? project.gallery.join(', ') : '');

                    const youtubeID = Utils.extractYouTubeID(project.youtube || '');
                    const hasValidYoutube = youtubeID && youtubeID.trim() !== "" && youtubeID !== "YOUTUBE_ID_HERE";
                    const galleryThumb = project.gallery?.[0] ? this.fixImagePath(project.gallery[0]) : '';
                    
                    let thumbSrc = project.resolvedThumb ? this.fixImagePath(project.resolvedThumb) : '';
                    if (!thumbSrc && hasValidYoutube) {
                        thumbSrc = `https://i.ytimg.com/vi/${youtubeID}/hqdefault.jpg`;
                    } else if (!thumbSrc) {
                        thumbSrc = galleryThumb;
                    }

                    const displayDate = project.date ? Utils.formatFullDate(project.date).toUpperCase() : '';
                    const dateHTML = displayDate ? `<p class="card-meta-date">${displayDate}</p>` : '';
                    const badgeHTML = project.badge ? `<span class="type-badge">${project.badge}</span>` : '';
                    
                    let awards = null;
                    if (Array.isArray(project.awards) && project.awards.length > 0) {
                        awards = project.awards;
                    } else if (project.youtube && s.filmFestivalAwards) {
                        awards = s.filmFestivalAwards[project.name] || null;
                    }

                    let awardsHTML = '';
                    let awardsSearchData = '';
                    if (awards && awards.length > 0) {
                        const escAttr = (v) => String(v ?? '')
                            .replace(/&/g, '&amp;')
                            .replace(/"/g, '&quot;')
                            .replace(/</g, '&lt;');
                        const awardsList = awards.map(a => `${a.award} - ${a.location}`).join('\n');
                        awardsSearchData = awards.map(a => `${a.award} ${a.location}`).join(' ');
                        awardsHTML = `<div class="card-awards-stack"><span class="card-awards-row" title="${escAttr(awardsList)}"><span class="card-awards-icon" aria-hidden="true">${Utils.lucideTrophySvg({ size: 18, className: 'lucide lucide-trophy' })}</span><span class="card-awards-label">Won awards</span></span></div>`;
                    }
                    card.setAttribute('data-awards', awardsSearchData);
                    
                    card.innerHTML = `
                        <div class="card-thumb">
                            <img src="${thumbSrc}" alt="${project.name}">
                        </div>
                        <div class="card-content">
                            <div class="card-info">
                                ${dateHTML}
                                <h3>${(project.name || '')}</h3>
                                ${badgeHTML}
                            </div>
                            ${awardsHTML ? `<div class="card-awards">${awardsHTML}</div>` : ''}
                        </div>`;
                    
                    const preloadImg = new Image();
                    preloadImg.onload = function() {
                        if (this.naturalWidth === 120 && this.naturalHeight === 90 && galleryThumb && !this.src.includes(galleryThumb)) {
                            this.src = galleryThumb;
                            const cardImg = card.querySelector('img');
                            if (cardImg) cardImg.src = galleryThumb;
                            return;
                        }
                        resolve(card);
                    };
                    preloadImg.onerror = function() {
                        if (galleryThumb && !this.src.includes(galleryThumb)) {
                            this.src = galleryThumb;
                            const cardImg = card.querySelector('img');
                            if (cardImg) cardImg.src = galleryThumb;
                        } else {
                            resolve(card);
                        }
                    };
                    preloadImg.src = thumbSrc;
                    
                    card.addEventListener('click', () => s.openModalForItem(card));
                } catch (e) {
                    console.error(e);
                    resolve(null);
                }
            });
        });

        Promise.all(projectPromises).then((cards) => {
            const validCards = cards.filter(Boolean);
            
            if (hasInitialSkeletons) {
                validCards.forEach((card, index) => {
                    if (skeletons[index] && skeletons[index].parentNode === container) {
                        skeletons[index].replaceWith(card);
                    } else if (!container.contains(card)) {
                        container.appendChild(card);
                    }
                    card.style.display = 'flex';
                });
                skeletons.slice(validCards.length).forEach(skel => skel.remove());
            } else {
                container.innerHTML = '';
                validCards.forEach(card => {
                    container.appendChild(card);
                    card.style.display = 'flex';
                });
            }

            if (!isSecondary) {
                const categories = new Map();
                const toolsMap = new Map();
                projects.forEach(project => {
                    if (project.badge) categories.set(project.badge, project.badge);
                    if (project.tools) {
                        project.tools.split(',').forEach(tool => {
                            const trimmed = tool.trim();
                            if (trimmed) toolsMap.set(trimmed, trimmed);
                        });
                    }
                });
                s.updateTypeFilter(categories);
                s.updateToolFilter(toolsMap);
                s.sortCards();
                if (s.filterCards) s.filterCards();
            }
        });
    }

    renderSkills(skills) {
        const s = this.s;
        if (!s.skillsList || !skills) return;
        const isAchievementsPage = !!s.isAchievementsPage;

        s.skillsList.innerHTML = `
            <div class="skills-table-shell">
                <table class="skills-table">
                    <thead>
                        <tr>
                            <th class="table-sort-header" data-sort-scope="skills" data-sort-key="name" tabindex="0" role="button" aria-label="Sort Name"><span class="table-header-chip"><span class="table-header-label">Name</span><span class="table-header-actions" aria-hidden="true"><span class="table-sort-button" data-sort-order="asc"><svg viewBox="0 0 24 24" width="14" height="14" focusable="false"><path d="m18 15-6-6-6 6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg></span><span class="table-sort-button" data-sort-order="desc"><svg viewBox="0 0 24 24" width="14" height="14" focusable="false"><path d="m6 9 6 6 6-6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg></span></span></span></th>
                            <th class="table-sort-header" data-sort-scope="skills" data-sort-key="type" tabindex="0" role="button" aria-label="Sort Category"><span class="table-header-chip"><span class="table-header-meta"><span class="table-header-label">Category</span><span class="column-header-filter-indicator" data-filter-scope="skills" data-filter-key="type" aria-hidden="true"></span></span><span class="table-header-actions" aria-hidden="true"><span class="table-sort-button" data-sort-order="asc"><svg viewBox="0 0 24 24" width="14" height="14" focusable="false"><path d="m18 15-6-6-6 6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg></span><span class="table-sort-button" data-sort-order="desc"><svg viewBox="0 0 24 24" width="14" height="14" focusable="false"><path d="m6 9 6 6 6-6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg></span></span></span></th>
                        </tr>
                    </thead>
                    <tbody class="skills-table-body"></tbody>
                </table>
            </div>`;

        const tableBody = s.skillsList.querySelector('.skills-table-body');
        const categories = new Map();

        skills.forEach((skill, index) => {
            if (skill.badge) categories.set(skill.badge, skill.badge);

            const item = document.createElement('tr');
            item.className = 'skill-item';
            item.setAttribute('data-type', skill.badge || '');
            item.setAttribute('data-name', skill.name || '');
            item.setAttribute('data-info', skill.info || '');
            item.setAttribute('data-badge', skill.badge || '');
            item.setAttribute('data-original-index', String(index));

            const iconSrc = skill.resolvedIcon || this.fixImagePath(skill.icon);

            item.innerHTML = `
                <td data-label="Name">
                    <div class="skill-name-cell">
                        <span class="skill-icon-wrap">
                            <span class="skill-icon-skeleton skeleton-element"></span>
                            <img src="${iconSrc}" class="skill-icon" alt="${skill.name} icon" loading="lazy" onerror="this.style.opacity='0.5';">
                        </span>
                        <span class="skill-meta">
                            <span class="skill-name"><span class="skill-name-text">${skill.name || '-'}</span></span>
                        </span>
                    </div>
                </td>
                <td data-label="Category"><span class="type-badge">${skill.badge || '-'}</span></td>`;

            const iconImg = item.querySelector('.skill-icon');
            const iconSkeleton = item.querySelector('.skill-icon-skeleton');
            if (iconImg && iconSkeleton) {
                const clearSkeleton = () => {
                    if (iconSkeleton.parentElement) iconSkeleton.remove();
                };
                iconImg.onload = clearSkeleton;
                iconImg.onerror = clearSkeleton;
                if (iconImg.complete) clearSkeleton();
            }

            const primeSkillModalIcon = () => {
                if (!s.modalManager) return;
                s.modalManager.preloadSkillIconForItem(item, 'skill');
                s.modalManager.preloadAdjacentSkillIconsFromDom(s.skillsList, '.skill-item', item);
            };
            item.addEventListener('pointerenter', primeSkillModalIcon);
            item.addEventListener('pointerdown', primeSkillModalIcon);
            item.addEventListener('touchstart', primeSkillModalIcon, { passive: true });
            item.addEventListener('click', () => s.openModalForItem(item));
            tableBody.appendChild(item);
        });

        s.updateTypeFilter(categories);
        s.sortSkills();
        if (typeof s.filterSkills === 'function') s.filterSkills();
        if (typeof s.syncSkillSortIndicators === 'function') s.syncSkillSortIndicators();

    }
}
