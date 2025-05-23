document.addEventListener('DOMContentLoaded', () => {
    const sidebar = document.getElementById('course-sidebar');
    const sidebarLinksContainer = document.getElementById('sidebar-links');
    const mainContent = document.querySelector('main'); 

    if (!sidebar || !sidebarLinksContainer || !mainContent) {
        console.error('Sidebar, links container, or main content not found. Sidebar navigation will not be initialized.');
        return;
    }

    // Adjusted selector to be more general: find any section with an ID in the main content.
    // For crypto-chart-analysis, these are section[id^="module"] or section#final-summary
    // For blockchain-basics and smart-contracts, these are section[id="..."]
    const contentSections = Array.from(mainContent.querySelectorAll('section[id]'));
    const allScrollTargets = [];

    contentSections.forEach(section => {
        const sectionId = section.id;
        // Try to find h2 or h3 as title element within the section.
        // Prioritize h2 if both exist, common for main section titles.
        const sectionTitleElement = section.querySelector('h2.page-title, h2.section-title, h3.section-title'); 
        
        if (!sectionTitleElement) {
            console.warn(`Section with ID '${sectionId}' does not have a suitable title element (h2 or h3 with specific classes). Skipping.`);
            return;
        }

        allScrollTargets.push(section);

        const sectionLi = document.createElement('li');
        const sectionLink = document.createElement('a');
        sectionLink.href = `#${sectionId}`;
        // Generic text content cleanup, removing common prefixes.
        sectionLink.textContent = sectionTitleElement.textContent
            .replace(/Module \d: /i, '')
            .replace(/Module \d P\d: /i, '')
            .replace(/Part \d: /i, '')
            .replace(/Section \d: /i, '')
            .trim();
        sectionLink.classList.add('module-link'); // Use 'module-link' for styling consistency of top-level links
        sectionLi.appendChild(sectionLink);
        
        // Check for nested articles (specific to crypto-chart-analysis.html structure)
        const articleParts = Array.from(section.querySelectorAll('article[id]'));
        if (articleParts.length > 0) {
            const partsUl = document.createElement('ul');
            partsUl.classList.add('part-links');
            articleParts.forEach(article => {
                const articleId = article.id;
                const articleTitleElement = article.querySelector('h3.section-title'); 
                if (!articleTitleElement) {
                    console.warn(`Article with ID '${articleId}' in section '${sectionId}' does not have a suitable h3.section-title. Skipping.`);
                    return;
                }

                allScrollTargets.push(article);

                const partLi = document.createElement('li');
                const partLink = document.createElement('a');
                partLink.href = `#${articleId}`;
                partLink.textContent = articleTitleElement.textContent
                    .replace(/Module \d P\d: /i, '')
                    .replace(/Part \d: /i, '')
                    .trim();
                partLink.classList.add('part-link');
                partLi.appendChild(partLink);
                partsUl.appendChild(partLi);
            });
            sectionLi.appendChild(partsUl);
        }
        sidebarLinksContainer.appendChild(sectionLi);
    });

    if (allScrollTargets.length === 0) {
        console.warn("No scroll targets (sections or articles with IDs and titles) found for sidebar navigation.");
        // Optionally hide the sidebar or display a message
        // sidebar.style.display = 'none'; 
        return;
    }

    // Smooth Scrolling
    sidebarLinksContainer.addEventListener('click', (event) => {
        if (event.target.tagName === 'A' && event.target.getAttribute('href').startsWith('#')) {
            event.preventDefault();
            const targetId = event.target.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                targetElement.scrollIntoView({ behavior: 'smooth' });
            }
        }
    });

    // Active Link Highlighting
    const observerOptions = {
        rootMargin: '-80px 0px -50% 0px', // Adjust based on navbar height and desired trigger point
        threshold: 0 
    };

    const observerCallback = (entries) => {
        let lastIntersectingLink = null;

        entries.forEach(entry => {
            const correspondingLink = sidebarLinksContainer.querySelector(`a[href="#${entry.target.id}"]`);
            if (!correspondingLink) return;

            if (entry.isIntersecting) {
                lastIntersectingLink = correspondingLink;
            } else {
                correspondingLink.classList.remove('active');
            }
        });
        
        // Deactivate all first
        sidebarLinksContainer.querySelectorAll('a.active').forEach(link => link.classList.remove('active'));

        // Activate the last intersecting link found (handles scrolling upwards correctly)
        if (lastIntersectingLink) {
            lastIntersectingLink.classList.add('active');
            lastIntersectingLink.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'start' });
        } else {
            // Fallback: if no link is intersecting (e.g. at the very top or bottom of the page, outside rootMargin)
            // try to find the first visible link or the link closest to the current scroll position.
            // For simplicity, this example just ensures something is active if possible.
            // A more robust solution might be needed for edge cases.
            // Current behavior: if nothing is "intersecting" by the definition, nothing is active.
            // This can be fine, or one might want to always have one link active.
            // For now, we will stick to the intersection logic.
        }
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);
    allScrollTargets.forEach(target => observer.observe(target));
});
