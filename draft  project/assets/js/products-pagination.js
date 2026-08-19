/* Products Listing Pages Pagination Script
 * Enforces max 10 products per page using class-based visibility toggling.
 * Hides pagination when <= 10 products.
 * Generates exact 01, 02, 03 page buttons and prev/next arrows matching site design.
 */
document.addEventListener('DOMContentLoaded', function () {
    var ITEMS_PER_PAGE = 10;
    
    var productGrid = document.querySelector('.product-page__right .row');
    if (!productGrid) return;
    
    var productCards = Array.prototype.slice.call(productGrid.children).filter(function (child) {
        return child.querySelector('.single-shop-style1') !== null;
    });
    
    var totalProducts = productCards.length;
    if (totalProducts === 0) return;
    
    var totalPages = Math.ceil(totalProducts / ITEMS_PER_PAGE);
    var paginationContainer = document.querySelector('.styled-pagination');
    
    if (totalPages <= 1) {
        productCards.forEach(function (card) {
            card.classList.remove('page-hidden');
            card.style.display = '';
        });
        if (paginationContainer) {
            paginationContainer.style.display = 'none';
        }
        return;
    }
    
    function goToPage(page) {
        if (page < 1) page = 1;
        if (page > totalPages) page = totalPages;
        
        var startIndex = (page - 1) * ITEMS_PER_PAGE;
        var endIndex = startIndex + ITEMS_PER_PAGE;
        
        productCards.forEach(function (card, index) {
            if (index >= startIndex && index < endIndex) {
                card.classList.remove('page-hidden');
            } else {
                card.classList.add('page-hidden');
            }
        });
        
        if (paginationContainer) {
            paginationContainer.style.display = '';
            paginationContainer.innerHTML = '';
            
            // Previous Arrow Button
            var prevLi = document.createElement('li');
            prevLi.className = 'arrow prev' + (page === 1 ? ' disabled' : '');
            var prevA = document.createElement('a');
            prevA.href = '#';
            prevA.innerHTML = '<span class="icon-arrow right left"></span>';
            prevA.addEventListener('click', function (e) {
                e.preventDefault();
                if (page > 1) {
                    goToPage(page - 1);
                    scrollToGridTop();
                }
            });
            prevLi.appendChild(prevA);
            paginationContainer.appendChild(prevLi);
            
            // Page Numbers (01, 02, 03...)
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
                            goToPage(targetPage);
                            scrollToGridTop();
                        }
                    });
                    pageLi.appendChild(pageA);
                    paginationContainer.appendChild(pageLi);
                })(i);
            }
            
            // Next Arrow Button
            var nextLi = document.createElement('li');
            nextLi.className = 'arrow next' + (page === totalPages ? ' disabled' : '');
            var nextA = document.createElement('a');
            nextA.href = '#';
            nextA.innerHTML = '<span class="icon-arrow right"></span>';
            nextA.addEventListener('click', function (e) {
                e.preventDefault();
                if (page < totalPages) {
                    goToPage(page + 1);
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
    
    goToPage(1);
});
