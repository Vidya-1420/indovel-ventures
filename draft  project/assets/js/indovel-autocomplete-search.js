/**
 * IndoVel Ventures - Google-Style Autocomplete Search Engine
 * Features: Live typing matching, keyboard navigation (Up/Down/Enter/Escape), outside click handling.
 */
(function () {
    function initAutocompleteSearch() {
        var searchInput = document.getElementById('search');
        var searchForm = document.querySelector('.search-popup__content form');
        var searchPopup = document.querySelector('.search-popup');

        if (!searchInput || !searchForm) return;

        searchForm.setAttribute('action', 'javascript:void(0);');
        searchForm.setAttribute('onsubmit', 'return false;');

        var searchBtn = searchForm.querySelector('button[type="submit"]');

        var resultsContainer = document.getElementById('search-popup-results');
        if (!resultsContainer) {
            resultsContainer = document.createElement('div');
            resultsContainer.id = 'search-popup-results';
            resultsContainer.className = 'search-popup__results';
            // Insert AFTER the form, as a sibling inside .search-popup__content
            searchForm.insertAdjacentElement('afterend', resultsContainer);
        }

        var activeIndex = -1;

        function resetSearch() {
            if (searchInput) searchInput.value = '';
            if (resultsContainer) {
                resultsContainer.innerHTML = '';
                resultsContainer.className = 'search-popup__results';
            }
            activeIndex = -1;
        }

        function escapeHTML(str) {
            if (!str) return '';
            return String(str).replace(/[&<>'"]/g, function (tag) {
                return {
                    '&': '&amp;',
                    '<': '&lt;',
                    '>': '&gt;',
                    "'": '&#39;',
                    '"': '&quot;'
                }[tag] || tag;
            });
        }

        function escapeRegex(str) {
            return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        }

        function highlightKeyword(text, keyword) {
            if (!keyword || !text) return escapeHTML(text);
            var escapedText = escapeHTML(text);
            try {
                var regex = new RegExp('(' + escapeRegex(keyword) + ')', 'gi');
                return escapedText.replace(regex, '<mark class="search-highlight">$1</mark>');
            } catch (e) {
                return escapedText;
            }
        }

        function updateActiveItem(items) {
            for (var i = 0; i < items.length; i++) {
                if (i === activeIndex) {
                    items[i].classList.add('selected');
                    items[i].scrollIntoView({ block: 'nearest' });
                } else {
                    items[i].classList.remove('selected');
                }
            }
        }

        function performAutocomplete() {
            var rawQuery = searchInput.value ? searchInput.value.replace(/^\s+|\s+$/g, '') : '';
            var query = rawQuery.toLowerCase();
            activeIndex = -1;

            if (!query || query.length < 1) {
                resultsContainer.innerHTML = '';
                resultsContainer.className = 'search-popup__results';
                return;
            }

            var dataset = window.INDOVEL_SEARCH_DATA || [];
            var matches = [];

            for (var i = 0; i < dataset.length; i++) {
                var item = dataset[i];
                var kws = item.keywords || '';
                var title = item.title || '';
                var category = item.category || '';
                var desc = item.description || '';

                if (kws.indexOf(query) !== -1 || 
                    title.toLowerCase().indexOf(query) !== -1 || 
                    category.toLowerCase().indexOf(query) !== -1 ||
                    desc.toLowerCase().indexOf(query) !== -1) {
                    matches.push(item);
                }
            }

            // Rank items starting with the query first
            matches.sort(function (a, b) {
                var aMatch = a.title.toLowerCase().indexOf(query) === 0;
                var bMatch = b.title.toLowerCase().indexOf(query) === 0;
                if (aMatch && !bMatch) return -1;
                if (!aMatch && bMatch) return 1;
                return 0;
            });

            if (matches.length === 0) {
                resultsContainer.innerHTML = 
                    '<div class="no-results-box">' +
                        '<div class="no-results-title">No results found</div>' +
                        '<div class="no-results-sub">Try searching for <em>rice</em>, <em>spices</em>, <em>pulses</em>, or <em>contact</em>.</div>' +
                    '</div>';
                resultsContainer.className = 'search-popup__results active';
                return;
            }

            var limit = matches.length < 8 ? matches.length : 8;
            var html = '';

            for (var j = 0; j < limit; j++) {
                var matchItem = matches[j];
                var highlightedTitle = highlightKeyword(matchItem.title, rawQuery);
                var highlightedDesc = highlightKeyword(matchItem.description, rawQuery);

                html += 
                    '<a href="' + matchItem.url + '" class="autocomplete-item">' +
                        '<div class="autocomplete-icon">🔍</div>' +
                        '<div class="autocomplete-content">' +
                            '<div class="autocomplete-title-row">' +
                                '<span class="autocomplete-title">' + highlightedTitle + '</span>' +
                                '<span class="autocomplete-badge">' + escapeHTML(matchItem.category) + '</span>' +
                            '</div>' +
                            '<div class="autocomplete-desc">' + highlightedDesc + '</div>' +
                        '</div>' +
                    '</a>';
            }

            if (matches.length > limit) {
                html += 
                    '<a href="products.html?search=' + encodeURIComponent(rawQuery) + '" class="autocomplete-view-all">' +
                        'View All (' + matches.length + ') Matching Results &rarr;' +
                    '</a>';
            }

            resultsContainer.innerHTML = html;
            resultsContainer.className = 'search-popup__results active';
        }

        // Live typing input handler
        searchInput.addEventListener('input', performAutocomplete);

        // Keyboard navigation (ArrowUp, ArrowDown, Enter, Escape)
        searchInput.addEventListener('keydown', function (e) {
            var items = resultsContainer.querySelectorAll('.autocomplete-item');
            
            if (e.key === 'ArrowDown' || e.keyCode === 40) {
                if (items.length > 0) {
                    e.preventDefault();
                    activeIndex++;
                    if (activeIndex >= items.length) activeIndex = 0;
                    updateActiveItem(items);
                }
            } else if (e.key === 'ArrowUp' || e.keyCode === 38) {
                if (items.length > 0) {
                    e.preventDefault();
                    activeIndex--;
                    if (activeIndex < 0) activeIndex = items.length - 1;
                    updateActiveItem(items);
                }
            } else if (e.key === 'Enter' || e.keyCode === 13) {
                if (activeIndex >= 0 && items[activeIndex]) {
                    e.preventDefault();
                    items[activeIndex].click();
                } else if (searchInput.value.trim() !== '') {
                    e.preventDefault();
                    window.location.href = 'products.html?search=' + encodeURIComponent(searchInput.value.trim());
                }
            } else if (e.key === 'Escape' || e.keyCode === 27) {
                e.preventDefault();
                resetSearch();
                if (searchPopup) searchPopup.classList.remove('active');
            }
        });

        // Search submit button handler
        if (searchBtn) {
            searchBtn.addEventListener('click', function (e) {
                if (e) {
                    if (e.preventDefault) e.preventDefault();
                    if (e.stopPropagation) e.stopPropagation();
                }
                var val = searchInput.value ? searchInput.value.trim() : '';
                if (val !== '') {
                    window.location.href = 'products.html?search=' + encodeURIComponent(val);
                }
                return false;
            });
        }

        // Close button handler
        var closeBtn = document.querySelector('.search-popup__close-btn');
        if (closeBtn) {
            closeBtn.addEventListener('click', function (e) {
                if (e) {
                    if (e.preventDefault) e.preventDefault();
                    if (e.stopPropagation) e.stopPropagation();
                }
                resetSearch();
                if (searchPopup) searchPopup.classList.remove('active');
                return false;
            });
        }

        // Click outside closes dropdown
        document.addEventListener('click', function (e) {
            if (searchPopup && searchPopup.classList.contains('active')) {
                var searchContent = document.querySelector('.search-popup__content');
                if (searchContent && !searchContent.contains(e.target) && !e.target.closest('.search-toggler')) {
                    resetSearch();
                    searchPopup.classList.remove('active');
                }
            }
        });

        // Focus input when search toggler opens overlay
        document.querySelectorAll('.search-toggler').forEach(function (toggler) {
            toggler.addEventListener('click', function () {
                setTimeout(function () {
                    if (searchPopup && searchPopup.classList.contains('active')) {
                        searchInput.focus();
                    } else {
                        resetSearch();
                    }
                }, 150);
            });
        });
    }

    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        initAutocompleteSearch();
    } else {
        document.addEventListener('DOMContentLoaded', initAutocompleteSearch);
    }
})();
