// ==================== STATE MANAGEMENT ====================
const appState = {
    theme: localStorage.getItem('theme') || 'light',
    openMenu: null,
    activeSlide: 0,
    sliderInterval: null,
    currentTab: 'software-tab'
};

// ==================== INITIALIZATION ====================
document.addEventListener('DOMContentLoaded', function() {
    console.log('سایت سافت 98 با موفقیت بارگذاری شد!');

    // ایجاد لودر
    createLoader();

    // راه اندازی تم
    initializeTheme();

    // راه اندازی منوها
    initializeMenus();

    // راه اندازی تب ها
    initializeTabs();

    // راه اندازی اسلایدر
    initializeSlider();

    // راه اندازی کارت ها
    initializeCards();

    // راه اندازی اسکرول
    initializeScroll();

    // مخفی کردن لودر بعد از بارگذاری
    setTimeout(hideLoader, 1000);

    // ثبت سرویس ورکر
    registerServiceWorker();
});

// ==================== LOADER ====================
function createLoader() {
    const loader = document.createElement('div');
    loader.className = 'loader';
    loader.innerHTML = '<div class="spinner"></div>';
    document.body.appendChild(loader);
}

function hideLoader() {
    const loader = document.querySelector('.loader');
    if (loader) {
        loader.classList.add('hidden');
        setTimeout(() => loader.remove(), 500);
    }
}

// ==================== THEME MANAGEMENT ====================
function initializeTheme() {
    // تنظیم تم اولیه
    if (appState.theme === 'dark') {
        document.body.classList.add('dark-mode');
    }

    // دکمه تغییر تم
    const themeBtn = document.querySelector('.theme-toggle');
    if (themeBtn) {
        themeBtn.addEventListener('click', toggleTheme);
    }

    // تغییر تم با کلید
    document.addEventListener('keydown', function(e) {
        if (e.altKey && e.key === 't') {
            toggleTheme();
        }
    });
}

function toggleTheme() {
    const isDark = document.body.classList.toggle('dark-mode');
    appState.theme = isDark ? 'dark' : 'light';
    localStorage.setItem('theme', appState.theme);

    // نمایش نوتیفیکیشن
    showNotification(isDark ? 'حالت شب فعال شد' : 'حالت روز فعال شد', 'info');
}

// ==================== MENU MANAGEMENT ====================
function initializeMenus() {
    const menuItems = document.querySelectorAll('.menu-item');

    menuItems.forEach(item => {
        const submenu = item.querySelector('.submenu');
        const link = item.querySelector('a');

        if (!submenu) return;

        // باز کردن منو با هاور
        item.addEventListener('mouseenter', function(e) {
            if (appState.openMenu && appState.openMenu !== submenu) {
                closeMenu(appState.openMenu);
            }

            openMenu(submenu);
            appState.openMenu = submenu;
        });

        // بستن منو با خروج
        item.addEventListener('mouseleave', function(e) {
            // اگر ماوس وارد ساب منو شده، منو نبسته شود
            const relatedTarget = e.relatedTarget;
            if (submenu.contains(relatedTarget) || relatedTarget === submenu) {
                return;
            }

            closeMenu(submenu);
            appState.openMenu = null;
        });

        // بستن منو با کلیک روی لینک
        link.addEventListener('click', function(e) {
            if (submenu.style.display === 'flex') {
                e.preventDefault();
                closeMenu(submenu);
                appState.openMenu = null;
            }
        });
    });

    // بستن منوها با کلیک خارج
    document.addEventListener('click', function(e) {
        if (appState.openMenu && !appState.openMenu.contains(e.target) &&
            !e.target.closest('.menu-item')) {
            closeMenu(appState.openMenu);
            appState.openMenu = null;
        }
    });

    // بستن منو با دکمه Esc
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && appState.openMenu) {
            closeMenu(appState.openMenu);
            appState.openMenu = null;
        }
    });
}

function openMenu(menu) {
    menu.style.display = 'flex';
    setTimeout(() => {
        menu.style.opacity = '1';
        menu.style.transform = 'translateY(0)';
    }, 10);
}

function closeMenu(menu) {
    menu.style.opacity = '0';
    menu.style.transform = 'translateY(10px)';
    setTimeout(() => {
        menu.style.display = 'none';
    }, 300);
}

// ==================== TAB MANAGEMENT ====================
function initializeTabs() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const tabId = this.getAttribute('data-tab');

            // غیرفعال کردن همه تب ها
            tabBtns.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));

            // فعال کردن تب انتخاب شده
            this.classList.add('active');
            document.getElementById(tabId).classList.add('active');

            // ذخیره تب فعلی
            appState.currentTab = tabId;

            // نمایش نوتیفیکیشن
            const tabName = this.querySelector('span').textContent;
            showNotification(`تب ${tabName} فعال شد`, 'success');
        });
    });

    // تغییر تب با کلیدهای کیبورد
    document.addEventListener('keydown', function(e) {
        if (e.altKey && e.key === '1') {
            document.querySelector('[data-tab="software-tab"]').click();
        }
        if (e.altKey && e.key === '2') {
            document.querySelector('[data-tab="android-tab"]').click();
        }
    });
}

// ==================== SLIDER MANAGEMENT ====================
function initializeSlider() {
    const slides = document.querySelectorAll('.ads-slider .slide');
    const prevBtn = document.querySelector('.prev-slide');
    const nextBtn = document.querySelector('.next-slide');

    if (slides.length === 0) return;

    // نمایش اولین اسلاید
    slides[0].classList.add('active');

    // تنظیم اسلاید بعدی
    if (nextBtn) {
        nextBtn.addEventListener('click', nextSlide);
    }

    // تنظیم اسلاید قبلی
    if (prevBtn) {
        prevBtn.addEventListener('click', prevSlide);
    }

    // شروع اسلایدشو خودکار
    startAutoSlide();

    // توقف اسلایدشو هنگام هاور
    const slider = document.querySelector('.ads-slider');
    if (slider) {
        slider.addEventListener('mouseenter', stopAutoSlide);
        slider.addEventListener('mouseleave', startAutoSlide);
    }

    // تغییر اسلاید با کلیدهای کیبورد
    document.addEventListener('keydown', function(e) {
        if (e.key === 'ArrowRight') prevSlide();
        if (e.key === 'ArrowLeft') nextSlide();
    });
}

function nextSlide() {
    const slides = document.querySelectorAll('.ads-slider .slide');
    const currentSlide = document.querySelector('.ads-slider .slide.active');

    currentSlide.classList.remove('active');
    appState.activeSlide = (appState.activeSlide + 1) % slides.length;
    slides[appState.activeSlide].classList.add('active');
}

function prevSlide() {
    const slides = document.querySelectorAll('.ads-slider .slide');
    const currentSlide = document.querySelector('.ads-slider .slide.active');

    currentSlide.classList.remove('active');
    appState.activeSlide = (appState.activeSlide - 1 + slides.length) % slides.length;
    slides[appState.activeSlide].classList.add('active');
}

function startAutoSlide() {
    if (appState.sliderInterval) clearInterval(appState.sliderInterval);
    appState.sliderInterval = setInterval(nextSlide, 5000);
}

function stopAutoSlide() {
    if (appState.sliderInterval) {
        clearInterval(appState.sliderInterval);
        appState.sliderInterval = null;
    }
}

// ==================== CARD MANAGEMENT ====================
function initializeCards() {
    const cards = document.querySelectorAll('.card');
    const showMoreBtn = document.querySelector('.show-more');

    // انیمیشن کارت ها با اسکرول
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate');
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1
    });

    cards.forEach(card => observer.observe(card));

    // دکمه "نمایش بیشتر"
    if (showMoreBtn) {
        showMoreBtn.addEventListener('click', function() {
            // شبیه سازی بارگذاری بیشتر
            this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> در حال بارگذاری...';
            this.disabled = true;

            setTimeout(() => {
                showNotification('مطالب بیشتر بارگذاری شد', 'success');
                this.innerHTML = '<i class="fas fa-check"></i> بارگذاری کامل شد';
                setTimeout(() => {
                    this.innerHTML = 'ادامه لیست نرم افزارهای کاربردی';
                    this.disabled = false;
                }, 2000);
            }, 1500);
        });
    }

    // کلیک روی کارت ها
    cards.forEach(card => {
        card.addEventListener('click', function(e) {
            if (!e.target.closest('a') && !e.target.closest('button')) {
                const title = this.querySelector('h3')?.textContent;
                showNotification(`نمایش جزئیات: ${title}`, 'info');

                // شبیه سازی باز شدن صفحه جزئیات
                setTimeout(() => {
                    window.location.hash = 'software-details';
                }, 300);
            }
        });
    });
}

// ==================== SCROLL MANAGEMENT ====================
function initializeScroll() {
    // دکمه بازگشت به بالا
    const scrollTopBtn = document.createElement('button');
    scrollTopBtn.className = 'scroll-top';
    scrollTopBtn.innerHTML = '<i class="fas fa-arrow-up"></i>';
    scrollTopBtn.style.cssText = `
        position: fixed;
        bottom: 30px;
        left: 30px;
        width: 50px;
        height: 50px;
        background: linear-gradient(135deg, #2196F3, #1976D2);
        color: white;
        border: none;
        border-radius: 50%;
        cursor: pointer;
        display: none;
        align-items: center;
        justify-content: center;
        font-size: 20px;
        z-index: 1000;
        box-shadow: 0 5px 15px rgba(33, 150, 243, 0.3);
        transition: all 0.3s ease;
    `;
    document.body.appendChild(scrollTopBtn);

    // نمایش/مخفی کردن دکمه با اسکرول
    window.addEventListener('scroll', function() {
        if (window.scrollY > 500) {
            scrollTopBtn.style.display = 'flex';
        } else {
            scrollTopBtn.style.display = 'none';
        }
    });

    // اسکرول به بالا
    scrollTopBtn.addEventListener('click', function() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });

    // اسکرول نرم برای لینک ها
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            if (targetId !== '#') {
                e.preventDefault();
                const targetElement = document.querySelector(targetId);
                if (targetElement) {
                    targetElement.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            }
        });
    });

    // هایلایت آیتم فعال در منو با اسکرول
    const sections = document.querySelectorAll('section[id]');
    window.addEventListener('scroll', function() {
        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            if (scrollY >= sectionTop - 200) {
                current = section.getAttribute('id');
            }
        });

        document.querySelectorAll('.main-menu a').forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${current}`) {
                link.classList.add('active');
            }
        });
    });
}

// ==================== PAGINATION ====================
function initializePagination() {
    const pageNumbers = document.querySelectorAll('#numbers span');

    pageNumbers.forEach(number => {
        number.addEventListener('click', function() {
            if (this.id === 'prev') {
                // صفحه قبلی
                showNotification('در حال بارگذاری صفحه قبلی...', 'info');
            } else if (this.id === 'nextt') {
                // صفحه بعدی
                showNotification('در حال بارگذاری صفحه بعدی...', 'info');
            } else if (!this.classList.contains('active')) {
                // صفحه انتخاب شده
                pageNumbers.forEach(n => n.classList.remove('active'));
                this.classList.add('active');

                const pageNum = this.textContent;
                showNotification(`صفحه ${pageNum} بارگذاری شد`, 'success');

                // شبیه سازی بارگذاری مطالب جدید
                setTimeout(() => {
                    const posts = document.querySelectorAll('.post');
                    posts.forEach(post => {
                        post.style.animation = 'none';
                        setTimeout(() => {
                            post.style.animation = 'fadeIn 0.5s ease-out';
                        }, 10);
                    });
                }, 500);
            }
        });
    });
}

// ==================== NOTIFICATION SYSTEM ====================
function showNotification(message, type = 'info') {
    // حذف نوتیفیکیشن قبلی
    const oldNotification = document.querySelector('.notification');
    if (oldNotification) {
        oldNotification.remove();
    }

    // ایجاد نوتیفیکیشن جدید
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;

    // آیکون بر اساس نوع
    let icon = 'info-circle';
    if (type === 'success') icon = 'check-circle';
    if (type === 'error') icon = 'exclamation-circle';
    if (type === 'warning') icon = 'exclamation-triangle';

    notification.innerHTML = `
        <i class="fas fa-${icon}"></i>
        <span>${message}</span>
        <button class="notification-close"><i class="fas fa-times"></i></button>
    `;

    // استایل نوتیفیکیشن
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        left: 20px;
        right: 20px;
        max-width: 400px;
        margin: 0 auto;
        background: ${type === 'success' ? '#4CAF50' :
                    type === 'error' ? '#f44336' :
                    type === 'warning' ? '#ff9800' : '#2196F3'};
        color: white;
        padding: 15px 20px;
        border-radius: 10px;
        display: flex;
        align-items: center;
        gap: 15px;
        z-index: 9999;
        box-shadow: 0 5px 20px rgba(0, 0, 0, 0.2);
        animation: slideIn 0.3s ease-out;
        font-family: inherit;
    `;

    // دکمه بستن
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.style.cssText = `
        margin-right: auto;
        background: none;
        border: none;
        color: white;
        cursor: pointer;
        font-size: 16px;
        opacity: 0.8;
        transition: opacity 0.2s;
    `;

    closeBtn.addEventListener('mouseenter', () => {
        closeBtn.style.opacity = '1';
    });

    closeBtn.addEventListener('mouseleave', () => {
        closeBtn.style.opacity = '0.8';
    });

    closeBtn.addEventListener('click', () => {
        notification.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => notification.remove(), 300);
    });

    document.body.appendChild(notification);

    // اتوماتیک پاک شدن بعد از 5 ثانیه
    setTimeout(() => {
        if (notification.parentNode) {
            notification.style.animation = 'slideOut 0.3s ease-out';
            setTimeout(() => notification.remove(), 300);
        }
    }, 5000);

    // اضافه کردن انیمیشن های CSS
    if (!document.querySelector('#notification-styles')) {
        const style = document.createElement('style');
        style.id = 'notification-styles';
        style.textContent = `
            @keyframes slideIn {
                from {
                    transform: translateY(-100px);
                    opacity: 0;
                }
                to {
                    transform: translateY(0);
                    opacity: 1;
                }
            }
            @keyframes slideOut {
                from {
                    transform: translateY(0);
                    opacity: 1;
                }
                to {
                    transform: translateY(-100px);
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(style);
    }
}

// ==================== SEARCH FUNCTIONALITY ====================
function initializeSearch() {
    const searchIcon = document.querySelector('.icon-item .fa-search')?.closest('.icon-item');

    if (searchIcon) {
        searchIcon.addEventListener('click', function() {
            showSearchModal();
        });

        // کلید میانبر جستجو
        document.addEventListener('keydown', function(e) {
            if (e.ctrlKey && e.key === 'k') {
                e.preventDefault();
                showSearchModal();
            }
        });
    }
}

function showSearchModal() {
    // حذف مودال قبلی
    const oldModal = document.querySelector('.search-modal');
    if (oldModal) oldModal.remove();

    // ایجاد مودال جستجو
    const modal = document.createElement('div');
    modal.className = 'search-modal';
    modal.innerHTML = `
        <div class="search-modal-content">
            <div class="search-header">
                <h3><i class="fas fa-search"></i> جستجوی پیشرفته</h3>
                <button class="close-modal"><i class="fas fa-times"></i></button>
            </div>
            <div class="search-input-group">
                <input type="text"
                       id="search-input"
                       placeholder="جستجوی نرم افزار، آموزش، بازی..."
                       autocomplete="off">
                <button id="search-btn"><i class="fas fa-search"></i> جستجو</button>
            </div>
            <div class="search-suggestions">
                <h4>پیشنهادهای جستجو:</h4>
                <div class="suggestion-tags">
                    <span class="tag">ویندوز 11</span>
                    <span class="tag">فتوشاپ</span>
                    <span class="tag">آنتی ویروس</span>
                    <span class="tag">بازی اندروید</span>
                    <span class="tag">آفیس 2023</span>
                    <span class="tag">برنامه نویسی</span>
                </div>
            </div>
            <div class="search-filters">
                <h4>فیلترها:</h4>
                <div class="filter-group">
                    <label><input type="checkbox" checked> نرم افزار</label>
                    <label><input type="checkbox"> آموزش</label>
                    <label><input type="checkbox"> بازی</label>
                    <label><input type="checkbox"> اندروید</label>
                </div>
            </div>
        </div>
    `;

    // استایل مودال
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 9999;
        animation: fadeIn 0.3s ease-out;
        backdrop-filter: blur(5px);
    `;

    const content = modal.querySelector('.search-modal-content');
    content.style.cssText = `
        background: ${document.body.classList.contains('dark-mode') ? '#2d2d2d' : 'white'};
        padding: 30px;
        border-radius: 15px;
        width: 90%;
        max-width: 600px;
        max-height: 80vh;
        overflow-y: auto;
        color: ${document.body.classList.contains('dark-mode') ? '#f0f0f0' : '#333'};
    `;

    document.body.appendChild(modal);

    // تنظیمات مودال
    const closeBtn = modal.querySelector('.close-modal');
    const searchInput = modal.querySelector('#search-input');
    const searchBtn = modal.querySelector('#search-btn');
    const tags = modal.querySelectorAll('.tag');

    // بستن مودال
    closeBtn.addEventListener('click', () => modal.remove());
    modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.remove();
    });

    // بستن با کلید Esc
    document.addEventListener('keydown', function closeOnEsc(e) {
        if (e.key === 'Escape') {
            modal.remove();
            document.removeEventListener('keydown', closeOnEsc);
        }
    });

    // فوکوس روی input
    setTimeout(() => searchInput.focus(), 100);

    // جستجو
    searchBtn.addEventListener('click', performSearch);
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') performSearch();
    });

    // پیشنهادات جستجو
    tags.forEach(tag => {
        tag.addEventListener('click', () => {
            searchInput.value = tag.textContent;
            searchInput.focus();
        });
    });

    function performSearch() {
        const query = searchInput.value.trim();
        if (query) {
            showNotification(`جستجو برای: "${query}"`, 'info');
            modal.remove();
            // در واقعیت اینجا باید درخواست AJAX ارسال شود
        }
    }
}

// ==================== SERVICE WORKER ====================
function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('/sw.js').then(registration => {
                console.log('ServiceWorker ثبت شد:', registration.scope);
            }).catch(error => {
                console.log('خطا در ثبت ServiceWorker:', error);
            });
        });
    }
}

// ==================== OFFLINE DETECTION ====================
function initializeOfflineDetection() {
    window.addEventListener('online', () => {
        showNotification('اتصال اینترنت برقرار شد', 'success');
    });

    window.addEventListener('offline', () => {
        showNotification('اتصال اینترنت قطع شد', 'warning');
    });
}

// ==================== SHORTCUTS ====================
document.addEventListener('keydown', function(e) {
    // میانبرهای کلی
    if (e.altKey) {
        switch(e.key) {
            case 'h': // خانه
                document.querySelector('.main-menu a[href="#"]')?.click();
                break;
            case 's': // جستجو
                showSearchModal();
                break;
            case 'd': // دانلودها
                showNotification('صفحه دانلودها', 'info');
                break;
            case 'f': // محبوب‌ها
                showNotification('علاقه‌مندی‌ها', 'info');
                break;
        }
    }
});

// ==================== INITIALIZE ALL ====================
// بعد از بارگذاری DOM، همه عملکردها را راه‌اندازی می‌کنیم
setTimeout(() => {
    initializePagination();
    initializeSearch();
    initializeOfflineDetection();

    // نمایش پیام خوش‌آمد
    setTimeout(() => {
        showNotification('به سافت 98 خوش آمدید! از میانبرها استفاده کنید: Ctrl+K برای جستجو', 'success');
    }, 2000);
}, 100);
