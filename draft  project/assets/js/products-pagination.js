/* Products Listing Pages Pagination & In-Page Search Script
 * 1. Live/Instant filtering and on submit/enter for sidebar search box (.product-page__sidebar-search-box)
 * 2. URL query parameter (?search=...) support for header search integration
 * 3. Exact matching for Coffee (Arabica, Robusta, Roasted), Spices, Fruits, Pulses, Vegetables, etc.
 * 4. Case-insensitive filtering of existing product cards on the page.
 * 5. Dynamic "No products found." message when 0 matches exist.
 * 6. Responsive 10 items per page pagination synced with filtered results.
 */
document.addEventListener('DOMContentLoaded', function () {
    var ITEMS_PER_PAGE = 10;
    
    var productGrid = document.querySelector('.product-page__right .row');
    if (!productGrid) return;
    
    var productCards = Array.prototype.slice.call(productGrid.children).filter(function (child) {
        return child.querySelector('.single-shop-style1') !== null;
    });
    
    if (productCards.length === 0) return;
    
    var paginationContainer = document.querySelector('.styled-pagination');
    
    // Create or select "No products found." element
    var noProductsMsg = document.getElementById('no-products-message');
    if (!noProductsMsg) {
        noProductsMsg = document.createElement('div');
        noProductsMsg.id = 'no-products-message';
        noProductsMsg.className = 'col-12 text-center';
        noProductsMsg.style.display = 'none';
        noProductsMsg.style.padding = '40px 20px';
        noProductsMsg.innerHTML = '<div style="background: #f8fafc; border: 1px dashed #cbd5e1; border-radius: 8px; padding: 40px 20px;"><i class="icon-search" style="font-size: 32px; color: #94a3b8; display: block; margin-bottom: 12px;"></i><h4 style="color: #1e293b; font-weight: 600; margin-bottom: 8px;">No products found</h4><p style="color: #64748b; margin-bottom: 0;">Try adjusting your search terms or browse our categories.</p></div>';
        productGrid.appendChild(noProductsMsg);
    }
    
    // Index product cards text for fast search
    var indexedCards = productCards.map(function (card) {
        var categoryEl = card.querySelector('.single-shop-style1__content-text p');
        var titleEl = card.querySelector('.single-shop-style1__content-text h4 a') || card.querySelector('.single-shop-style1__content-text h4');
        var imgEl = card.querySelector('.single-shop-style1__img img');
        
        var category = categoryEl ? categoryEl.textContent.trim() : '';
        var title = titleEl ? titleEl.textContent.trim() : '';
        var alt = imgEl ? (imgEl.getAttribute('alt') || '') : '';
        
        var searchText = (category + ' ' + title + ' ' + alt).toLowerCase();
        
        return {
            element: card,
            category: category,
            title: title,
            searchText: searchText
        };
    });
    
    var currentFilteredCards = indexedCards.map(function (item) { return item.element; });
    var currentPage = 1;
    
    function renderPagination(cardsList, page) {
        var total = cardsList.length;
        var totalPages = Math.ceil(total / ITEMS_PER_PAGE);
        
        if (page < 1) page = 1;
        if (totalPages > 0 && page > totalPages) page = totalPages;
        currentPage = page;
        
        if (total === 0) {
            indexedCards.forEach(function (item) {
                item.element.classList.add('page-hidden');
                item.element.style.display = 'none';
            });
            noProductsMsg.style.display = '';
            if (paginationContainer) paginationContainer.style.display = 'none';
            return;
        }
        
        noProductsMsg.style.display = 'none';
        
        // Hide all cards not in currentFilteredCards
        indexedCards.forEach(function (item) {
            if (cardsList.indexOf(item.element) === -1) {
                item.element.classList.add('page-hidden');
                item.element.style.display = 'none';
            }
        });
        
        if (totalPages <= 1) {
            cardsList.forEach(function (card) {
                card.classList.remove('page-hidden');
                card.style.display = '';
            });
            if (paginationContainer) paginationContainer.style.display = 'none';
            return;
        }
        
        var startIndex = (page - 1) * ITEMS_PER_PAGE;
        var endIndex = startIndex + ITEMS_PER_PAGE;
        
        cardsList.forEach(function (card, idx) {
            if (idx >= startIndex && idx < endIndex) {
                card.classList.remove('page-hidden');
                card.style.display = '';
            } else {
                card.classList.add('page-hidden');
                card.style.display = 'none';
            }
        });
        
        if (paginationContainer) {
            paginationContainer.style.display = '';
            paginationContainer.innerHTML = '';
            
            // Previous Arrow
            var prevLi = document.createElement('li');
            prevLi.className = 'arrow prev' + (page === 1 ? ' disabled' : '');
            var prevA = document.createElement('a');
            prevA.href = '#';
            prevA.innerHTML = '<span class="icon-arrow right left"></span>';
            prevA.addEventListener('click', function (e) {
                e.preventDefault();
                if (page > 1) {
                    renderPagination(cardsList, page - 1);
                    scrollToGridTop();
                }
            });
            prevLi.appendChild(prevA);
            paginationContainer.appendChild(prevLi);
            
            // Page Numbers
            var startPage = 1;
            var endPage = totalPages;
            
            if (totalPages > 7) {
                if (page <= 4) {
                    startPage = 1;
                    endPage = 7;
                } else if (page + 3 >= totalPages) {
                    startPage = totalPages - 6;
                    endPage = totalPages;
                } else {
                    startPage = page - 3;
                    endPage = page + 3;
                }
            }
            
            for (var i = startPage; i <= endPage; i++) {
                (function (targetPage) {
                    var pageLi = document.createElement('li');
                    if (targetPage === page) {
                        pageLi.className = 'active';
                    }
                    var pageA = document.createElement('a');
                    pageA.href = '#';
                    pageA.textContent = targetPage < 10 ? '0' + targetPage : targetPage.toString();
                    pageA.addEventListener('click', function (e) {
                        e.preventDefault();
                        if (targetPage !== page) {
                            renderPagination(cardsList, targetPage);
                            scrollToGridTop();
                        }
                    });
                    pageLi.appendChild(pageA);
                    paginationContainer.appendChild(pageLi);
                })(i);
            }
            
            // Next Arrow
            var nextLi = document.createElement('li');
            nextLi.className = 'arrow next' + (page === totalPages ? ' disabled' : '');
            var nextA = document.createElement('a');
            nextA.href = '#';
            nextA.innerHTML = '<span class="icon-arrow right"></span>';
            nextA.addEventListener('click', function (e) {
                e.preventDefault();
                if (page < totalPages) {
                    renderPagination(cardsList, page + 1);
                    scrollToGridTop();
                }
            });
            nextLi.appendChild(nextA);
            paginationContainer.appendChild(nextLi);
        }
    }
    
    function scrollToGridTop() {
        var target = document.querySelector('.product-page__right') || productGrid;
        if (target) {
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }
    
    function applySearch(query) {
        var term = (query || '').trim().toLowerCase();
        
        if (!term) {
            currentFilteredCards = indexedCards.map(function (item) { return item.element; });
        } else {
            var searchTerms = term.split(/\s+/).filter(function (t) { return t.length > 0; });
            
            currentFilteredCards = indexedCards.filter(function (item) {
                // Check if all sub-terms match anywhere in searchText
                return searchTerms.every(function (t) {
                    return item.searchText.indexOf(t) !== -1;
                });
            }).map(function (item) {
                return item.element;
            });
        }
        
        renderPagination(currentFilteredCards, 1);
    }
    
    // Setup Sidebar Search Form
    var sidebarSearchForm = document.querySelector('.product-page__sidebar-search-box form.search-form') || document.querySelector('.product-page__sidebar-search-box form');
    var sidebarSearchInput = sidebarSearchForm ? (sidebarSearchForm.querySelector('input[type="text"]') || sidebarSearchForm.querySelector('input')) : null;
    var sidebarSearchBtn = sidebarSearchForm ? sidebarSearchForm.querySelector('button[type="submit"]') : null;
    
    if (sidebarSearchForm && sidebarSearchInput) {
        // Prevent default reload on submit
        sidebarSearchForm.addEventListener('submit', function (e) {
            e.preventDefault();
            applySearch(sidebarSearchInput.value);
            return false;
        });
        
        // Instant search on typing
        sidebarSearchInput.addEventListener('input', function () {
            applySearch(sidebarSearchInput.value);
        });
        
        // Search icon click
        if (sidebarSearchBtn) {
            sidebarSearchBtn.addEventListener('click', function (e) {
                e.preventDefault();
                applySearch(sidebarSearchInput.value);
            });
        }
    }
    
    // Check URL parameters for ?search=... or ?s=...
    var urlParams = new URLSearchParams(window.location.search);
    var initialQuery = urlParams.get('search') || urlParams.get('s') || urlParams.get('q');
    
    if (initialQuery) {
        if (sidebarSearchInput) {
            sidebarSearchInput.value = initialQuery;
        }
        applySearch(initialQuery);
    } else {
        renderPagination(currentFilteredCards, 1);
    }
});
